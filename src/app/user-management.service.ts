import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams, HttpClient } from '@angular/common/http';
//import * as countryList from './../resources/names.json';
let myRequest = new Request('./../resources/names.json');
let myPhoneRequest = new Request('./../resources/phones.json');
@Injectable({
  providedIn: 'root'
})
export class UserManagementService {

  //public baseUrl = "http://localhost:3000/api/v1";
  public baseUrl = "http://api.thekalabhairava.com/api/v1";
 
  constructor(private _http: HttpClient) {
    console.log("User service intialized");
   }

/* Start Functions for User Management */

  public signUp(data): Observable<any>{

    const params = new HttpParams()
      .set('firstName', data.firstName)
      .set('lastName', data.lastName)
      .set('mobileNumber', data.mobileNumber)
      .set('email', data.email)
      .set('password', data.password)
      .set('userName',data.userName)
      .set('isAdmin',data.isAdmin);

    return this._http.post(`${this.baseUrl}/users/signup`, params);
  }//end signUp

  public signIn(data): Observable<any>{

    const params = new HttpParams()
      .set('email', data.email)
      .set('password', data.password)

    return this._http.post(`${this.baseUrl}/users/login`, params);
  }//end signIn

  public resetPassword(data): Observable<any>{

    const params = new HttpParams()
      .set('email', data.email)

    return this._http.post(`${this.baseUrl}/users/retrivePassword`, params);
  }//end resetPassword

  public updatePassword(data): Observable<any>{

    const params = new HttpParams()
      .set('validationToken', data.validationToken)
      .set('password', data.password)

    return this._http.put(`${this.baseUrl}/users/updatePassword`, params);
  }//end updatePassword

  public verifyEmail(userId): Observable<any>{

    const params = new HttpParams()
      .set('userId', userId)

    return this._http.put(`${this.baseUrl}/users/verifyEmail`, params);
  }//end verifyEmail

  public getUsers(authToken): Observable<any> {
    console.log(`${authToken}`);
    return this._http.get(`${this.baseUrl}/users/view/all?authToken=${authToken}`);
  }//end getUsers function

  public setUserInfoInLocalStorage = (data) => {
    localStorage.setItem('userInfo', JSON.stringify(data));
  }//end of setlocalstorage Function

  public getUserInfoFromLocalStorage: any = () => {
    return JSON.parse(localStorage.getItem('userInfo'));
  }//end getlocalstorage function

  public logout(userId,authToken): Observable<any>{

    console.log(userId)
    const params = new HttpParams()
      .set('authToken',authToken)

    return this._http.post(`${this.baseUrl}/users/${userId}/logout`, params);
  }

  /* Start Meeting Management Functions */

  public addMeeting(data): Observable<any>{
    console.log(data.meetingStartDate);
    const params = new HttpParams()
      .set('meetingTopic', data.meetingTopic)
      .set('hostId', data.hostId)
      .set('hostName', data.hostName)
      .set('participantId', data.participantId)
      .set('participantName', data.participantName)
      .set('participantEmail',data.participantEmail)
      .set('meetingStartDate',data.meetingStartDate)
      .set('meetingEndDate',data.meetingEndDate)
      .set('meetingDescription',data.meetingDescription)
      .set('meetingPlace',data.meetingPlace)
      .set('authToken',data.authToken)
      .set('emailAddress',data.emailAddress)

    return this._http.post(`${this.baseUrl}/meetings/addMeeting`, params);
  }//end addMeeting

  
  public getUserAllMeeting(userId,authToken): Observable<any> {
    
    return this._http.get(`${this.baseUrl}/meetings/view/all/meetings/${userId}?authToken=${authToken}`);
  }//end getUsers function

  
  public updateMeeting(data): Observable<any>{

    console.log(data.participantEmail +"Frrom update Meeting service")
    const params = new HttpParams()
      .set('meetingTopic', data.meetingTopic)
      .set('meetingStartDate',data.meetingStartDate)
      .set('meetingEndDate',data.meetingEndDate)
      .set('meetingDescription',data.meetingDescription)
      .set('meetingPlace',data.meetingPlace)
      .set('authToken',data.authToken)
  
    return this._http.put(`${this.baseUrl}/meetings/${data.meetingId}/updateMeeting`, params);
  }

  public deleteMeeting(meetingId,authToken): Observable<any>{

    const params = new HttpParams()
      .set('authToken',authToken)

    return this._http.post(`${this.baseUrl}/meetings/${meetingId}/delete`, params);
  }//end deleteMeeting

}
