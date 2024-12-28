import { ChangeDetectorRef, Component, OnInit, signal } from "@angular/core";
import { CalendarOptions, DateSelectArg, EventApi, EventChangeArg, EventClickArg } from "@fullcalendar/core";
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { TaskService } from "src/app/services/tasks.service";
import { Task } from "src/app/models/task";
import * as moment from "moment";
import { MessageService } from "primeng/api";

@Component({
  selector: "app-workspace",
  templateUrl: "./workspace.component.html",
  styleUrl: "./workspace.component.scss",
  providers: [MessageService]
})
export class WorkspaceComponent implements OnInit {
  constructor(private changeDetector: ChangeDetectorRef, private taskService: TaskService, private messageService: MessageService) {}
  ngOnInit(): void {
    this.loadTasks();
  }
  calendarVisible = signal(true);
  tasks: Task[] = [];
  workspaceDialog: boolean = false;
  selectTask: Task = {};
  timerRunning: boolean = false;
  startTimerCheck: boolean = false;
  startTimer: boolean = false;
  timerDuration: number = 25 * 60; 
  breakDuration: number = 5 * 60; 
  remainingTime: number = this.timerDuration;
  breakRemainingTime: number = this.breakDuration;
  interval: any = null;
  breakInterval: any = null;
  timerPaused: boolean = false;
  calendarOptions = signal<CalendarOptions>({
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
    },
    initialView: "dayGridMonth",
    weekends: true,
    editable: true,
    selectMirror: true,
    dayMaxEvents: true,
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    eventChange: this.handleEventChange.bind(this),
    eventClassNames: ({ event }) => {
      const status = event.extendedProps['status'];
      switch (status) {
        case 1: return ['status-event status-not-started'];
        case 2: return ['status-event status-in-progress'];
        case 3: return ['status-event status-completed'];
        case 4: return ['status-event status-expired'];
        default: return [];
      }
    },
    /* you can update a remote database when these fire:
  eventAdd:
  eventChange:
  eventRemove:
  */
  });
  currentEvents = signal<EventApi[]>([]);

  handleCalendarToggle() {
    console.log('Calendar toggle')
    this.calendarVisible.update((bool) => !bool);
  }

  handleWeekendsToggle() {
    console.log('Weekend toggle')
    this.calendarOptions.update((options) => ({
      ...options,
      weekends: !options.weekends,
    }));
  }
  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (response: any) => {
        this.tasks = response.data.data; 
        const events = this.tasks.map((task) => ({
          id: String(task.id),
          title: task.name,
          start: task.start_date, 
          end: task.end_date, 
          allDay: false, 
          extendedProps: {
            status: task.status
          }
        }));

        // Update the calendar with events
        this.calendarOptions.update((options) => ({
          ...options,
          events,
        }));
      },
      error: () => {
        console.error("Failed to load tasks");
      },
    });
  }
  handleEventClick(clickInfo: EventClickArg) {
    this.selectTask = this.tasks.find(t => t.id === clickInfo.event.id);
    this.workspaceDialog = true;
    if (this.mapStatus(this.selectTask.status) === 'InProgress') {
      this.startTimerCheck = true;
    } else {
      this.startTimerCheck = false;
    }
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents.set(events);
    this.changeDetector.detectChanges();
  }
  handleEventChange(changeInfo: EventChangeArg) {
    const event = changeInfo.event;
    const selectedTask = this.tasks.find((t) => t.id === event.id);
    console.log(selectedTask);
    const updateTask: Task = {
      name: event.title,
      start_date: event.start ? event.start.toISOString() : null,
      end_date: event.end? event.end.toISOString() : null,
      description: selectedTask.description,
      priority: selectedTask.priority,
      status: selectedTask.status,
    }
    const taskForm = {...updateTask, estimated_date: this.calculateEstimatedTime(event.start, event.end)}
    this.taskService.updateTask(selectedTask.id, taskForm).subscribe({
      next: () => {
        console.log('Task updated successfully');
        this.loadTasks();
      },
      error: () => {
        console.error('Failed to update task');
      },
    })
  }
  handleMarkCompleted() {
    console.log(this.selectTask);
    const updateTask: Task = {
      name: this.selectTask.name,
      start_date: this.selectTask.start_date,
      end_date: this.selectTask.end_date,
      description: this.selectTask.description,
      priority: this.selectTask.priority,
      //@ts-ignore
      status: 3,
    }
    const taskForm = {...updateTask, estimated_date: this.calculateEstimatedTime(this.selectTask.start_date, this.selectTask.end_date)}
    this.taskService.updateTask(this.selectTask.id, taskForm).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Task Update', detail: 'Mark Task Completed Successfully', life: 3000 });
        this.loadTasks();
        this.workspaceDialog = false;
      }
    })
  }
  private calculateEstimatedTime(start_date: string | Date, end_date: string | Date): number {
      const start = moment(start_date);
      const end = moment(end_date);
      return end.diff(start, 'minutes');
    }
    mapStatus(status: any): string {
      switch (status) {
        case 1:
          return 'NotStarted';
        case 2:
          return 'InProgress';
        case 3:
          return 'Completed';
        case 4:
          return 'Expired';
        default:
          throw new Error('Invalid Task Status');
      }
    }
    mapPriority(priority: any): string {
      switch (priority) {
        case 1:
          return 'Low';
        case 2:
          return 'Medium';
        case 3:
          return 'High';
        default:
          throw new Error('Invalid Task Priority');
      }
    }
    startFocusTimer() {
      this.timerRunning = true;
      this.remainingTime = this.timerDuration;
      this.startTimer = true;
      this.interval = setInterval(() => {
        this.remainingTime--;
  
        if (this.remainingTime <= 0) {
          // API Update Completed Task
          this.handleMarkCompleted();
          this.endFocusTimer();
          this.messageService.add({ severity: 'success', summary: 'Timer Completed', detail: 'Focus session complete!', life: 3000 });
        }
  
        const taskDeadline = moment(this.selectTask.end_date);
        if (taskDeadline.isBefore(moment())) {
          this.endFocusTimer();
          this.messageService.add({ severity: 'warn', summary: 'Timer Break', detail: 'Task deadline reached. Timer stopped.', life: 3000 });
        }
      }, 1000);
    }
  
    endFocusTimer() {
      clearInterval(this.interval);
      this.timerRunning = false;
      this.remainingTime = this.timerDuration;
      this.startTimer = false;
    }
    pauseFocusTimer() {
      if (this.timerRunning) {
        clearInterval(this.interval);
        this.timerPaused = true;
        this.timerRunning = false;
        this.breakInterval = setInterval(() => {
          this.breakRemainingTime--;
          if (this.breakRemainingTime <= 0) {
            this.resumeFocusTimer();
            this.messageService.add({ severity: 'warn', summary: 'Timer Break', detail: 'Break Time reached. Timer continue.', life: 3000 });
          }
        }, 1000)
      }
    }
    resumeFocusTimer() {
      if (this.timerPaused) {
        clearInterval(this.breakInterval);
        this.breakRemainingTime = this.breakDuration;
        this.timerRunning = true;
        this.timerPaused = false;
    
        this.interval = setInterval(() => {
          this.remainingTime--;
    
          if (this.remainingTime <= 0) {
            // API Update Completed Task
            this.handleMarkCompleted();
            this.endFocusTimer();
            this.messageService.add({ severity: 'success', summary: 'Timer Completed', detail: 'Focus session complete!', life: 3000 });
          }
    
          const taskDeadline = moment(this.selectTask.end_date);
          if (taskDeadline.isBefore(moment())) {
            this.endFocusTimer();
            this.messageService.add({ severity: 'warn', summary: 'Timer Break', detail: 'Task deadline reached. Timer stopped.', life: 3000 });
          }
        }, 1000);
      }
    }
    formatTime(seconds: number): string {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}
