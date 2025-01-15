import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  setData(storageKey: string, data: any) {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }

  getData(storageKey: string) {
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : null;
  }
}
