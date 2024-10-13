import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Peer from 'peerjs';
import { AuthService } from '../../auth/auth.service';

interface Message {
  peerId: string,
  sender: string,
  content: string
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  @Input() peer!: Peer;
  @Input() socket!: WebSocket;
  messages: Message[] = [];
  messageContent: string = '';

  constructor(private authService: AuthService) { }

  onMessageReceived(peerId: string, sender: string, content: string) {
    if (peerId === this.peer.id) {
      sender = 'You';
      this.messageContent = '';
    }
    this.messages.push({
      peerId: peerId,
      sender: sender,
      content: content
    });
  }

  sendMessage() {
    if (this.messageContent.trim() === '') return;
    this.socket.send(JSON.stringify({
      type: 'chat',
      peerId: this.peer.id,
      sender: this.authService.user()?.first_name + ' ' + this.authService.user()?.last_name,
      content: this.messageContent
    }));
  }

  trackMessage(index: number, message: Message) {
    return message.peerId;
  }
}