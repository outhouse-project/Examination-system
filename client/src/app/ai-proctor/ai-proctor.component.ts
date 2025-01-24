import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import { ExamService } from '../exams/exam.service';
import { alertTypesMap } from './alert-types-map';
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
  stream!: MediaStream;
  detectionInterval: any;
  @Input() examId = '';
  private net!: cocossd.ObjectDetection;
  private isDragging = false;
  private offsetX = 0;
  private offsetY = 0;

  constructor(private examService: ExamService) { }

  ngOnInit(): void {
    this.requestVideoPermission();
    this.loadModel();
  }

  async loadModel() {
    await tf.setBackend('webgl'); // or use 'wasm' for better performance
    await tf.ready();
    this.net = await cocossd.load();
  }

  requestVideoPermission() {
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
    })
  }

  startDetection() {
    const videoTrack = this.stream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(videoTrack);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    this.detectionInterval = setInterval(async () => {
      try {
        const bitmap = await imageCapture.grabFrame();
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        ctx?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

        const detections = await this.net.detect(canvas);
        this.checkObjects(detections);
      } catch (error) {
        console.error('Error capturing frame:', error);
      }
    }, 1500);
  }

  checkObjects(detections: cocossd.DetectedObject[]) {
    let personCount = 0;

    if (detections.length < 1) {
      this.sendAlert('face_absent');
    }

    detections.forEach((item) => {
      const objectClass = item.class;

      if (objectClass === 'cell phone') {
        this.sendAlert('mobile_use');
      }

      if (objectClass === 'book') {
        this.sendAlert('book_detected');
      }

      if (objectClass === 'person') {
        personCount++;
        if (personCount > 1) {
          this.sendAlert('multiple_faces');
        }
      }
    });
  }

  sendAlert(alertType: string) {
    this.examService.createProctorAlert(this.examId, alertType);
    alert(`${alertTypesMap[alertType]}. Action has been Recorded.`);
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
    clearInterval(this.detectionInterval);
    this.net?.dispose();
    tf.disposeVariables();
    this.stream?.getTracks().forEach(track => track.stop());
  }
}