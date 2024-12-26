import { ChangeDetectorRef, Component, OnInit, signal } from "@angular/core";
import { CalendarOptions, DateSelectArg, EventApi, EventChangeArg, EventClickArg } from "@fullcalendar/core";
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { TaskService } from "src/app/services/tasks.service";
import { Task } from "src/app/models/task";
import * as moment from "moment";

@Component({
  selector: "app-workspace",
  templateUrl: "./workspace.component.html",
  styleUrl: "./workspace.component.scss",
})
export class WorkspaceComponent implements OnInit {
  constructor(private changeDetector: ChangeDetectorRef, private taskService: TaskService) {}
  ngOnInit(): void {
    this.loadTasks();
  }
  calendarVisible = signal(true);
  tasks: Task[] = [];
  workspaceDialog: boolean = false;
  selectTask: Task = {};
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
  private calculateEstimatedTime(start_date: string | Date, end_date: string | Date): number {
      const start = moment(start_date);
      const end = moment(end_date);
      return end.diff(start, 'minutes'); // Return difference in minutes
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
  
    // Helper method to map TaskPriority to API enums
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
}
