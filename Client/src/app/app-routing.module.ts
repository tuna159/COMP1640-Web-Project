import { ManageAccountComponent } from './manage-account/manage-account.component';
import { ChartsComponent } from './charts/charts.component';
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
import { ManageEventComponent } from './manage-event/manage-event.component';
import { EventComponent } from './event/event.component';
import { RoleGuardService } from './shared/guard/RoleGuardService';
import { IdeaEventComponent } from './idea-event/idea-event.component';
import { ManageDepartmentComponent } from './manage-department/manage-department.component';
import { IdeaCategoryComponent } from './idea-category/idea-category.component';
// import { IdeaCategoryComponent } from './idea-category/idea-category.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginComponent,
  },
  // {
  //   path: '/reset-password',
  //   component: ResetPasswordComponent,
  // },
  {
    path: 'event',
    canActivate: [AuthGuard],
    // loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
    component: EventComponent,
  },
  {
    path: 'detail',
    canActivate: [AuthGuard],
    component: DetailComponent,
  },
  {
    path: 'manage/category',
    canActivate: [RoleGuardService],
    data: {
      expectedRole: [2],
    },
    component: ManageCategoryComponent,
  },
  {
    path: 'view/profile',
    canActivate: [RoleGuardService],
    data: {
      expectedRole: [2, 3, 4],
    },
    component: ProfileComponent,
  },
  {
    path: 'charts',
    canActivate: [RoleGuardService],
    data: {
      expectedRole: [1],
    },
    component: ChartsComponent,
  },
  // { path: '**', component: PageNotFoundComponent },
  {
    path: 'manage/account',
    canActivate: [RoleGuardService],
    data: {
      expectedRole: [1],
    },
    component: ManageAccountComponent,
  },
  {
    path: 'manage/event',
    canActivate: [RoleGuardService],
    data: {
      expectedRole: [1],
    },
    // loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
    component: ManageEventComponent,
  },
  {
    path: 'manage/department',
    canActivate: [RoleGuardService],
    data: {
      expectedRole: [1],
    },
    component: ManageDepartmentComponent,
  },
  {
    path: 'home',
    canActivate: [AuthGuard],
    component: HomeComponent,
  },
  {
    path: 'charts',
    canActivate: [RoleGuardService],
    data: {
      expectedRole: [1],
    },
    component: ChartsComponent,
  },
  {
    path: 'event/ideas',
    canActivate: [AuthGuard],
    component: IdeaEventComponent,
  },
  {
    path: 'category/ideas',
    canActivate: [AuthGuard],
    component: IdeaCategoryComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
