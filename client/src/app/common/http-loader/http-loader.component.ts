import { Component } from '@angular/core';
import { HttpLoaderService } from './http-loader.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-http-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './http-loader.component.html',
  styleUrl: './http-loader.component.css'
})
export class HttpLoaderComponent {
  isLoading$;
  constructor(private loaderService: HttpLoaderService) {
    this.isLoading$ = this.loaderService.isLoading$;
  }
}