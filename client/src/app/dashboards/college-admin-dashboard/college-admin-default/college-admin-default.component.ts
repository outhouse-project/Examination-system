import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-college-admin-default',
  standalone: true,
  imports: [NgxChartsModule],
  templateUrl: './college-admin-default.component.html',
  styleUrl: './college-admin-default.component.css'
})
export class CollegeAdminDefaultComponent implements OnInit {
  analytics: any;
  proctoringAlertsChart = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get(environment.baseURL + 'analytics/college-admin/').subscribe({
      next: (data: any) => {
        this.analytics = data;

        // Bar Chart: Proctoring Alerts
        this.proctoringAlertsChart = data.proctoring_alerts.map((alert: any) => ({
          name: alert.alert_type,
          value: alert.count,
        }));
      },
      error: (err) => {
        console.error(err.error?.error)
      }
    });
  }
}