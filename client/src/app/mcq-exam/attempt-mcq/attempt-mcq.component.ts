import { Component, effect } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Exam } from '../../exams/exam.interface';
import { ExamService } from '../../exams/exam.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TimeService } from '../../time.service';
import { MCQ } from '../mcq.interface';
import { AIProctorComponent } from '../../ai-proctor/ai-proctor.component';

@Component({
  selector: 'app-attempt-mcq',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AIProctorComponent],
  templateUrl: './attempt-mcq.component.html',
  styleUrl: './attempt-mcq.component.css'
})
export class AttemptMcqComponent {
  examData: Exam;
  attemptForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  timeRemaining = '';
  examEndTime = 999999999999999;

  constructor(private examService: ExamService, private fb: FormBuilder,
    private route: ActivatedRoute, private router: Router, private timeService: TimeService) {
    this.examData = examService.getDefaultExam();
    this.attemptForm = this.fb.group({
      questions: this.fb.array([])
    });
  }

  ngOnInit(): void {
    const examId = this.route.snapshot.paramMap.get('examId')!;
    this.fetchExamData(examId);
  }

  fetchExamData(examId: string): void {
    this.examService.getExamById(examId).subscribe({
      next: (data: any) => {
        this.examData = data.exam;
        this.examData.scheduled_at = new Date(this.examData.scheduled_at);
        this.examEndTime = this.examData.scheduled_at.getTime() + this.examData.duration_in_minutes * 60 * 1000;
        this.populateQuestions(this.examData.questions!);
      },
      error: (err) => {
        this.errorMessage = 'Failed to load exam.';
      }
    });
  }

  populateQuestions(questions: MCQ[]): void {
    const questionControls = questions.map((q) =>
      this.fb.group({
        id: [q.id],
        selectedOptions: this.fb.array([]),
      })
    );
    this.attemptForm.setControl('questions', this.fb.array(questionControls));
  }

  get questionControls(): FormArray {
    return this.attemptForm.get('questions') as FormArray;
  }

  onOptionChange(questionIndex: number, optionId: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const selectedOptions = this.questionControls.at(questionIndex).get('selectedOptions') as FormArray;
    if (isChecked) {
      selectedOptions.push(this.fb.control(optionId));
    } else {
      const index = selectedOptions.controls.findIndex((x) => x.value === optionId);
      selectedOptions.removeAt(index);
    }
  }

  onSubmit(): void {
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    console.log(this.preparePayload());
    this.examService.submitExam(this.examData.id, this.preparePayload()).subscribe({
      next: () => {
        this.successMessage = 'Exam submitted successfully!';
        setTimeout(() => {
          this.router.navigate(['../..']);
        }, 2000);
      },
      error: (err) => {
        this.errorMessage = 'Failed to submit exam. ' + err.error.error;
        this.isSubmitting = false;
      }
    });
  }

  preparePayload(): any {
    const payload: any = {};
    this.questionControls.value.forEach((question: any) => {
      payload[question.id] = question.selectedOptions;
    });
    return payload;
  }

  timerEff = effect(() => {
    if (!this.timeService.time()) return;
    const timeLeft = this.examEndTime - this.timeService.time()!.getTime();
    if (timeLeft < 0) {
      this.onSubmit();
    }
    const minutes = Math.floor(timeLeft / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    this.timeRemaining = `${minutes}m ${seconds}s`;
  });
}