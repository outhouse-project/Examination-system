import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { McqCreatorComponent } from '../../mcq-exam/mcq-creator/mcq-creator.component';
import { MCQ } from '../../mcq-exam/mcq.interface';

@Component({
  selector: 'app-create-exam',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, McqCreatorComponent],
  templateUrl: './create-exam.component.html',
  styleUrl: './create-exam.component.css'
})
export class CreateExamComponent {
  createExamForm: FormGroup;
  examTypes = [
    { value: 'MCQ', label: 'MCQ Mode' },
    { value: 'Video', label: 'Video Meet' }
  ];
  isSubmitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isMcqType = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.createExamForm = this.fb.group({
      exam_type: ['', Validators.required],
      title: ['', [Validators.required, Validators.maxLength(30)]],
      instructions: ['', Validators.required],
      scheduled_at: ['', Validators.required],
      duration_in_minutes: ['', [Validators.required, Validators.min(1)]],
      is_AIproctored: [false]
    });
  }

  onSubmit() {
    if (this.createExamForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.successMessage = null;
    this.errorMessage = null;
    this.createExamForm.value.scheduled_at = new Date(this.createExamForm.value.scheduled_at);
    this.http.post(environment.baseURL + 'exams/create-exam/', this.createExamForm.value).subscribe({
      next: (response: any) => {
        this.successMessage = 'Exam created successfully!';
        this.createExamForm.reset();
        this.isSubmitting = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Failed to create exam. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  onExamTypeChange(event: any) {
    this.isMcqType = event.target.value === 'MCQ';
    if (this.isMcqType) {
      this.createExamForm.addControl('questions', this.fb.array([]));
    } else {
      this.createExamForm.removeControl('questions');
    }
  }
  onQuestionsChange(questions: MCQ[]): void {
    this.createExamForm.get('questions')?.setValue(questions);
  }
}