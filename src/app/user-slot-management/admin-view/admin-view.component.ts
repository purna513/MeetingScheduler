import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarView } from 'angular-calendar';
import { Subject } from 'rxjs';
import { UserManagementService } from 'src/app/user-management.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { isSameMonth, isSameDay, startOfDay, endOfDay } from 'date-fns';

const colors: any = {
  green: {
    primary: '#008000',
    secondary: '#FAE3E3'
  }
};
@Component({
  selector: 'app-admin-view',
  templateUrl: './admin-view.component.html',
  styleUrls: ['./admin-view.component.css']
})
export class AdminViewComponent implements OnInit {

  @ViewChild('modalEditMeeting', { static: true }) modalEditMeeting: TemplateRef<any>;
  @ViewChild('modalDeleteMeeting', { static: true }) modalDeleteMeeting: TemplateRef<any>;
  @ViewChild('modalAlert', { static: true }) modalAlert: TemplateRef<any>;
  @ViewChild('modalAddMeeting', { static: true }) modalAddMeeting: TemplateRef<any>;
  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  
  modalData: {
    action: string;
    event: CalendarEvent;
  };

  
  
  actions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-pencil"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      }
    },
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter(iEvent => iEvent !== event);
        this.handleEvent('Deleted', event);
      }
    }
  ];

  refresh: Subject<any> = new Subject();
  activeDayIsOpen: boolean = false;

  public selectedUser: any;
  public allUsers: any[];
  public allUsersData: any[];
  public userInfo: any;
  public authToken: any;
  public receiverId: any;
  public receiverName: any;
  public adminId: any;
  public adminName: any;
  public titleName : any;
  public onlineUserList: any = []
  public meetings: any = [];
  public events: CalendarEvent[] = [];

  public gentleReminder: Boolean = true;
  public title: any;
  public description: any;
  public startDate1: any;
  public endDate1: any;
  public venue: any;
  public currentUserId: any;
  public currentUserName: any;
  event: any;
  public isUpdate: Boolean = false;
  
  constructor(
    public userService: UserManagementService,
    //public socketService: SocketService,
    public _route: ActivatedRoute,
    public router: Router,
    private toastr: ToastrService,
    private modal: NgbModal,

  ) {

  }

  ngOnInit() {

    this.authToken = Cookie.get('authToken');
    this.currentUserId = Cookie.get('receiverId');
    this.currentUserName = Cookie.get('receiverName');
    this.userInfo = this.userService.getUserInfoFromLocalStorage()
    this.adminId = Cookie.get('receiverId');
    this.adminName = Cookie.get('receiverName');
      //this.verifyUserConfirmation()
      //this.getOnlineUserList()
      this.getAllUsers();
      this.getUserAllMeetingFunction();
     // this.authErrorFunction()        

    // setInterval(() => {
    //   this.meetingReminder();// function to send the reminder to the user
    // }, 5000); //will check for every 5 seconds

  }


  /* Calendar Events */

  
  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }


  eventTimesChanged({ event, newStart, newEnd }: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    this.handleEvent('Dropped or resized', event);
    this.refresh.next();
  }

  handleEvent(action: string, event: any): void {
    
    if (action === 'Edited') {
      this.modalData = { event, action };
      this.isUpdate = true;
      console.log(event.meetingDescription);
      this.modal.open(this.modalEditMeeting, { size: 'lg' });
        
    }

    else if (action === 'Deleted') {
       console.log(action === 'Deleted')

      this.modalData = { event, action };
      this.modal.open(this.modalDeleteMeeting, { size: 'sm' });

    }
    else {
      this.modalData = { event, action };      
     // this.modal.open(this.modalContent, { size: 'lg' });
    }
  }

  deleteEvent(event: any): void {
    //console.log("Deleted...")

   // this.deleteMeetingFunction(event);

    this.events = this.events.filter(iEvent => iEvent !== event);
    this.refresh.next();
    this.activeDayIsOpen = false;
  }

/* End Calendar Events */

  public goToAddMeeting(): any {
    
    this.isUpdate = false;
    //this.modalData = {action,event};     
    this.modal.open(this.modalAddMeeting, { size: 'lg' });


  }//end of goToAddMeeting function

 
  setView(view: CalendarView) {
    this.view = view;
  }
  public meetingReminder(): any {
    let currentTime = new Date().getTime();
    //console.log(this.meetings)
    for (let meetingEvent of this.meetings) {

      if (isSameDay(new Date(), meetingEvent.start) && new Date(meetingEvent.start).getTime() - currentTime <= 60000
        && new Date(meetingEvent.start).getTime() > currentTime) {
        if (meetingEvent.remindMe && this.gentleReminder) {

          this.modalData = { action: 'clicked', event: meetingEvent };
          this.modal.open(this.modalAlert, { size: 'sm' });
          this.gentleReminder = false
          break;
        }//end inner if

      }//end if
      else if(currentTime > new Date(meetingEvent.start).getTime() && 
      new Date(currentTime - meetingEvent.start).getTime()  < 10000){
        this.toastr.info(`Meeting ${meetingEvent.meetingTopic} Started!`, `Gentle Reminder`);
      }  
    }

  }//end of meetingReminder function


  /* Data base functions */

  public getUserMeetings(userId,userName): any { //get meetings of clicked user ; 
    this.currentUserId = userId
    this.currentUserName = userName
    this.getUserAllMeetingFunction()
  }//end of getUserMeetings function

  public getAdminMeetings(userId): any { //get meetings of admin
    this.receiverId = userId
    this.receiverName = this.adminName
    this.getUserAllMeetingFunction()
  }//end of getAdminMeetings function

  public getAllUsers = () => {//this function will get all the normal users from database. 

    if (this.authToken != null) {
      this.userService.getUsers(this.authToken).subscribe((apiResponse) => {
        if (apiResponse.status == 200) {
          this.allUsersData = apiResponse.data;

          this.toastr.info("Updated", "All users listed");

        }
        else {
          this.toastr.error(apiResponse.message, "User Update");
        }
      },
        (error) => {
          this.toastr.error('Server error occured', "Error!");
          this.router.navigate(['/serverError']);

        }//end error
      );//end getusers

    }//end if
    else {
      this.toastr.info('Missing Authorization key', "Please login again");
      this.router.navigate(['/user/login']);

    }//end else

  }//end getAllUsers

  public sentMeetingRemindersonEmailFunction = () => {//this function will get all the normal users from database. 

    if (this.authToken != null && this.adminId != null) {
      // this.userService.sentMeetingReminders(this.adminId,this.authToken).subscribe((apiResponse) => {
      //   if (apiResponse.status == 200) {
      //     this.toastr.info("Meeting Reminders sent", "Update");

      //   }
      //   else {
      //     this.toastr.error(apiResponse.message, "Error!");
      //   }
      // },
      //   (error) => {
      //     this.toastr.error('Server error occured', "Error!");
      //     this.router.navigate(['/serverError']);

      //   }//end error
      // );//end sentreminders

    }//end if
    else {
      this.toastr.info('Missing Authorization key', "Please login again");
      this.router.navigate(['/user/login']);

    }//end else

  }//end sentRemindersFunction
 
  
  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  public getUserAllMeetingFunction = () => {//this function will get all the meetings of User.     
    if (this.currentUserId != null && this.authToken != null) {      
      this.userService.getUserAllMeeting(this.currentUserId, this.authToken).subscribe((apiResponse) => {
        if (apiResponse.status == 200) {
 
          this.meetings = apiResponse.data;
          console.log(this.meetings);
          for (let meetingEvent of this.meetings) {
            
            meetingEvent.title = meetingEvent.meetingTopic;
            meetingEvent.start = new Date(meetingEvent.meetingStartDate);
            meetingEvent.end = new Date(meetingEvent.meetingEndDate);
            meetingEvent.color = colors.green;
            meetingEvent.actions = this.actions;
            meetingEvent.remindMe = true            
          }          
          this.events = this.meetings;
          this.refresh.next();
          this.toastr.info("Calendar Updated", `Meetings Found!`);          
        }
        else {
          this.toastr.error(apiResponse.message, "Error!");
          this.events = [];
        }
      },
        (error) => {
          if (error.status == 400) {
            this.toastr.warning("Calendar Failed to Update", "Either user or Meeting not found");
            this.events = []
          }
          else {
            this.toastr.error("Some Error Occurred", "Error!");
            this.router.navigate(['/serverError']);
          }
        }//end error
      );//end appservice.getuserallmeeting
    }//end if
    else {
      this.toastr.info("Missing Authorization Key", "Please login again");
     // this.router.navigate(['/user/login']);

    }

  }//end getUserAllMeetingFunction


  public deleteMeetingFunction(meeting,isDeleteMeeting): any {
  
    this.userService.deleteMeeting(meeting.meetingId, this.authToken)
      .subscribe((apiResponse) => {

        if (apiResponse.status == 200) {
          this.toastr.success("Deleted the Meeting", "Successfull!");
          this.modal.dismissAll();
          let dataForNotify = {
            message: `Hi, ${this.receiverName} has canceled the meeting - ${meeting.meetingTopic}. Please Check your Calendar/Email`,
            userId: meeting.participantId
          }

          this.notifyUpdatesToUser(dataForNotify);

        }
        else {
          this.toastr.error(apiResponse.message, "Error!");
        }
      },
        (error) => {

          if (error.status == 404) {
            this.toastr.warning("Delete Meeting Failed", "Meeting Not Found!");
          }
          else {
            this.toastr.error("Some Error Occurred", "Error!");
            this.router.navigate(['/serverError']);

          }

        });//end calling deletemeeting

  }//end deletemeeting

  public logoutFunction = (userId) => {
    this.userService.logout(userId, this.authToken).subscribe(
      (apiResponse) => {
        if (apiResponse.status === 200) {
          
          Cookie.delete('authToken');//delete all the cookies
          Cookie.delete('receiverId');
          Cookie.delete('receiverName');
          
          localStorage.clear();
          
         // this.socketService.disconnectedSocket();//calling the method which emits the disconnect event.
          //this.socketService.exitSocket();//this method will disconnect the socket from frontend and close the connection with the server.


          setTimeout(() => {
            this.router.navigate(['/user/login']);//redirects the user to login page.
          }, 1000);//redirecting to Dashboard page


        } else {
          this.toastr.error(apiResponse.message, "Error!")
          this.router.navigate(['/serverError']);//in case of error redirects to error page.
        } // end condition
      },
      (err) => {
        if (err.status == 404) {
          this.toastr.warning("Logout Failed", "Already Logged Out or Invalid User");
        }
        else {
          this.toastr.error("Some Error Occurred", "Error!");
          this.router.navigate(['/serverError']);

        }
      });

  }//end logout  


  /* Socket - Event Based Functions */

  //listened
  public verifyUserConfirmation: any = () => {
    // this.socketService.verifyUser()
    //   .subscribe(() => {
    //     //console.log("In verifys")
    //     this.socketService.setUser(this.authToken);//in reply to verify user emitting set-user event with authToken as parameter.

    //   });//end subscribe
  }//end verifyUserConfirmation

  public authErrorFunction: any = () => {

    // this.socketService.listenAuthError()
    //   .subscribe((data) => {
    //     this.toastr.info("Missing Authorization Key", "Please login again");
    //     this.router.navigate(['/user/login']);
  
    //   });//end subscribe
  }//end authErrorFunction

  public getOnlineUserList: any = () => {
    // this.socketService.onlineUserList()
    //   .subscribe((data) => {

    //     this.onlineUserList = []
    //     for (let x in data) {
    //       //let temp = { 'userId': x, 'userName': data[x] };
    //       this.onlineUserList.push(x);
    //     }

    //     for (let user of this.allUsersData) {

    //       if (this.onlineUserList.includes(user.userId)) {
    //         user.status = "online"
    //       } else {
    //         user.status = "offline"
    //       }

    //     }

    //   });//end subscribe
  }//end getOnlineUserList


  //emitted 

  public notifyUpdatesToUser: any = (data) => {
    //data will be object with message and userId(recieverId)
   // this.socketService.notifyUpdates(data);

  }//end notifyUpdatesToUser

  /*
    Meeting schedule Functions
  */

 public validateDate(startDate:any, endDate:any):boolean {//method to validate the the start and end date of meeting .

  let start = new Date(startDate);
  let end = new Date(endDate);

  if(end < start){
    return true;
  }
  else{
    return false;
  }

}//end validateDate


public validateCurrentDate(startDate:any):boolean {//method to validate the current date and date of meeting .

  let start = new Date(startDate);
  let end : any = new Date();

  if(end > start){
    return true;
  }
  else{
    return false;
  }

}//end validateDate

public createMeetingFunction( ): any {
if (!this.startDate1) {
  this.toastr.warning("Start Date/Time is required", "Warning!");
}
else if (!this.endDate1) {
  this.toastr.warning("End Date/Time is required", "Warning!");
}
else if (this.validateDate(this.startDate1 ,this.endDate1)) {
  this.toastr.warning("End Date/Time cannot be before Start Date/Time", "Warning!");
}
else if (this.validateCurrentDate(this.startDate1) && this.validateCurrentDate(this.endDate1)) {
  this.toastr.warning("Meeting can't be schedule in back date/time", "Warning!");
}
else {
  let data = {
    meetingTopic: this.title,
    hostId: this.adminId,
    hostName:this.adminName,
    participantId:this.currentUserId,
    participantName:this.currentUserName,    
    meetingStartDate:this.startDate1,
    meetingEndDate:this.endDate1,
    meetingDescription:this.description,
    meetingPlace:this.venue,
    authToken:this.authToken,
  }

  this.userService.addMeeting(data).subscribe((apiResponse) => {

      if (apiResponse.status == 200) {
        this.toastr.success("We emailed the final schedule to participant", "Meeting Finalized");
        this.modal.dismissAll();
        this.getUserAllMeetingFunction();
        let dataForNotify = {
          message: `Hi, ${data.hostName} has Schedule a Meeting With You. Please check your Calendar/Email`,
          userId:data.participantId
        }

        // this.notifyUpdatesToUser(dataForNotify);
        // setTimeout(() => {
        //   this.goToAdminDashboard();
        // }, 1000);//redirecting to admin dashboard page

      }
      else {
        this.toastr.error(apiResponse.message, "Error!");
      }
    },
      (error) => {
        if(error.status == 400){
          this.toastr.warning("Meeting Schedule Failed", "One or more fields are missing");
        }
        else{
          this.toastr.error("Some Error Occurred", "Error!");
          this.router.navigate(['/serverError']);

        }
    });//end calling addMeeting

}
}//end addMeeting function


public updateMeetingFunction( event: any): any {

 
  if (!event.meetingStartDate) {
    this.toastr.warning("Start Date/Time is required", "Warning!");
  }
  else if (!event.meetingEndDate) {
    this.toastr.warning("End Date/Time is required", "Warning!");
  }
  else if (this.validateDate(event.meetingStartDate ,event.meetingEndDate)) {
    this.toastr.warning("End Date/Time cannot be before Start Date/Time", "Warning!");
  }
  else if (this.validateCurrentDate(event.meetingStartDate) && this.validateCurrentDate(event.meetingEndDate)) {
    this.toastr.warning("Meeting can't be schedule in back date/time", "Warning!");
  }
  else {
    let data = {
      meetingTopic: event.title,
      hostId: event.adminId,
      hostName:event.adminName,
      participantId:this.currentUserId,
      participantName:this.currentUserName,    
      meetingStartDate:event.meetingStartDate,
      meetingEndDate:event.meetingEndDate,
      meetingDescription:event.meetingDescription,
      meetingPlace:event.meetingPlace,
      authToken:this.authToken,
      meetingId:event.meetingId
    }
      this.userService.updateMeeting(data)
          .subscribe((apiResponse) => {
    
            if (apiResponse.status == 200) {
              this.toastr.success("We emailed the updated schedule to participant", "Meeting Rescheduled");
              
              this.modal.dismissAll();
  
              // let dataForNotify = {
              //   message: `Hi, ${this.receiverName} has reschedule the Meeting - ${data.meetingTopic}. Please check your Calendar/Email`,
              //   userId:this.participantId
              // }
    
              // this.notifyUpdatesToUser(dataForNotify);
              
              // setTimeout(() => {
              //   this.goToAdminDashboard();
              // }, 1000);//redirecting to admin dashboard page
    
            }
            else {
              this.toastr.error(apiResponse.message, "Error!");
            }
          });
  }
  }//end addMeeting function
  


}
