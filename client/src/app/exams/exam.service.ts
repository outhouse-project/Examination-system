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

  createExam(value: any) {
    return this.http.post(environment.baseURL + 'exams/create-exam/', value);
  }

  editExam(id: string, value: any) {
    return this.http.put(environment.baseURL + `exams/edit-exam/${id}/`, value);
  }
}