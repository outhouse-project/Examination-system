import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ExamService } from '../exam.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-result-table',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './result-table.component.html',
  styleUrl: './result-table.component.css'
})
export class ResultTableComponent implements OnInit {
  results: any[] = [];
  errorMessage = '';
  isLoading = true;
  total = 0;

  constructor(private route: ActivatedRoute, private examService: ExamService) { }

  ngOnInit(): void {
    this.fetchResults();
  }

  fetchResults(): void {
    const examId = this.route.snapshot.paramMap.get('examId')!;
    this.examService.getResults(examId).subscribe({
      next: (response: any) => {
        this.results = response.results;
        this.total = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Failed to fetch results.';
        this.isLoading = false;
      }
    });
  }
}