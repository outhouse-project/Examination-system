import { Routes } from '@angular/router';
import { ExamRoomComponent } from './video-exam/exam-room/exam-room.component';
import { ExamsComponent } from './exams/exams.component';
import { LoginComponent } from './auth/login/login.component';
import { SuperAdminDashboardComponent } from './dashboards/super-admin-dashboard/super-admin-dashboard.component';
import { CollegeAdminDashboardComponent } from './dashboards/college-admin-dashboard/college-admin-dashboard.component';
import { StudentDashboardComponent } from './dashboards/student-dashboard/student-dashboard.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { RoleGuard } from './auth/role.guard';
import { authResolver } from './auth/auth.resolver';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: '/login' },
    { path: 'login', resolve: { user: authResolver }, component: LoginComponent },
    {
        path: 'super-admin', canActivate: [RoleGuard], children: [
            { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
            { path: 'dashboard', component: SuperAdminDashboardComponent }
        ]
    },
    {
        path: 'college-admin', canActivate: [RoleGuard], children: [
            { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
            { path: 'dashboard', component: CollegeAdminDashboardComponent }
        ]
    },
    {
        path: 'student', canActivate: [RoleGuard], children: [
            { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
            { path: 'dashboard', component: StudentDashboardComponent },
            { path: 'video-exam', component: ExamsComponent },
            { path: 'video-exam/:roomId', component: ExamRoomComponent }
        ]
    },
    { path: '**', component: PagenotfoundComponent }
];