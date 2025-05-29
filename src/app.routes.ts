import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { DashboardWirin } from './app/pages/dashboard/wirin/dashboardWirin';
import { TasksComponent } from './app/pages/wirin/tasks/tasks.component';
import { AddTaskFormComponent } from './app/pages/wirin/form-add-task/form-add-task.component';
import { EditTaskComponent } from './app/pages/wirin/form-edit-task/form-edit-task.component';
import { TaskDetailComponent } from './app/pages/wirin/task-detail/task-detail.component';
import { OcrViewerComponent } from './app/pages/wirin/ocr-viewer/ocr-viewer.component';
import { UsersListComponent } from './app/pages/wirin/users-list/users-list.component';
import { AuthGuard } from './app/guards/auth.guard';
import { LoginComponent } from './app/pages/wirin/login/login.component';
import { ProfileComponent } from './app/pages/wirin/profile/profile.component';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', component: Dashboard },
            { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },
    { path: 'login', component: LoginComponent },
    {
        path: 'wirin',
        component: AppLayout, 
        children: [
            { path: '', redirectTo: '/login', pathMatch: 'full' },
            { path: '', component: DashboardWirin, canActivate: [AuthGuard] },
            { path: 'tasks', component: TasksComponent, canActivate: [AuthGuard] },
            { path: 'add-task-form', component: AddTaskFormComponent, canActivate: [AuthGuard] },
            { path: 'edit-task-form/:id', component: EditTaskComponent, canActivate: [AuthGuard] },
            { path: 'task-detail/:id', component: TaskDetailComponent, canActivate: [AuthGuard] },
            { path: 'ocr-viewer/:id', component: OcrViewerComponent, canActivate: [AuthGuard] },
            { path: 'users', component: UsersListComponent, canActivate: [AuthGuard] },
            { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
            { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
