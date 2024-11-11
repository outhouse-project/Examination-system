import { Injectable, signal } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TimeService {
  private timeSocket!: WebSocket;
  time = signal<string>('');

  constructor() { }

  connect(): void {
    this.timeSocket = new WebSocket(environment.baseURL.replace(/^http/, 'ws') + 'ws/time/');

    this.timeSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.time.set(data.server_time);
    };
  }
}