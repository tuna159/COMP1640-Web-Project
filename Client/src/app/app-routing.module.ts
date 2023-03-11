//app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/components/login/login.component';
import { ResetPasswordComponent } from './auth/components/reset-password/reset-password.component';
import { HomeComponent } from './home/home.component';
import { DetailComponent } from './detail/detail.component';
import { AuthGuard } from './shared/guard/auth.guard';
import { ManageCategoryComponent } from './manage-category/manage-category.component';
import { ProfileComponent } from './profile/profile.component';
import { ManageAccountComponent } from './manage-account/manage-account.component';
import { ManageSemesterComponent } from './manage-semester/manage-semester.component';

const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'reset-password',
        component: ResetPasswordComponent
    },
    {
        path: 'home',
        canActivate: [AuthGuard],
        // loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
        component: HomeComponent
    },
    {
        path: 'detail',
        canActivate: [AuthGuard],
        // loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
        component: DetailComponent
    },
    {
        path: 'manage/category',
        canActivate: [AuthGuard],
        // loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
        component: ManageCategoryComponent
    },
    {
        path: 'view/profile',
        canActivate: [AuthGuard],
        // loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
        component: ProfileComponent
    },
    // { path: '**', component: PageNotFoundComponent },
    {
        path: 'manage/account',
        canActivate: [AuthGuard],
        // loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
        component: ManageAccountComponent
    },
    {
        path: 'manage/semester',
        canActivate: [AuthGuard],
        // loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
        component: ManageSemesterComponent
    },
];




@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }