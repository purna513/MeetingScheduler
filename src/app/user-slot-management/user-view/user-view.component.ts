import { Component, OnInit } from '@angular/core';
import 'flatpickr/dist/flatpickr.css';
import {
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef
} from '@angular/core';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours
} from 'date-fns';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView
} from 'angular-calendar';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { UserManagementService } from 'src/app/user-management.service';
import { ToastrService } from 'ngx-toastr';

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }
};

@Component({
  selector: 'app-user-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-view.component.html',
  styleUrls: ['./user-view.component.css']
})
export class UserViewComponent implements OnInit {

  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

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

  public events: CalendarEvent[] = [];
  public meetings: any = [];
  public activeDayIsOpen: boolean = true;
  public currentUserId: any;
  public authToken: any;
  public currentUserName: any;
  public userInfo: any;

  constructor(private modal: NgbModal, private userService : UserManagementService,
                private toastr : ToastrService) { }

  public titleName : any;
  ngOnInit() {
    this.titleName = "User View";
    
    this.authToken = Cookie.get('authToken');
    this.currentUserId = Cookie.get('receiverId');
    this.currentUserName = Cookie.get('receiverName');
    this.userInfo = this.userService.getUserInfoFromLocalStorage();
    this.getUserAllMeetingFunction();    
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
           // this.router.navigate(['/serverError']);
          }
        }//end error
      );//end appservice.getuserallmeeting
    }//end if
    else {
      this.toastr.info("Missing Authorization Key", "Please login again");
     // this.router.navigate(['/user/login']);

    }

  }//end getUserAllMeetingFunction


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

  eventTimesChanged({
    event,
    newStart,
    newEnd
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map(iEvent => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd
        };
      }
      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    this.modal.open(this.modalContent, { size: 'lg' });
  }

  addEvent(): void {
    this.events = [
      ...this.events,
      {
        title: 'New event',
        start: startOfDay(new Date()),
        end: endOfDay(new Date()),
        color: colors.red,
        draggable: true,
        resizable: {
          beforeStart: true,
          afterEnd: true
        },
        actions:this.actions
      }
    ];
    console.log(this.events);
  }

  deleteEvent(eventToDelete: CalendarEvent) {
    this.events = this.events.filter(event => event !== eventToDelete);
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }
}

