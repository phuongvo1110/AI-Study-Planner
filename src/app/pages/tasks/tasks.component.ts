import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { MessageService } from 'primeng/api';
import { Task, TaskPriority, TaskStatus } from 'src/app/models/task';
import { TaskService } from 'src/app/services/tasks.service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
})
export class TasksComponent implements OnInit {
  constructor(
    private taskService: TaskService,
    private messageService: MessageService
  ) {}

  taskDialog: boolean = false;
  statusInput: TaskStatus;
  priorityInput: TaskPriority;
  taskForm: Task = {};
  submitted: boolean = false;
  analyzeMessage!: string;
  tasksStatus: TaskStatus[] = [
    { label: 'NotStarted', value: 'notstarted' },
    { label: 'InProgress', value: 'inprogress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Expired', value: 'expired' },
  ];

  taskPriority: TaskPriority[] = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
  ];

  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  ngOnInit(): void {
    this.loadTasks();
    console.log(this.statusInput, this.priorityInput)
  }
  filterTasks() {
    this.filteredTasks = this.tasks.filter((task) => {
      // @ts-ignore
      const matchesStatus = !this.statusInput || this.mapStatus(task.status) === this.statusInput;
        // @ts-ignore
      const matchesPriority = !this.priorityInput || this.mapPriority(task.priority) === this.priorityInput;
      return matchesStatus && matchesPriority;
    });
    console.log(this.filterTasks)
  }
  clearSearch() {
    this.statusInput = undefined;
    this.priorityInput = undefined;
    this.filteredTasks = [...this.tasks];
  }
  // Fetch tasks from the API
  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (data: any) => {
        this.tasks = data.data.data;
        this.filteredTasks = [...this.tasks];
      },
      error: (err) => this.showErrorMessage('Failed to load tasks'),
    });
  }

  openNew() {
    this.taskForm = {};
    this.submitted = false;
    this.taskDialog = true;
  }
  analyzeSchedule() {
    this.taskService.analyzeAI(this.tasks).subscribe({
      next: (response: any) => {
        this.analyzeMessage = response.data.message;
      }
    })
  }
  // Edit an existing task
  editTask(task: Task) {
    this.taskForm = { ...task };
    this.taskDialog = true;
    // @ts-ignore
    this.taskForm.status = this.mapStatus(this.taskForm.status);
    // @ts-ignore
    this.taskForm.priority = this.mapPriority(this.taskForm.priority);
    this.taskForm.start_date = new Date(this.taskForm.start_date as string);
    this.taskForm.end_date = new Date(this.taskForm.end_date as string);
    console.log(this.taskForm);
  }

  // Delete a task
  deleteTask(task: Task) {
    this.taskService.deleteTask(task.id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((t) => t.id !== task.id);
        this.showSuccessMessage('Task Deleted');
      },
      error: () => this.showErrorMessage('Failed to delete task'),
    });
  }

  saveProduct() {
    this.submitted = true;
    // @ts-ignore
    this.taskForm.status = this.taskForm.status.value ? this.taskForm.status.value : this.taskForm.status;   
     // @ts-ignore
    this.taskForm.priority = this.taskForm.priority.value ? this.taskForm.priority.value : this.taskForm.priority;
    if (this.taskForm.id) {
      // Update an existing task
      this.taskService.updateTask(this.taskForm.id, this.taskForm).subscribe({
        next: () => {
          this.loadTasks();
          this.showSuccessMessage('Task Updated');
          this.taskDialog = false;
        },
        error: () => this.showErrorMessage('Failed to update task'),
      });
    } else {
      // Create a new task
      this.taskService.createTask(this.taskForm).subscribe({
        next: () => {
          this.loadTasks();
          this.showSuccessMessage('Task Created');
          this.taskDialog = false;
        },
        error: () => this.showErrorMessage('Failed to create task'),
      });
    }
  }

  hideDialog() {
    this.taskDialog = false;
    this.submitted = false;
  }

  private showSuccessMessage(detail: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: detail,
      life: 3000,
    });
  }

  private showErrorMessage(detail: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: detail,
      life: 3000,
    });
  }
  private formatDateToISO(date: string): string {
    // Parse the input date and set the time to 17:00:00
    return moment(date, 'YYYY-MM-DD HH:mm:ss')
      .set({ hour: 17, minute: 0, second: 0, millisecond: 0 })
      .toISOString();
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
  mapStatusValue(status: any) {
    switch (status) {
      case 1:
        return {
          label: 'NotStarted',
          value: 'notstarted',
        };
      case 2:
        return {
          label: 'InProgress',
          value: 'inprogress',
        };
      case 3:
        return {
          label: 'Completed',
          value: 'completed',
        };
      case 4:
        return {
          label: 'Expired',
          value: 'expired',
        };
      default:
        throw new Error('Invalid Task Status');
    }
  }

  // Helper method to map TaskPriority to API enums
  mapPriorityValue(priority: any) {
    switch (priority) {
      case 1:
        return {
          label: 'Low',
          value: 'low',
        };
      case 2:
        return {
          label: 'Medium',
          value:'medium',
        };
      case 3:
        return {
          label: 'High',
          value: 'high',
        };
      default:
        throw new Error('Invalid Task Priority');
    }
  }
}
