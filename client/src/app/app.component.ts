import { Component, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { TimeService } from './time.service';
import { HttpLoaderComponent } from './common/http-loader/http-loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpLoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  constructor(private authService: AuthService, private timeService: TimeService) { }

  timeUpdate = effect(() => {
    if (this.authService.user()) {
      this.timeService.connect();
    } else {
      this.timeService.disconnect();
    }
  })
}