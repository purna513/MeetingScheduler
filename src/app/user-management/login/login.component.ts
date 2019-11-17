import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { UserManagementService } from 'src/app/user-management.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private toastr: ToastrService,public userService: UserManagementService,public _route: ActivatedRoute,public router: Router,) { }

  public title: any;
  ngOnInit() {
    this.title ="Login to schedule appointments"
    console.log(this.title)
  }

  public email: any;
  public password: any;

  
public signInFunction(): any {

  if (!this.email) {
    this.toastr.warning("Email is required", "Warning!");
  }
  else if (!this.password) {
    this.toastr.warning("Password is required", "Warning!");
  }
  else {
    let data = {
      email: this.email,
      password: this.password,
    }

    console.log(data)  
    this.userService.signIn(data)
      .subscribe((apiResponse) => {

        if (apiResponse.status == 200) {
          this.toastr.success("Login Successfull", "Welcome to Lets Meet");
          //console.log(apiResponse.data)
          
          Cookie.set('authToken', apiResponse.data.authToken);
          Cookie.set('receiverId', apiResponse.data.userDetails.userId);
          Cookie.set('receiverName', `${apiResponse.data.userDetails.firstName} ${apiResponse.data.userDetails.lastName}`);
          this.userService.setUserInfoInLocalStorage(apiResponse.data.userDetails);
          
          this.router.navigate(['/adminView']);
          // setTimeout(() => {

          //   if(apiResponse.data.userDetails.isAdmin == "true"){
          //     this.goToAdminDashboard();
          //   }else{
          //     this.goToUserDashboard();
          //   }

          // }, 1000);//redirecting to Dashboard page

        }
        else {
          this.toastr.error(apiResponse.message, "Error!");
        }
      },
        (error) => {
          
          if(error.status == 404){
            this.toastr.warning("Login Failed", "User Not Found!");
          }
          else if(error.status == 400){
            this.toastr.warning("Login Failed", "Wrong Password");
          }
          else{
            this.toastr.error("Some Error Occurred", "Error!");
            //this.router.navigate(['/serverError']);

          }
            
        });//end calling signUpFunction
  }
}//end signInFunction 
public loginUsingKeypress: any = (event: any) => {

  if (event.keyCode === 13) { // 13 is keycode of enter.

    this.signInFunction();

  }

}
}