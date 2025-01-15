import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Exam } from '../../../exams/exam.interface';
import { TimeService } from '../../../time.service';
import { CommonModule, DatePipe } from '@angular/common';
import { ExamService } from '../../../exams/exam.service';

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

  constructor(private router: Router, private route: ActivatedRoute,
    private timeService: TimeService, private examService: ExamService) { }

  ngOnInit(): void {
    this.examService.getExams().subscribe(res => {
      this.exams = res;
    });
  }

  canStartExam(scheduledTime: Date): boolean {
    return scheduledTime <= this.timeService.time()!;
  }

  isActiveOrUpcoming(endTime: Date): boolean {
    return endTime > this.timeService.time()!;
  }

  startExam(exam: Exam): void {
    if (exam.exam_type == 'Video')
      this.router.navigate(['../../video-exam', exam.id], { relativeTo: this.route });
  }
}