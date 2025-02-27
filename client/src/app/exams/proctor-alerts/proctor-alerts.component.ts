import { Component } from '@angular/core';
import { ExamService } from '../exam.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../data.service';
import { alertTypesMap } from '../../ai-proctor/alert-types-map';

@Component({
  selector: 'app-proctor-alerts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './proctor-alerts.component.html',
  styleUrl: './proctor-alerts.component.css'
})
export class ProctorAlertsComponent {
  alerts: any[] = [];
  alertCounts: { [key: string]: number } = {};
  result: any;
  alertMessage = alertTypesMap;
  recording: any = null;

  constructor(private route: ActivatedRoute, private examService: ExamService, private dataService: DataService) {
    this.result = this.dataService.getData('result');
  }

  ngOnInit(): void {
    this.fetchAlertsAndRecording();
  }

  fetchAlertsAndRecording(): void {
    const examId = this.route.parent?.snapshot.paramMap.get('examId')!;
    const studentId = this.route.snapshot.paramMap.get('studentId')!;
    this.examService.getAlerts(examId, studentId).subscribe({
      next: (response: any) => {
        this.alerts = response.alerts;
        this.countAlerts();
      },
      error: (error) => {
        console.error('Error fetching alerts:', error);
      }
    });

    this.examService.getRecording(examId, studentId).subscribe({
      next: (response: any) => {
        console.log(response.video_url);
        this.recording = response;
      },
      error: (error) => {
        console.error('Error fetching recording:', error);
      }
    })
  }

  countAlerts(): void {
    this.alertCounts = this.alerts.reduce((acc, alert) => {
      acc[alert.alert_type] = (acc[alert.alert_type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }
}