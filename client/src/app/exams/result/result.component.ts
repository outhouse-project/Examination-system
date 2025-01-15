import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Exam } from '../exam.interface';
import { DataService } from '../../data.service';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './result.component.html',
  styleUrl: './result.component.css'
})
export class ResultComponent {
  exam: Exam;

  constructor(private dataService: DataService) {
    this.exam = this.dataService.getData('exam');
  }
}