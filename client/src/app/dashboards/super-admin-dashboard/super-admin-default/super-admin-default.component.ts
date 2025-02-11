import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-super-admin-default',
  standalone: true,
  imports: [NgxChartsModule],
  templateUrl: './super-admin-default.component.html',
  styleUrl: './super-admin-default.component.css'
})
export class SuperAdminDefaultComponent implements OnInit {
  analytics: any;
  examTypeChart: any[] = [];
  proctoringAlertsChart = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get(environment.baseURL + 'analytics/super-admin/').subscribe({
      next: (data: any) => {
        this.analytics = data;

        // Pie Chart: AI Proctored vs. Regular Exams
        this.examTypeChart = [
          { name: 'AI Proctored', value: data.ai_proctored_exams },
          { name: 'Regular', value: data.regular_exams },
        ];

        // Bar Chart: Proctoring Alerts
        this.proctoringAlertsChart = data.proctoring_alerts.map((alert: any) => ({
          name: alert.alert_type,
          value: alert.count,
        }));
      },
      error: (err) => {
        console.error(err.error?.error);
      }
    });
  }
}