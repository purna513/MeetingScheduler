import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RetrivePasswordComponent } from './retrive-password/retrive-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';



@NgModule({
  declarations: [LoginComponent, SignupComponent, RetrivePasswordComponent, ResetPasswordComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    
  ]
})
export class UserManagementModule { }
