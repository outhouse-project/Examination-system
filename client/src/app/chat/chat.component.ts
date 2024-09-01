import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit {
  private socket: any;
  messages: string[] = [];
  newMessage: string = '';

  ngOnInit(): void {
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      this.socket.emit('message', this.newMessage);
      this.newMessage = '';
    }
  }
}