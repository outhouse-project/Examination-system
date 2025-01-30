import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TimeService } from '../../time.service';
import { ExamService } from '../exam.service';
import { Exam } from '../exam.interface';
import { DataService } from '../../data.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-past-exams',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './past-exams.component.html',
  styleUrl: './past-exams.component.css'
})
export class PastExamsComponent implements OnInit {
  exams: Exam[] = [];
  currentTime: Date = new Date();

  constructor(private router: Router, private route: ActivatedRoute, private dataService: DataService,
    public authService: AuthService, private timeService: TimeService, private examService: ExamService) { }

  ngOnInit(): void {
    this.examService.getExams().subscribe(res => {
      this.exams = res;
    });
  }

  canViewResult(endTime: Date): boolean {
    return endTime <= this.timeService.time()!;
  }

  viewResult(exam: Exam): void {
    this.dataService.setData('exam', exam);
    this.router.navigate(['./', exam.id], { relativeTo: this.route });
  }
}