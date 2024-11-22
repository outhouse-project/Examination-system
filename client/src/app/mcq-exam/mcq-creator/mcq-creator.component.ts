import { Component, EventEmitter, Output, output } from '@angular/core';
import { MCQ } from '../mcq.interface';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mcq-creator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mcq-creator.component.html',
  styleUrl: './mcq-creator.component.css'
})
export class McqCreatorComponent {
  // questionsChange = output<any>(); 
  @Output() questionsChange = new EventEmitter<MCQ[]>();
  mcqForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.mcqForm = this.fb.group({
      questions: this.fb.array([]) // Form array to handle dynamic questions
    });
  }

  get questions(): FormArray {
    return this.mcqForm.get('questions') as FormArray;
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
    this.emitChanges();
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
    this.emitChanges();
  }

  removeOption(questionIndex: number, optionIndex: number): void {
    const options = this.getOptions(questionIndex);
    options.removeAt(optionIndex);
    this.emitChanges();
  }

  emitChanges(): void {
    if (this.mcqForm.valid) {
      this.questionsChange.emit(this.mcqForm.value.questions);
    }
  }
}