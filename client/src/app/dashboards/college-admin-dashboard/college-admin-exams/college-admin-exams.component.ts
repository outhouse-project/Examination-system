import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { Exam } from '../../../exams/exam.interface';
import { HttpClient } from '@angular/common/http';
import { TimeService } from '../../../time.service';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-college-admin-exams',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './college-admin-exams.component.html',
  styleUrl: './college-admin-exams.component.css'
})
export class CollegeAdminExamsComponent {
  exams: Exam[] = [];
  currentTime: Date = new Date();

  constructor(private http: HttpClient, private router: Router,
    private route: ActivatedRoute, private timeService: TimeService) { timeService.connect(); }

  ngOnInit(): void {
    this.getExams();
  }

  getExams(): void {
    this.http.get<any>(environment.baseURL + 'exams/list-exams/').subscribe((response) => {
      this.exams = response.exams;
    });
  }

  canStartExam(scheduledTime: Object): boolean {
    return scheduledTime <= this.timeService.time();
  }

  startExam(exam: Exam): void {
    if (exam.exam_type === 'Video')
      this.router.navigate(['../../video-exam', exam.id], { relativeTo: this.route });
  }
}