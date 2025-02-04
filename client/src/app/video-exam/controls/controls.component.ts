import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-controls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './controls.component.html',
  styleUrl: './controls.component.css'
})
export class ControlsComponent {
  @Input() stream!: MediaStream;
  @Input() socket!: WebSocket;
  isVideoEnabled: boolean = true;
  isAudioEnabled: boolean = true;

  constructor(private router: Router, private route: ActivatedRoute) { }

  toggleVideo() {
    this.isVideoEnabled = !this.isVideoEnabled;
    this.stream.getVideoTracks()[0].enabled = this.isVideoEnabled;
  }

  toggleAudio() {
    this.isAudioEnabled = !this.isAudioEnabled;
    this.stream.getAudioTracks()[0].enabled = this.isAudioEnabled;
  }

  leaveRoom() {
    this.socket.close();
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}