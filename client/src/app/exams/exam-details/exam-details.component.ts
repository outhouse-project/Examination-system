import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Exam } from '../exam.interface';
import { CreateExamComponent } from '../create-exam/create-exam.component';
import { CommonModule } from '@angular/common';
import { TimeService } from '../../time.service';
import { ExamService } from '../exam.service';

@Component({
  selector: 'app-exam-details',
  standalone: true,
  imports: [CommonModule, CreateExamComponent],
  templateUrl: './exam-details.component.html',
  styleUrl: './exam-details.component.css'
})
export class ExamDetailsComponent implements OnInit {
  examDetails: Exam | undefined;
  deleteMessage: string = '';

  constructor(private route: ActivatedRoute, private router: Router,
    private timeService: TimeService, private examService: ExamService) { }

  ngOnInit(): void {
    const examId = this.route.snapshot.paramMap.get('examId')!;
    this.examService.getExamById(examId).subscribe({
      next: (data: any) => {
        this.examDetails = data.exam;
        this.examDetails!.scheduled_at = new Date(this.examDetails!.scheduled_at);
      },
      error: (error) => {
        console.error('Failed to fetch exam details:', error);
      }
    });
  }

  deleteExam(): void {
    if (confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
      this.examService.deleteExam(this.examDetails?.id!).subscribe({
        next: () => {
          this.deleteMessage = 'Exam deleted successfully!';
          setTimeout(() => {
            this.router.navigate(['../../dashboard/exams'], { relativeTo: this.route }); // Redirect to exam list
          }, 2000);
        },
        error: (error) => {
          console.error('Failed to delete exam:', error);
          this.deleteMessage = error.error.error;
        }
      });
    }
  }

  isExamInFuture(): boolean {
    return this.examDetails ? (this.examDetails.scheduled_at > this.timeService.time()!) : false;
  }
}