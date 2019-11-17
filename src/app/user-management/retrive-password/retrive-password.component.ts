import { Component, OnInit } from '@angular/core';
import { UserManagementService } from 'src/app/user-management.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-retrive-password',
  templateUrl: './retrive-password.component.html',
  styleUrls: ['./retrive-password.component.css']
})
export class RetrivePasswordComponent implements OnInit {

  constructor(
    public userService: UserManagementService,
    public _route: ActivatedRoute,
    public router: Router,
    private toastr: ToastrService,) { }
    public title :any;

  ngOnInit() {
    this.title = "Retrive Password"
  }

  public email: any;
  public retrivePasswordFunction(): any {

    if (!this.email) {
      this.toastr.warning("Email is required");
    }
    else {
      let data = {
        email: this.email,
      }
       
      this.userService.resetPassword(data)
        .subscribe((apiResponse) => {

          if (apiResponse.status == 200) {
            this.toastr.success("Password reset instructions sent successfully");

          }
          else {
            this.toastr.error(apiResponse.message);
          }
        },
          (error) => {
            if(error.status == 404){
              this.toastr.warning("Reset Password Failed", "Email Not Found!");
            }
            else{
              this.toastr.error("Some Error Occurred", "Error!");
              this.router.navigate(['/serverError']);
  
            }
              
          });
    }
  }//end retrivePassword function


}
