import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Exam } from '../../../exams/exam.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CommonModule, DatePipe } from '@angular/common';
import { TimeService } from '../../../time.service';

@Component({
  selector: 'app-student-exams',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './student-exams.component.html',
  styleUrl: './student-exams.component.css'
})
export class StudentExamsComponent implements OnInit {
  exams: Exam[] = [];
  currentTime: Date = new Date();

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute,
    private timeService: TimeService) { timeService.connect(); }

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