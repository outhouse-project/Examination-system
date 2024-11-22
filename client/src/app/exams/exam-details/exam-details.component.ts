import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Exam } from '../exam.interface';
import { CreateExamComponent } from '../create-exam/create-exam.component';

@Component({
  selector: 'app-exam-details',
  standalone: true,
  imports: [CreateExamComponent],
  templateUrl: './exam-details.component.html',
  styleUrl: './exam-details.component.css'
})
export class ExamDetailsComponent implements OnInit {
  examDetails: Exam | undefined;

  constructor(private http: HttpClient, private route: ActivatedRoute) { }

  ngOnInit(): void {
    const examId = this.route.snapshot.paramMap.get('examId');
    this.http.get(environment.baseURL + `exams/exam-details/${examId}/`).subscribe({
      next: (data: any) => {
        this.examDetails = data.exam;
      },
      error: (error) => {
        console.error('Failed to fetch exam details:', error);
      }
    });
  }
}