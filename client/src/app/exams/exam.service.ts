import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { map } from 'rxjs';
import { Exam } from './exam.interface';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  constructor(private http: HttpClient) { }

  getExams() {
    return this.http.get(environment.baseURL + 'exams/list-exams/').pipe(
      map((response: any) => {
        return response.exams.map((exam: Exam) => ({
          ...exam,
          scheduled_at: new Date(exam.scheduled_at)
        }));
      })
    )
  }

  getExamById(id: string) {
    return this.http.get(environment.baseURL + `exams/exam-details/${id}/`);
  }

  getDefaultExam() {
    return {
      id: '',
      title: '',
      instructions: '',
      exam_type: '',
      scheduled_at: new Date(),
      duration_in_minutes: 0,
      is_AI_proctored: false,
      questions: [{
        id: '',
        question: '',
        options: [{ id: '', option: '', is_correct: false }]
      }]
    };
  }

  createExam(value: any) {
    return this.http.post(environment.baseURL + 'exams/create-exam/', value);
  }

  editExam(id: string, value: any) {
    return this.http.put(environment.baseURL + `exams/edit-exam/${id}/`, value);
  }

  submitExam(id: string, ans: any) {
    return this.http.post(environment.baseURL + `exams/submit-exam/${id}/`, ans);
  }

  deleteExam(id: string) {
    return this.http.delete(environment.baseURL + `exams/delete-exam/${id}/`);
  }
}