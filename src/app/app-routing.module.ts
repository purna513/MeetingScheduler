import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './user-management/login/login.component';
import { SignupComponent } from './user-management/signup/signup.component';
import { RetrivePasswordComponent } from './user-management/retrive-password/retrive-password.component';
import { ResetPasswordComponent } from './user-management/reset-password/reset-password.component';
import { UserViewComponent } from './user-slot-management/user-view/user-view.component';
import { AdminViewComponent } from './user-slot-management/admin-view/admin-view.component';

const routes: Routes = [
    {path: 'login',component: LoginComponent},
    {path: 'signup',component: SignupComponent},
    {path: 'userView',component: UserViewComponent},
    {path: 'adminView',component: AdminViewComponent},
    {path: 'retrivePassword',component: RetrivePasswordComponent},
    {path :'resetPassword/:validationToken', component:ResetPasswordComponent},
    { path: '', redirectTo: 'login', pathMatch: 'full' },
  ];
  




@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }