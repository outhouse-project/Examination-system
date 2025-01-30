import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpLoaderService {

  constructor() { }

  private loading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.loading.asObservable();

  show() {
    this.loading.next(true);
  }

  hide() {
    this.loading.next(false);
  }
}