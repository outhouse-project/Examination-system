import { Injectable, signal } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TimeService {
  private timeSocket!: WebSocket;
  time = signal<Date | null>(null);
  private timeUpdate: any;

  constructor() { }

  connect(): void {
    this.timeSocket = new WebSocket(environment.baseURL.replace(/^http/, 'ws') + 'ws/time/');

    this.timeSocket.onmessage = (event) => {
      clearInterval(this.timeUpdate);

      const data = JSON.parse(event.data);
      this.time.set(new Date(data.server_time));

      this.timeUpdate = setInterval(() => {
        this.time.set(new Date(this.time()!.getTime() + 1000));
      }, 1000);
    };
  }

  disconnect(): void {
    this.timeSocket?.close();
    clearInterval(this.timeUpdate);
  }
}