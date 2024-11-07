import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimeService {
  private timeSocket!: WebSocket;
  time = signal<string | null>(null);

  constructor() { }

  connect(): void {
    this.timeSocket = new WebSocket('ws://localhost:8000/ws/time/');

    this.timeSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.time.set(data.server_time);
    };
  }
}