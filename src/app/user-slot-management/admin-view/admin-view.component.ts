import { Component, OnInit, TemplateRef, ViewChild,ViewEncapsulation } from '@angular/core';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarView, CalendarMonthViewDay, CalendarWeekViewBeforeRenderEvent, CalendarDayViewBeforeRenderEvent,CalendarEventTitleFormatter } from 'angular-calendar';
import { Subject } from 'rxjs';
import { UserManagementService } from 'src/app/user-management.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { isSameMonth, isSameDay, startOfDay, endOfDay, isSameMinute } from 'date-fns';
import { MeetupappSocketService } from 'src/app/meetupapp-socket.service';
import { CustomEventTitleFormatter } from 'src/app/custom-event-title-formatter.provider';
const colors: any = {
  green: {
    primary: '#008000',
    secondary: '#FAE3E3'
  }
};

interface MyEvent extends CalendarEvent {
  meetingStartDate: string;
  meetingEndDate: string;
  hostId: string;
  meetingTopic: string;
  hostName: string;
  meetingDescription: string;
  participantName: string;
  meetingPlace : string;

}

interface MyCalendarEventTimesChangedEvent extends CalendarEventTimesChangedEvent{

  event: MyEvent;
}
interface EventGroupMeta {
  type: string;
}

@Component({
  selector: 'app-admin-view',
  templateUrl: './admin-view.component.html',
  styleUrls: ['./admin-view.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: CalendarEventTitleFormatter,
      useClass: CustomEventTitleFormatter
    }
  ]
})
export class AdminViewComponent implements OnInit {

  @ViewChild('modalEditMeeting', { static: true }) modalEditMeeting: TemplateRef<any>;
  @ViewChild('modalDeleteMeeting', { static: true }) modalDeleteMeeting: TemplateRef<any>;
  @ViewChild('modalEventNotification', { static: true }) modalEventNotification: TemplateRef<any>;
  @ViewChild('modalAddMeeting', { static: true }) modalAddMeeting: TemplateRef<any>;
  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  
  modalData: {
    action: string;
    event: MyEvent;
  };

  
  
  actions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-pencil"></i>',
      onClick: ({ event }: { event: MyEvent }): void => {
        this.handleEvent('Edited', event);
      }
    },
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      onClick: ({ event }: { event: MyEvent }): void => {
        this.events = this.events.filter(iEvent => iEvent !== event);
        this.handleEvent('Deleted', event);
      }
    }
  ];

  refresh: Subject<any> = new Subject();
  activeDayIsOpen: boolean = false;
  public userNameSearch : any;
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
  public events: MyEvent[] = [];
  public minimumDate : any = new Date();
  public maximumDate : any = new Date(this.minimumDate.getFullYear(),11,31);
  
  public maximumViewdate : any = new Date(this.minimumDate.getFullYear(),11,31);
  public minimuViewdate : any = new Date(this.minimumDate.getFullYear(),0,1);
  public gentleReminder: Boolean = true;
  public title: any;
  public prevBtnDisabled: boolean = false;
  public nextBtnDisabled: boolean = false;
  public description: any;
  public startDate1: any;
  public endDate1: any;
  public venue: any;
  public currentUserId: any;
  public currentUserName: any;
  public event: any;
  public userName : any;
  public isUpdate: Boolean = false;
  public currentUserEmail: any;
  public isAdmin: Boolean = true;
  public isUser: Boolean = false;
  public currentUserStatus: any;
  public groupedSimilarEvents: MyEvent[] = [];
  constructor(
    public userService: UserManagementService,
    public meetupappSocketService: MeetupappSocketService,
    public _route: ActivatedRoute,
    public router: Router,
    private toastr: ToastrService,
    private modal: NgbModal,

  ) {

  }

  
  ngOnInit() {
    console.log(this.maximumDate + this.minimumDate)
    this.authToken = Cookie.get('authToken');
    this.currentUserId = Cookie.get('receiverId');
    this.currentUserName = Cookie.get('receiverName');
    this.userInfo = this.userService.getUserInfoFromLocalStorage();  
    this.userName = this.userInfo.userName;  
    this.adminId = Cookie.get('receiverId');    
    this.adminName = Cookie.get('receiverName');
    this.verifyUserConfirmation();
    this.getOnlineUserList();
    this.getAllUsers();
    this.getUserAllMeetingFunction();
    //  setTimeout(()=>{
    //    this.getOnlineUserList();
    //  },9000)
    // Code for grouping events of same type
    // this.groupedSimilarEvents = [];
    // this.events = [];
    // const processedEvents = new Set();
    // this.events.forEach(event => {
    //   if (processedEvents.has(event)) {
    //     return;
    //   }
    //   const similarEvents = this.events.filter(otherEvent => {
    //     return (
    //       otherEvent !== event &&
    //       !processedEvents.has(otherEvent) &&
    //       isSameMinute(otherEvent.start, event.start) &&
    //       (isSameMinute(otherEvent.end, event.end) ||
    //         (!otherEvent.end && !event.end)) &&
    //       otherEvent.color.primary === event.color.primary &&
    //       otherEvent.color.secondary === event.color.secondary
    //     );
    //   });
    //   processedEvents.add(event);
    //   similarEvents.forEach(otherEvent => {
    //     processedEvents.add(otherEvent);
    //   });
    //   if (similarEvents.length > 0) {
    //     this.groupedSimilarEvents.push({
    //       title: `${similarEvents.length + 1} events`,
    //       color: event.color,
    //       start: event.start,
    //       end: event.end,
    //       meta: {
    //         groupedEvents: [event, ...similarEvents]
    //       }
    //     });
    //   } else {
    //     this.groupedSimilarEvents.push(event);
    //   }
    // });
    this.authErrorFunction()        

     setInterval(() => {
       this.eventReminder();
     }, 5000); //Reminds admin for every 5 seconds

  }


  /* Calendar Events */

  dateIsValid(date: Date): boolean {
    
    return date >= this.minimuViewdate && date <= this.maximumViewdate;
  }

  
  beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): void {
    body.forEach(day => {      
      if (!this.dateIsValid(day.date)) { 
        
        day.cssClass = 'bg-pink';
        day.cssClass = 'cal-disabled';                              
      }else{
        this.prevBtnDisabled = false;
        this.nextBtnDisabled = false;
      }
    });
  }
  beforeWeekViewRender(renderEvent: CalendarWeekViewBeforeRenderEvent) {
    renderEvent.hourColumns.forEach(hourColumn => {
      hourColumn.hours.forEach(hour => {
        hour.segments.forEach(segment => {
          if (!this.dateIsValid(segment.date)) { 
        
            segment.cssClass = 'bg-pink';
            segment.cssClass = 'cal-disabled';                              
          }else{
            this.prevBtnDisabled = false;
            this.nextBtnDisabled = false;
          }
        });
      }); 
    });
  }
//   beforeDayViewRender(renderEvent: CalendarDayViewBeforeRenderEvent) {
//     renderEvent.hourColumns.forEach(hourColumn => {
//       hourColumn.hours.forEach(hour => {
//         hour.segments.forEach(segment => {
//           if (segment.date.getHours() >= 2 && segment.date.getHours() <= 5) {
//             segment.cssClass = 'bg-pink';
//           }
//         });
//       });
//     });
//   }
// }
  dayClicked({ date, events }: { date: Date; events: MyEvent[] }): void {
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


  eventTimesChanged({ event, newStart, newEnd }: MyCalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    this.handleEvent('Dropped or resized', event);
    this.refresh.next();
  }

  handleEvent(action: string, event: any): void {
    
    if (action === 'Edited') {
      this.modalData = { event, action };
      this.isUpdate = true;      
      this.modal.open(this.modalEditMeeting, { size: 'lg' });
        
    }

    else if (action === 'Deleted') {

      this.modalData = { event, action };
      this.modal.open(this.modalDeleteMeeting, { size: 'sm' });

    }
    else {
      this.modalData = { event, action };
      this.isUpdate = true;      
      this.modal.open(this.modalEditMeeting, { size: 'lg' });
    }
  }

  deleteEvent(event: any): void {
    
    this.events = this.events.filter(iEvent => iEvent !== event);
    this.refresh.next();
    this.activeDayIsOpen = false;
  }

/* End Calendar Events */

  public goToAddMeeting(): any {
    this.modal.open(this.modalAddMeeting, { size: 'lg' });
  }//end of goToAddMeeting function

 
  setView(view: CalendarView) {
    this.view = view;
  }
  public eventReminder(): any {
    let currentTime = new Date().getTime();
    //console.log(this.meetings)
    for (let meetingEvent of this.meetings) {

      if (isSameDay(new Date(), meetingEvent.start) && new Date(meetingEvent.start).getTime() - currentTime <= 60000
        && new Date(meetingEvent.start).getTime() > currentTime) {
        if (meetingEvent.remindMe && this.gentleReminder) {

          this.modalData = { action: 'clicked', event: meetingEvent };
          this.modal.open(this.modalEventNotification, { size: 'sm' });
          this.gentleReminder = false
          break;
        }//end inner if

      }//end if
      else if(currentTime > new Date(meetingEvent.start).getTime() && 
      new Date(currentTime - meetingEvent.start).getTime()  < 10000){
        this.toastr.info(`Meeting ${meetingEvent.meetingTopic} Started!`, `Reminder`);
      }  
    }

  }//end of eventReminder function


  /* Data base functions */

  public getUserMeetings(userId,userName,email,status): any { //get appointments of selectd user ; 
    this.currentUserId = userId
    this.currentUserName = userName;
    this.currentUserEmail = email;
    this.currentUserStatus =status;
    console.log(status+ email);
    this.isAdmin = false;
    this.isUser = true;    
    this.getUserAllMeetingFunction()
  }//end of getUserMeetings function

  public getAdminMeetings(): any { //get meetings of admin
    this.currentUserId = this.adminId
    this.currentUserName = this.adminName
    this.isAdmin = true;
    this.isUser = false;
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
          this.router.navigate(['/500']);
        }//end error
      );//end getusers
    }//end if
    else {
      this.toastr.info('Missing Authorization key', "Please login again");
      this.router.navigate(['/login']);

    }//end else

  }//end getAllUsers

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  public getUserAllMeetingFunction = () => {//Retrives all the meetings of a User.       
    if (this.currentUserId != null && this.authToken != null) {      
      this.userService.getUserAllMeeting(this.currentUserId, this.authToken).subscribe((apiResponse) => {
        if (apiResponse.status == 200) {
          this.meetings = apiResponse.data;        
          for (let meetingEvent of this.meetings) {      
            meetingEvent.title = meetingEvent.meetingTopic;
            meetingEvent.start = new Date(meetingEvent.meetingStartDate);
            meetingEvent.end = new Date(meetingEvent.meetingEndDate);
            meetingEvent.color = colors.green;
            meetingEvent.actions = this.actions;
            meetingEvent.remindMe = true                  
          } 

          this.events = this.meetings;
          this.getOnlineUserList();
          // for(let i=0;i<this.events.length;i++){
          //   if((this.meetings[i] .meetingStartDate)> this.events[i].start && eventStartDay < events[i].end){
          //     return true;
          // }
          // //end-time in between any of the events
          // if(eventEndDay > events[i].start && eventEndDay < events[i].end){
          //     return true;
          // }
          // //any of the events in between/on the start-time and end-time
          // if(eventStartDay <= events[i].start && eventEndDay >= events[i].end){
          //     return true;
          // }
          // }          
         // this.refresh.next();
          this.toastr.info("Updated Calender", `Meetings Found!`);          
        }
        else {
          this.toastr.error(apiResponse.message, "Error!");
          this.events = [];
        }
      },
        (error) => {
          if (error.status == 400) {
            this.toastr.warning("Calendar Not able to Update", "Either user or Meeting not found");
            this.events = []
          }
          else {
            this.toastr.error("Some Error Occurred", "Error!");
            this.router.navigate(['/500']);
          }
        }//end error
      );//end appservice.getuserallmeeting
    }//end if
    else {
      this.toastr.info("Missing Authorization Key", "Please login again");
      this.router.navigate(['/login']);

    }

  }//end getUserAllMeetingFunction


  public deleteMeetingFunction(meeting,isDeleteMeeting): any {
  if(isDeleteMeeting==true){
    console.log()
    this.userService.deleteMeeting(meeting.meetingId, this.authToken)
      .subscribe((apiResponse) => {

        if (apiResponse.status == 200) {
          this.toastr.success("Deleted the Meeting", "Successfull!");
          this.modal.dismissAll();
          let notificationData = {
            message: `Hi, ${this.adminName} has canceled the meeting - ${meeting.meetingTopic}. Please Check your Calendar/Email`,
            userId: meeting.participantId
          }
          if(this.currentUserStatus=='online'){
            this.notifyUpdatesToUser(notificationData);
          }
          

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
            this.router.navigate(['/500']);

          }

        });//end calling deletemeeting
  }else{
    this.modal.dismissAll();
    this.getUserAllMeetingFunction();
  }
    

  }//end deletemeeting

  public logoutFunction = (userId) => {
    this.userService.logout(userId, this.authToken).subscribe(
      (apiResponse) => {
        if (apiResponse.status === 200) {
          
          Cookie.delete('authToken');//delete all the cookies
          Cookie.delete('receiverId');
          Cookie.delete('receiverName');
          
          localStorage.clear();
          
          this.meetupappSocketService.disconnectedSocket();//calling the method which emits the disconnect event.
          this.meetupappSocketService.exitSocket();//this method will disconnect the socket from frontend and close the connection with the server.


          setTimeout(() => {
            this.router.navigate(['/login']);//redirects the user to login page.
          }, 1000);//redirecting to Dashboard page


        } else {
          this.toastr.error(apiResponse.message, "Error!")
          this.router.navigate(['/500']);//in case of error redirects to error page.
        } // end condition
      },
      (err) => {
        if (err.status == 404) {
          this.toastr.warning("Logout Failed", "Already Logged Out or Invalid User");
        }
        else {
        this.toastr.error("Some Error Occurred", "Error!");
          this.router.navigate(['/500']);

        }
      });

  }//end logout  


  /* Socket - Event Based Functions */

  //listened
  public verifyUserConfirmation: any = () => {
    this.meetupappSocketService.verifyUser()
      .subscribe(() => {

        this.meetupappSocketService.setUser(this.authToken);

      });//end subscribe
  }//end verifyUserConfirmation

  public authErrorFunction: any = () => {

    this.meetupappSocketService.listenAuthError()
      .subscribe((data) => {
        this.toastr.info("Missing Authorization Key", "Please login again");
        this.router.navigate(['/login']);
  
      });//end subscribe
  }//end authErrorFunction

  public getOnlineUserList: any = () => {
    this.meetupappSocketService.onlineUserList()
      .subscribe((data) => {

        this.onlineUserList = []
        for (let x in data) {
          let temp = data[x].userId ;
          this.onlineUserList.push(temp);
        } 
        console.log(this.onlineUserList);
        if(this.allUsersData != undefined){
        for (let user of this.allUsersData) {          
          if (this.onlineUserList.includes(user.userId)) {
            user.status = "online"
          } else {
            user.status = "offline"
          }
        }
      }

      });//end subscribe
  }//end getOnlineUserList


  //emitted 

  public notifyUpdatesToUser: any = (data) => {
   this.meetupappSocketService.notifyUpdates(data);
  }//end notifyUpdatesToUser

  /*
    Meeting schedule Functions
  */

 public validateDate(startDate:any, endDate:any):boolean {//method to validate the the start and end date of meeting .

  let startDateTime = new Date(startDate);
  let endDateTime = new Date(endDate);

  if(endDateTime < startDateTime){
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
  this.toastr.warning("Event can't be schedule in back date/time");
}
else {
  let data = {
    meetingTopic: this.title,
    hostId: this.adminId,
    hostName:this.adminName,
    participantId:this.currentUserId,
    participantName:this.currentUserName,    
    meetingStartDate:this.startDate1.getTime(),
    meetingEndDate:this.endDate1.getTime(),
    meetingDescription:this.description,
    meetingPlace:this.venue,
    authToken:this.authToken,
    emailAddress : this.currentUserEmail
  }
  this.userService.addMeeting(data).subscribe((apiResponse) => {

      if (apiResponse.status == 200) {
        this.toastr.success("Mailed Event Details", "Meeting Finalized");
        this.modal.dismissAll();
        this.getUserAllMeetingFunction();
        let notificationData = {
          message: `Hi, ${data.hostName} has Schedule a Meeting With You. Please check your Calendar/Email`,
          userId:data.participantId
        }
        if(this.currentUserStatus== 'online'){
          this.notifyUpdatesToUser(notificationData);
        }
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
          this.router.navigate(['/500']);

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
      meetingId:event.meetingId,
      participantEmail: this.currentUserEmail
    }
      this.userService.updateMeeting(data)
          .subscribe((apiResponse) => {
    
            if (apiResponse.status == 200) {
              this.toastr.success("We emailed the updated schedule to participant", "Meeting Rescheduled");
              
              let notificationData = {
                message: `Hi, ${this.adminName} has reschedule the Meeting - ${data.meetingTopic}. Please check your Calendar/Email`,
                userId:this.currentUserId
              }
              console.log(this.currentUserStatus)
              if(this.currentUserStatus=='online'){
                console.log("Hi")
                this.notifyUpdatesToUser(notificationData);
              }
              
              setTimeout(() => {
                this.modal.dismissAll();
              }, 1000);//redirecting to admin dashboard page
    
            }
            else {
              this.toastr.error(apiResponse.message, "Error!");
            }
          });
  }
  }//end addMeeting function
  

  public signOutFunction = () => {
      
    this.userService.logout(this.adminId, this.authToken).subscribe(
      (apiResponse) => {
        if (apiResponse.status === 200) {
          
          Cookie.delete('authToken');//delete all the cookies
          Cookie.delete('receiverId');
          Cookie.delete('receiverName');
          
          localStorage.clear();
          
          this.meetupappSocketService.disconnectedSocket();//calling the method which emits the disconnect event.
          this.meetupappSocketService.exitSocket();//this method will disconnect the socket from frontend and close the connection with the server.


          setTimeout(() => {
            this.router.navigate(['/login']);//redirects the user to login page.
          }, 1000);//redirecting to Dashboard page


        } else {
          this.toastr.error(apiResponse.message, "Error!")
          this.router.navigate(['/500']);//in case of error redirects to error page.
        } // end condition
      },
      (err) => {
        if (err.status == 404) {
          this.toastr.warning("Logout Failed", "Already Logged Out or Invalid User");
        }
        else {
        this.toastr.error("Some Error Occurred", "Error!");
          this.router.navigate(['/500']);

        }
      });

  }//end logout  


}
