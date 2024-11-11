import { Routes } from '@angular/router';
import { ExamRoomComponent } from './video-exam/exam-room/exam-room.component';
import { LoginComponent } from './auth/login/login.component';
import { SuperAdminDashboardComponent } from './dashboards/super-admin-dashboard/super-admin-dashboard.component';
import { CollegeAdminDashboardComponent } from './dashboards/college-admin-dashboard/college-admin-dashboard.component';
import { StudentDashboardComponent } from './dashboards/student-dashboard/student-dashboard.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { RoleGuard } from './auth/role.guard';
import { authResolver } from './auth/auth.resolver';
import { SuperAdminDefaultComponent } from './dashboards/super-admin-dashboard/super-admin-default/super-admin-default.component';
import { CollegeAdminsComponent } from './dashboards/super-admin-dashboard/college-admins/college-admins.component';
import { CollegeAdminDefaultComponent } from './dashboards/college-admin-dashboard/college-admin-default/college-admin-default.component';
import { StudentsComponent } from './dashboards/college-admin-dashboard/students/students.component';
import { CollegeAdminExamsComponent } from './dashboards/college-admin-dashboard/college-admin-exams/college-admin-exams.component';
import { StudentDefaultComponent } from './dashboards/student-dashboard/student-default/student-default.component';
import { StudentExamsComponent } from './dashboards/student-dashboard/student-exams/student-exams.component';
import { StudentResultsComponent } from './dashboards/student-dashboard/student-results/student-results.component';
import { CreateExamComponent } from './exams/create-exam/create-exam.component';
import { EditExamComponent } from './exams/edit-exam/edit-exam.component';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: '/login' },
    { path: 'login', resolve: { user: authResolver }, component: LoginComponent },
    {
        path: 'super-admin', canActivate: [RoleGuard], children: [
            { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
            {
                path: 'dashboard', component: SuperAdminDashboardComponent, children: [
                    { path: '', pathMatch: 'full', component: SuperAdminDefaultComponent },
                    { path: 'college-admins', component: CollegeAdminsComponent },
                ]
            }
        ]
    },
    {
        path: 'college-admin', canActivate: [RoleGuard], children: [
            { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
            {
                path: 'dashboard', component: CollegeAdminDashboardComponent, children: [
                    { path: '', pathMatch: 'full', component: CollegeAdminDefaultComponent },
                    { path: 'students', component: StudentsComponent },
                    { path: 'exams', component: CollegeAdminExamsComponent },
                ]
            },
            { path: 'video-exam/:roomId', component: ExamRoomComponent },
            { path: 'create-exam', component: CreateExamComponent },
            { path: 'edit-exam/:examId', component: EditExamComponent },

        ]
    },
    {
        path: 'student', canActivate: [RoleGuard], children: [
            { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
            {
                path: 'dashboard', component: StudentDashboardComponent, children: [
                    { path: '', pathMatch: 'full', component: StudentDefaultComponent },
                    { path: 'exams', component: StudentExamsComponent },
                    { path: 'results', component: StudentResultsComponent },
                ]
            },
            { path: 'video-exam/:roomId', component: ExamRoomComponent }
        ]
    },
    { path: '**', component: PagenotfoundComponent }
];