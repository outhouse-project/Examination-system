import { Routes } from '@angular/router';
import { ExamRoomComponent } from './exam-room/exam-room.component';
import { ExamsComponent } from './exams/exams.component';

export const routes: Routes = [
    { path: 'video-exam', component: ExamsComponent },
    { path: 'video-exam/:roomId', component: ExamRoomComponent }
];