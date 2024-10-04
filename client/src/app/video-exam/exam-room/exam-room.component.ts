import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import Peer, { MediaConnection } from 'peerjs';
import { CommonModule } from '@angular/common';
import { ChatComponent } from '../chat/chat.component';
import { ControlsComponent } from '../controls/controls.component';
import { environment } from '../../../environments/environment';

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
  remoteStreams: MediaStream[] = [];
  calls: Map<string, MediaConnection> = new Map();
  localStream!: MediaStream;
  socket!: WebSocket;

  constructor() {
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
          this.addStream(call);
        } else if (data['type'] === 'user_disconnected') {
          this.calls.get(data['peerId'])?.close();
        }
      }
      const event = {
        type: 'join-room',
        peerId: this.peerId,
        roomId: this.roomId
      };
      this.socket.send(JSON.stringify(event));
    };
  }

  addStream(call: MediaConnection) {
    call.once('stream', remoteStream => {
      this.remoteStreams.push(remoteStream);
      this.onDiconnect(call, remoteStream);
    });
    this.calls.set(call.peer, call);
  }

  onDiconnect(call: MediaConnection, stream: MediaStream) {
    call.on('close', () => {
      this.remoteStreams = this.remoteStreams.filter((remoteStream) => remoteStream.id !== stream.id);
      this.calls.delete(call.peer);
    });
  }

  ngOnDestroy() {
    this.socket.close();
  }
}