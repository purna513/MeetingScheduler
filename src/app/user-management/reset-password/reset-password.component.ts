import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserManagementService } from 'src/app/user-management.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  public validationToken:any;
  public password:any;
  public titleName : any;
  public confirmPassword:any;
  constructor(
    public userService: UserManagementService,
    public _route: ActivatedRoute,
    public router: Router,
    private toastr: ToastrService

  ) { }

  ngOnInit() {
    this.validationToken = this._route.snapshot.paramMap.get('validationToken');
    this.titleName ="Reset Password"

  }

  public goToSignIn(): any {
    this.router.navigate(['/login']);
  }//end of goToSign function

  public passwordUpdateFunction(): any {
    if (!this.password) {
      this.toastr.warning("Password is required", "Warning!");
    }
    else if (!this.confirmPassword) {
      this.toastr.warning("Confirm Password is required", "Warning!");
    }
    else{
      let data = {
        validationToken: this.validationToken,
        password: this.password,
      }
  
      this.userService.updatePassword(data)
        .subscribe((apiResponse) => {
  
  
          if (apiResponse.status == 200) {
            this.toastr.success("Please login", "Password Updated!");
            setTimeout(() => {
              this.goToSignIn();
            }, 1000);//redirecting to signIn page

          }
          else {
            this.toastr.error(apiResponse.message, "Error!");
          }
        },
          (error) => {
            if(error.status == 404){
              this.toastr.warning("Password Update failed", "Please request another password reset!");
            }
            else{
              this.toastr.error("Some Error Occurred", "Error!");
              this.router.navigate(['/serverError']);
  
            }
              
          });//end calling passwordUpdateFunction
  
    }
  
}//end passwordUpdateFunction function

}
