import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserManagementService } from 'src/app/user-management.service';
import countryList from '../../../assets/names.json';
import codeList from '../../../assets/phone.json';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  public isLoading : boolean = false;
  public title : any;
  public firstName: any;
  public lastName: any;
  public email: any;
  public password: any;
  public userName: any;
  public country: any;
  public mobileNumber: any;
  public isAdmin: any;

  public allCountries: any;
  public countryCode: string;
  public countryName: string;
  public countries: any[] = [];
  public countryCodes: string[];
  public titleName: string;

  constructor(public _route: ActivatedRoute,
    public router: Router,
    private toastr: ToastrService,
    public userService: UserManagementService,
    ) { }

  ngOnInit() {
    this.getCountries();
    this.getCountryCodes();
    this.titleName = "Register "
  }

  public goToSignIn(): any {
    this.router.navigate(['/login']);
  }//end of goToSign function

  public signupFunction(): any {

    if (!this.userName) {
      this.toastr.warning("User Name is required", "Warning!");
    }
    else if (!this.mobileNumber) {
      this.toastr.warning("Mobile Number is required", "Warning!");
    }
    
    else if (!this.email) {
      this.toastr.warning("Email is required", "Warning!");
    }
    else if (!this.password) {
      this.toastr.warning("Password is required", "Warning!");
    }
    else {
      this.isLoading = true;
      let data = {
        firstName: this.firstName,
        lastName: this.lastName,
        mobileNumber:  this.mobileNumber,
        email: this.email,
        password: this.password,
        userName: this.userName,
        countryName: this.countryName,
        isAdmin: this.validateIsAdmin(this.userName)
      }

      console.log(data)  
      this.userService.signUp(data)
        .subscribe((apiResponse) => {

          if (apiResponse.status == 200) {
            this.toastr.success("Please check your email", "Registered with MeetUp App");
            setTimeout(() => {
              this.isLoading = false;
              this.goToSignIn();
            }, 1000);//redirecting to signIn page

          }else if(apiResponse.status == 500){
            this.isLoading = false;
            this.toastr.error(apiResponse.message, "Error!");
            this.router.navigate(['/500']);
          }
          else {
            this.isLoading = false;
            this.toastr.error(apiResponse.message, "Error!");
          }
        },
          (error) => {
            this.isLoading = false;
            this.toastr.error("Some Internal Error Occurred", "Error!");
            this.router.navigate(['/500']);
          });
    }
  }//end signUp function
  
  public validateIsAdmin = (name: string): boolean => {
    console.log(name + name.substr(name.length - 6, name.length - 1))
    if (name.substr(name.length - 6, name.length - 1) == "-admin") { //here 6 is of length of '-admin'
      return true;
    }
    else {
      return false;
    }
  }//end validateUserName
 
  public onChangeOfCountry() {

    this.countryCode = this.countryCodes[this.country];
    this.countryName = this.allCountries[this.country];
  }//end onChangeOfCountry

  public getCountries() {
        this.allCountries = countryList;
        let testdata : any;
        testdata = countryList;
        for (let i in testdata) {
          let singleCountry = {
            name: testdata[i],
            code: i
          }
          this.countries.push(singleCountry);
        }
        this.countries = this.countries.sort((first, second) => {
          return first.name.toUpperCase() < second.name.toUpperCase() ? -1 : (first.name.toUpperCase() > second.name.toUpperCase() ? 1 : 0);
        });//end sort
    //end subscribe

  }//end getCountries

  public getCountryCodes() {
    
        let testdata : any;
        testdata = codeList;
        this.countryCodes = testdata;
      
  }//end getCountries

  

}
