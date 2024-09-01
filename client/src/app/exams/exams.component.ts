import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './exams.component.html',
  styleUrl: './exams.component.css'
})
export class ExamsComponent {

  constructor(private router: Router) { }

  joinRoom(roomId: string) {
    if (roomId.trim() === '') return;
    this.router.navigate(['/video-exam', roomId]);
  }
}