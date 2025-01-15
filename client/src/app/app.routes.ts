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
import { CreateExamComponent } from './exams/create-exam/create-exam.component';
import { ExamDetailsComponent } from './exams/exam-details/exam-details.component';
import { AttemptMcqComponent } from './mcq-exam/attempt-mcq/attempt-mcq.component';
import { ResultComponent } from './exams/result/result.component';
import { PastExamsComponent } from './exams/past-exams/past-exams.component';
import { ResultTableComponent } from './exams/result-table/result-table.component';
import { ResponsesComponent } from './mcq-exam/responses/responses.component';

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
                    { path: 'results', component: PastExamsComponent },
                    {
                        path: 'results/:examId', component: ResultComponent, children: [
                            { path: '', pathMatch: 'full', component: ResultTableComponent },
                            { path: ':studentId', component: ResponsesComponent }
                        ]
                    }
                ]
            },
            { path: 'video-exam/:roomId', component: ExamRoomComponent },
            { path: 'create-exam', component: CreateExamComponent },
            { path: 'exam-details/:examId', component: ExamDetailsComponent },
        ]
    },
    {
        path: 'student', canActivate: [RoleGuard], children: [
            { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
            {
                path: 'dashboard', component: StudentDashboardComponent, children: [
                    { path: '', pathMatch: 'full', component: StudentDefaultComponent },
                    { path: 'exams', component: StudentExamsComponent },
                    { path: 'results', component: PastExamsComponent },
                    {
                        path: 'results/:examId', component: ResultComponent, children: [
                            { path: '', pathMatch: 'full', component: ResultTableComponent },
                            { path: ':studentId', component: ResponsesComponent }
                        ]
                    }
                ]
            },
            { path: 'video-exam/:roomId', component: ExamRoomComponent },
            { path: 'mcq-exam/:examId', component: AttemptMcqComponent }
        ]
    },
    { path: '**', component: PagenotfoundComponent }
];