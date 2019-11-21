import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { UserManagementModule } from './user-management/user-management.module';
import {ToastrModule} from 'ngx-toastr'
import { from } from 'rxjs';
import {
  SocialLoginModule,
  AuthServiceConfig,
  GoogleLoginProvider,
  FacebookLoginProvider,
 
} from "angularx-social-login";
import { UserSlotManagementModule } from './user-slot-management/user-slot-management.module';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { InternalServerErrorComponent } from './internal-server-error/internal-server-error.component';


// Configs 
export function getAuthServiceConfigs() {
  let config = new AuthServiceConfig(
      [
        // {
        //   id: FacebookLoginProvider.PROVIDER_ID,
        //   //add facebook client Id below
        //   provider: new FacebookLoginProvider(" ")
        // },
        {
          id: GoogleLoginProvider.PROVIDER_ID,
          //add google client Id below
          provider: new GoogleLoginProvider("929397141684-15qaahcbvs4lvi3ar84m1l2o8lve7659")
        }
       
      ]
  );
  return config;
}

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    InternalServerErrorComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    UserManagementModule,
    UserSlotManagementModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SocialLoginModule,
    ToastrModule.forRoot(),
  ],
  providers: [
    {
      provide: AuthServiceConfig,
      useFactory: getAuthServiceConfigs
    }
  ],  
  bootstrap: [AppComponent]
})
export class AppModule { }
