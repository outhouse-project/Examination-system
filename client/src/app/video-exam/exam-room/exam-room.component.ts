import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import Peer, { MediaConnection } from 'peerjs';
import { CommonModule } from '@angular/common';
import { ChatComponent } from '../chat/chat.component';
import { ControlsComponent } from '../controls/controls.component';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/auth.service';

interface RemoteStreamInfo {
  stream: MediaStream;
  firstName: string;
  lastName: string;
  peerId: string;
}

@Component({
  selector: 'app-exam-room',
  standalone: true,
  imports: [CommonModule, ChatComponent, ControlsComponent],
  templateUrl: './exam-room.component.html',
  styleUrls: ['./exam-room.component.css'],
})
export class ExamRoomComponent implements OnInit, OnDestroy {
  peer: Peer;
  peerId!: string;
  @Input() roomId = '';
  remoteStreams: RemoteStreamInfo[] = [];
  localStream!: MediaStream;
  socket!: WebSocket;

  constructor(private authService: AuthService) {
    this.peer = new Peer();
  }

  ngOnInit() {
    this.setupPeer();
  }

  setupPeer() {
    this.peer.on('open', id => {
      this.peerId = id;
      console.log('Peer ID: ', id);
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
        this.localStream = stream;
      });
      this.peer.on('call', call => {
        call.answer(this.localStream);
        this.addStream(call);
      });
      this.setupSocket();
    });
  }

  setupSocket() {
    this.socket = new WebSocket(environment.baseURL.replace(/^http/, 'ws') + 'ws/call/');
    this.socket.onopen = () => {
      console.log('WebSocket connection established');
      this.socket.onmessage = (message) => {
        const data = JSON.parse(message.data);
        if (data['type'] === 'user_connected') {
          const call = this.peer.call(data['peerId'], this.localStream);
          this.addStream(call, data['firstName'], data['lastName']);
        } else if (data['type'] === 'user_disconnected') {
          this.deleteStream(data['peerId']);
        }
      }
      const event = {
        type: 'join-room',
        peerId: this.peerId,
        roomId: this.roomId,
        firstName: this.authService.user()?.first_name,
        lastName: this.authService.user()?.last_name
      };
      this.socket.send(JSON.stringify(event));
    };
  }

  addStream(call: MediaConnection, firstName = '', lastName = '') {
    call.once('stream', remoteStream => {
      const remoteStreamInfo: RemoteStreamInfo = {
        stream: remoteStream,
        firstName: firstName,
        lastName: lastName,
        peerId: call.peer,
      };
      this.remoteStreams.push(remoteStreamInfo);
    });
  }

  deleteStream(peer: string) {
    this.remoteStreams = this.remoteStreams.filter(streamInfo => streamInfo.peerId !== peer);
  }

  ngOnDestroy() {
    this.socket.close();
  }
}