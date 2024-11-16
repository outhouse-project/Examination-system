import { Injectable, signal } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TimeService {
  private timeSocket!: WebSocket;
  time = signal<Date>(new Date('2080-12-28T10:46:44.105Z'));
  private timeUpdate: any;

  constructor() { }

  connect(): void {
    this.timeSocket = new WebSocket(environment.baseURL.replace(/^http/, 'ws') + 'ws/time/');

    this.timeSocket.onmessage = (event) => {
      clearInterval(this.timeUpdate);

      const data = JSON.parse(event.data);
      this.time.set(new Date(data.server_time));

      this.timeUpdate = setInterval(() => {
        const date = this.time();
        date.setSeconds(date.getSeconds() + 1);
        this.time.set(date);
      }, 1000);
    };
  }

  disconnect(): void {
    this.timeSocket?.close();
    clearInterval(this.timeUpdate);
  }
}