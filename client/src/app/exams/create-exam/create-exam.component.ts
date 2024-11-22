import { CommonModule } from '@angular/common';
import { Component, effect, input, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { futureDateValidator } from './future-date.validator';
import { ExamService } from '../exam.service';
import { Exam } from '../exam.interface';

@Component({
  selector: 'app-create-exam',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-exam.component.html',
  styleUrl: './create-exam.component.css'
})
export class CreateExamComponent {
  // @Input() examData: Exam | undefined;
  examData = input<Exam | undefined>();
  createExamForm: FormGroup;
  examTypes = [
    { value: 'MCQ', label: 'MCQ Mode' },
    { value: 'Video', label: 'Video Meet' }
  ];
  isSubmitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isMcqType = false;

  constructor(private fb: FormBuilder, private examService: ExamService) {
    this.createExamForm = this.fb.group({
      exam_type: ['', Validators.required],
      title: ['', [Validators.required, Validators.maxLength(30)]],
      instructions: ['', Validators.required],
      scheduled_at: ['', [Validators.required, futureDateValidator]],
      duration_in_minutes: ['', [Validators.required, Validators.min(1)]],
      is_AIproctored: [false],
      questions: this.fb.array([])
    });
  }

  examDataEff = effect(() => {
    if (this.examData()) this.populateForm(this.examData()!);
  })

  populateForm(data: Exam): void {
    this.createExamForm.patchValue({
      exam_type: data.exam_type,
      title: data.title,
      instructions: data.instructions,
      scheduled_at: data.scheduled_at,
      duration_in_minutes: data.duration_in_minutes,
      is_AIproctored: data.is_AI_proctored
    });

    // Handle MCQ-specific fields
    if (data.exam_type === 'MCQ' && data.questions) {
      this.isMcqType = true;
      this.createExamForm.setControl('questions', this.fb.array([]));
      data.questions.forEach((q: any) => {
        const questionGroup = this.fb.group({
          text: [q.text, Validators.required],
          options: this.fb.array(
            q.options.map((o: any) =>
              this.fb.group({
                text: [o.text, Validators.required],
                is_correct: [o.is_correct]
              })
            )
          )
        });
        this.questions.push(questionGroup);
      });
    } else {
      this.isMcqType = false;
    }
  }

  onSubmit() {
    if (this.createExamForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.successMessage = null;
    this.errorMessage = null;
    this.createExamForm.value.scheduled_at = new Date(this.createExamForm.value.scheduled_at);

    this.examData() ? this.examService.editExam(this.examData()!.id, this.createExamForm.value) :
      this.examService.createExam(this.createExamForm.value)
        .subscribe({
          next: (response: any) => {
            this.successMessage = 'Exam saved successfully!';
            this.createExamForm.reset();
            this.isSubmitting = false;
          },
          error: (error) => {
            this.errorMessage = error.error?.error || 'Failed to save exam. Please try again.';
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

  get questions(): FormArray {
    return this.createExamForm.get('questions') as FormArray;
  }

  addQuestion(): void {
    const questionGroup = this.fb.group({
      text: ['', Validators.required],
      options: this.fb.array([])
    });
    this.questions.push(questionGroup);
    this.addOption(this.questions.length - 1); // Add one option by default
  }

  removeQuestion(index: number): void {
    this.questions.removeAt(index);
  }

  getOptions(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

  addOption(questionIndex: number): void {
    const options = this.getOptions(questionIndex);
    options.push(
      this.fb.group({
        text: ['', Validators.required],
        is_correct: [false] // Checkbox for marking correct answer
      })
    );
  }

  removeOption(questionIndex: number, optionIndex: number): void {
    const options = this.getOptions(questionIndex);
    options.removeAt(optionIndex);
  }
}