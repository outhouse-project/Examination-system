import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExamService } from '../../exams/exam.service';
import { CommonModule } from '@angular/common';

interface Responses {
  question: string,
  score: number,
  options: {
    id: number,
    text: string,
    is_correct: boolean,
    is_selected: boolean
  }[];
}

@Component({
  selector: 'app-responses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './responses.component.html',
  styleUrl: './responses.component.css'
})
export class ResponsesComponent implements OnInit {
  responses: { [questionId: string]: Responses } = {};
  totalScore = 0;
  isLoading = true;
  errorMessage = '';

  constructor(private route: ActivatedRoute, private examService: ExamService) { }

  ngOnInit(): void {
    this.fetchResponses();
  }

  fetchResponses(): void {
    const examId = this.route.parent?.snapshot.paramMap.get('examId')!;
    const studentId = this.route.snapshot.paramMap.get('studentId')!;
    this.examService.getResponses(examId, studentId).subscribe({
      next: (data: any) => {
        this.responses = data.responses;
        this.isLoading = false;
        this.calculateScores();
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'An error occurred while fetching responses.';
        this.isLoading = false;
      },
    });
  }

  calculateScores(): void {
    for (const questionId in this.responses) {
      const question = this.responses[questionId];

      // Calculate question score: full points only if selected options match correct options
      const questionScore = question.options.every((option) => option.is_correct == option.is_selected) ? 1 : 0;

      // Add question score to total score
      this.totalScore += questionScore;

      // Attach score to the question object for display in the template
      question.score = questionScore;
    }
  }

  get questionCount() {
    return Object.keys(this.responses).length;
  }
}