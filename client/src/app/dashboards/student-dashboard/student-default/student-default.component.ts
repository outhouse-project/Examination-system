import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-student-default',
  standalone: true,
  imports: [NgxChartsModule],
  templateUrl: './student-default.component.html',
  styleUrl: './student-default.component.css'
})
export class StudentDefaultComponent implements OnInit {
  analytics: any;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get(environment.baseURL + 'analytics/student/').subscribe({
      next: (data: any) => {
        this.analytics = data;
      },
      error: (err) => {
        console.error(err.error?.error)
      }
    });
  }
}