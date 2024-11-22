import { Component } from '@angular/core';
import { EditExamComponent } from '../edit-exam/edit-exam.component';

@Component({
  selector: 'app-exam-details',
  standalone: true,
  imports: [EditExamComponent],
  templateUrl: './exam-details.component.html',
  styleUrl: './exam-details.component.css'
})
export class ExamDetailsComponent {

}
