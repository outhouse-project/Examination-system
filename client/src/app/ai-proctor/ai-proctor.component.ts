import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FilesetResolver, FaceLandmarker, ObjectDetector } from '@mediapipe/tasks-vision';
import { ExamService } from '../exams/exam.service';
import { alertTypesMap } from './alert-types-map';
import Swal from 'sweetalert2';

declare var ImageCapture: any;

@Component({
  selector: 'app-ai-proctor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-proctor.component.html',
  styleUrl: './ai-proctor.component.css'
})
export class AIProctorComponent implements OnInit {
  @ViewChild('videoContainer') videoContainer!: ElementRef;
  isVideoVisible = true;
  isPermissionBlocked = true;
  isFullscreen = false;
  stream!: MediaStream;
  detectionLoop: any;
  @Input() examId = '';
  private faceLandmarker!: FaceLandmarker;
  private objectDetector!: ObjectDetector;
  private isDragging = false;
  private offsetX = 0;
  private offsetY = 0;
  private fullscreenChangeHandler = this.onFullscreenChange.bind(this);

  constructor(private examService: ExamService) { }

  ngOnInit(): void {
    document.addEventListener('fullscreenchange', this.fullscreenChangeHandler);
    this.requestPermission();
    this.initModels();
  }

  onFullscreenChange(): void {
    if (document.fullscreenElement) {
      this.isFullscreen = true;
    } else {
      this.isFullscreen = false;
      this.sendAlert('fullscreen_exited');
    }
  }

  async initModels() {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
    );

    // Initialize face landmarker
    this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU'
      },
      outputFacialTransformationMatrixes: true,
      runningMode: 'VIDEO',
      numFaces: 1
    });

    // Initialize object detector
    this.objectDetector = await ObjectDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite',
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      maxResults: 5,
      scoreThreshold: 0.5
    });
  }

  requestPermission() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      this.stream = stream;
      this.isPermissionBlocked = false;
      this.stream.getTracks().forEach(track => {
        track.onended = () => {
          this.isPermissionBlocked = true;
          alert('Camera or mic access was revoked. Please grant permission again.');
        };
      });
      this.startDetection();
    }).catch(error => {
      console.error('Camera access denied or not available:', error);
      this.isPermissionBlocked = true;
    });

    document.documentElement.requestFullscreen().then(() => {
      this.isFullscreen = true;
    }).catch(error => this.isFullscreen = false);
  }

  startDetection() {
    const videoTrack = this.stream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(videoTrack);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    this.detectionLoop = setInterval(async () => {
      try {
        const bitmap = await imageCapture.grabFrame();
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        ctx?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

        const now = Date.now();
        const detections = await Promise.all([
          this.faceLandmarker.detectForVideo(canvas, now),
          this.objectDetector.detectForVideo(canvas, now)
        ]);
        this.processDetections(detections[0], detections[1]);
      } catch (error) {
        console.error('Error capturing frame:', error);
      }
    }, 2000);
  }

  processDetections(faceResults: any, objectResults: any) {
    let personCount = 0;
    // Check for prohibited objects
    objectResults.detections.forEach((detection: any) => {
      const category = detection.categories[0].categoryName.toLowerCase();
      if (category === 'person') {
        personCount++;
      }
      if (category.includes('cell phone') || category.includes('mobile phone')) {
        this.sendAlert('mobile_use');
      }
      if (category.includes('book') || category.includes('notebook')) {
        this.sendAlert('book_detected');
      }
    });

    // Face presence checks
    if (personCount > 1) {
      this.sendAlert('multiple_faces');
    } else if (personCount == 0) {
      this.sendAlert('face_absent');
    } else if (faceResults.facialTransformationMatrixes) {
      if (faceResults.facialTransformationMatrixes.length == 0) {
        this.sendAlert('face_absent');
      } else {
        // Head pose detection
        const matrix = faceResults.facialTransformationMatrixes[0].data;
        const angles = this.computeEulerAngles(matrix);
        if (Math.abs(angles.yaw) > 18 || Math.abs(angles.pitch) > 18) {
          this.sendAlert('looking_away');
        }
      }
    }
  }

  private computeEulerAngles(matrix: number[]): { pitch: number, yaw: number, roll: number } {
    const R = [
      matrix[0], matrix[4], matrix[8],   // Rotation matrix rows
      matrix[1], matrix[5], matrix[9],
      matrix[2], matrix[6], matrix[10]
    ];

    // Calculate pitch (vertical head rotation)
    const pitch = -Math.asin(R[2]) * 180 / Math.PI;

    // Calculate yaw (horizontal head rotation)
    const yaw = Math.atan2(R[1], R[0]) * 180 / Math.PI;

    return {
      pitch: Number(pitch.toFixed(1)),
      yaw: Number(yaw.toFixed(1)),
      roll: 0 // Roll not needed for this detection
    };
  }

  sendAlert(alertType: string) {
    this.examService.createProctorAlert(this.examId, alertType).subscribe({
      next: (data: any) => {
        Swal.fire({
          title: alertTypesMap[alertType], text: 'Action has been Recorded.',
          icon: 'warning', timer: 4000
        });
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  onDragStart(event: MouseEvent): void {
    const container = this.videoContainer.nativeElement;
    this.isDragging = true;
    this.offsetX = event.clientX - container.offsetLeft;
    this.offsetY = event.clientY - container.offsetTop;
    container.style.cursor = 'grabbing';
  }

  onDragging(event: MouseEvent): void {
    if (!this.isDragging) return;
    const container = this.videoContainer.nativeElement;
    container.style.left = `${event.clientX - this.offsetX}px`;
    container.style.top = `${event.clientY - this.offsetY}px`;
  }

  onDragEnd(): void {
    this.isDragging = false;
    const container = this.videoContainer.nativeElement;
    container.style.cursor = 'grab';
  }

  toggleVideo(): void {
    this.isVideoVisible = !this.isVideoVisible;
  }

  ngOnDestroy() {
    clearInterval(this.detectionLoop);
    this.faceLandmarker?.close();
    this.objectDetector?.close();
    this.stream?.getTracks().forEach(track => track.stop());
    document.exitFullscreen().then(() => document.removeEventListener('fullscreenchange', this.fullscreenChangeHandler));
  }
}