import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import * as moment from "moment";
import { MessageService } from "primeng/api";
import { User } from "src/app/models";
import { Task, TaskPriority, TaskStatus } from "src/app/models/task";
import { AccountService } from "src/app/services/account.service";
import { TaskService } from "src/app/services/tasks.service";

@Component({
  selector: "app-tasks",
  templateUrl: "./tasks.component.html",
  styleUrl: "./tasks.component.scss",
})
export class TasksComponent implements OnInit {
  constructor(
    private taskService: TaskService,
    private messageService: MessageService,
    private accountService: AccountService
  ) {}
  form!: FormGroup;
  user?: User | null;
  totalRecords: number = 0;
  currentPage: number = 1;
  rowsPerPage: number = 10;
  taskDialog: boolean = false;
  statusInput: TaskStatus;
  priorityInput: TaskPriority;
  taskForm: Task = {};
  userForm: any = {
    email: '',
    password: '',
  }
  submitted: boolean = false;
  submittedUser: boolean = false;
  loading = false;
  error?: string;
  userUpgraded: boolean = false;
  sendVerificationEmailCheck: boolean = false;
  resendVerificationEmailCheck: boolean = false;
  resendDuration: number = 60;
  messageSendVerification: string;
  remainingDuration: number = this.resendDuration;
  messageError: string;
  interval:any = null;
  pageOffset: number;
  analyzeMessage!: string;
  newTask: boolean = false;
  createUserModal: boolean = false;
  tasksStatus: TaskStatus[] = [
    { label: "Pending", value: "pending" },
    { label: "InProgress", value: "inprogress" },
    { label: "Completed", value: "completed" },
    { label: "Expired", value: "expired" },
  ];

  taskPriority: TaskPriority[] = [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
  ];

  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  ngOnInit(): void {
    this.accountService.user.subscribe((user) => {
      this.user = user;
    })
    this.user = this.accountService.userValue;
    this.loadTasks();
    this.pageOffset = this.currentPage;
  }
  filterTasks() {
    this.currentPage = 1;
    this.pageOffset = this.currentPage;
    this.loadTasks();
  }
  clearSearch() {
    this.statusInput = undefined;
    this.priorityInput = undefined;
    this.currentPage = 1;
    this.pageOffset = this.currentPage;
    this.loadTasks();
  }
  onPageChange(event: any) {
    console.log(event);
    this.pageOffset = event.page ? event.page + 1 : 1;
    this.rowsPerPage = event.rows;
    this.loadTasks();
    console.log("Current Page:", this.currentPage);
  }
  // Fetch tasks from the API
  loadTasks() {
    const status = this.statusInput
      ? this.mapStatusNumber(this.statusInput)
      : undefined;
    const priority = this.priorityInput
      ? this.mapPriorityNumber(this.priorityInput)
      : undefined;
    this.taskService
      .getTasks(status, priority, this.pageOffset, this.rowsPerPage)
      .subscribe({
        next: (data: any) => {
          this.totalRecords = data.data.meta.total;
          this.tasks = data.data.data;
          if (this.tasks !== null) {
            const tasksToExpire = this.tasks.filter(
              //@ts-ignore
              (task) => moment(task.end_date).isBefore(moment()) && task.status !== 4
            );

            if (tasksToExpire.length > 0) {
              let tasksExpired = 0;

              tasksToExpire.forEach((task) => {
                this.taskService.expireTask(task.id).subscribe({
                  next: (response: any) => {
                    tasksExpired++;

                    // Reload tasks after the last task is expired
                    if (tasksExpired === tasksToExpire.length) {
                      this.loadTasks();
                    }
                  },
                  error: (err) =>
                    this.showErrorMessage("Failed to expire task"),
                });
              });
            } else {
              this.filteredTasks = [...this.tasks];
            }
          } else {
            this.filteredTasks = [];
          }
        },
        error: (err) => this.showErrorMessage("Failed to load tasks"),
      });
  }

  openNew() {
    this.taskForm = {};
    this.submitted = false;
    this.taskDialog = true;
    this.newTask = true;
  }
  analyzeSchedule() {
    if (this.user.role && this.user.role === 'CUSTOMER') {
      this.taskService.analyzeAI(this.tasks).subscribe({
        next: (response: any) => {
          this.analyzeMessage = response.data.message;
        },
      });
    } else {
      this.createUserModal = true;
    }
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
        this.loadTasks();
        this.showSuccessMessage("Task Deleted");
      },
      error: () => this.showErrorMessage("Failed to delete task"),
    });
  }

  saveProduct() {
    this.submitted = true;
    // @ts-ignore
    this.taskForm.priority = this.taskForm.priority.value
      ? this.taskForm.priority.value
      : this.taskForm.priority;
    if (this.taskForm.id) {
      // @ts-ignore
      this.taskForm.status = this.taskForm.status.value
        ? this.taskForm.status.value
        : this.taskForm.status;
      // Update an existing task
      this.taskService.updateTask(this.taskForm.id, this.taskForm).subscribe({
        next: () => {
          this.loadTasks();
          this.showSuccessMessage("Task Updated");
          this.taskDialog = false;
        },
        error: () => this.showErrorMessage("Failed to update task"),
      });
    } else {
      // Create a new task
      //@ts-ignore
      this.taskForm.status = this.tasksStatus[0].value;
      this.taskService.createTask(this.taskForm).subscribe({
        next: () => {
          this.loadTasks();
          this.showSuccessMessage("Task Created");
          this.taskDialog = false;
          this.newTask = false;
        },
        error: (error: any) => {
          this.showErrorMessage(error.error.message)
          if (error.error.error_code === 30006) {
            this.createUserModal = true;
            this.taskDialog = false;
          }
        },
      });
    }
  }

  hideTaskDialog() {
    this.taskDialog = false;
    this.submitted = false;
    this.newTask = false;
  }
  hideUserDialog() {
    this.createUserModal = false;
    this.submittedUser = false;
  }
  saveUser() {
    this.submittedUser = true;
    this.accountService.upgradeMember(this.userForm.email, this.userForm.password).pipe().subscribe({
      next: (response: any) => {
        console.log(response);
        this.showSuccessMessage("User upgraded successfully");
        console.log(this.user);
        this.userUpgraded = true;
        if (this.user.access_token) {
          this.accountService.sendVerificationEmail(this.user.access_token).subscribe({
            next: (response: any) => {
              this.showSuccessMessage("Please confirm verification in your email");
              this.sendVerificationEmailCheck = true;
              this.remainingDuration = this.resendDuration;
              this.messageSendVerification = 'Send Email Verification Successfully';
              this.interval = setInterval(() => {
                this.remainingDuration--;
                if (this.remainingDuration <= 0) {
                  this.resendVerificationEmailCheck = true;
                  clearInterval(this.interval);
                  this.remainingDuration = this.resendDuration;
                }
              }, 1000)
            },
            error: (error: any) => {
              this.messageSendVerification = 'Send Email Verification Failed';
              this.messageError = error.error.message;
              this.sendVerificationEmailCheck = false;
            }
          })
        }
      },
      error: (error: any) => {
        this.showErrorMessage(error.error.message);
      },
    })
  }
  resendVerificationEmail() {
    this.loading = true;
    this.resendVerificationEmailCheck = false;
    this.accountService.sendVerificationEmail(this.user.access_token).subscribe({
      next: (response: any) => {
        this.remainingDuration = this.resendDuration;
        this.interval = setInterval(() => {
          this.remainingDuration--;
          if (this.remainingDuration <= 0) {
            this.resendVerificationEmailCheck = true;
            clearInterval(this.interval);
            this.remainingDuration = this.resendDuration;
          }
        }, 1000)
      },
      error: (error) => {
        this.error = error;
        this.loading = false;
        this.messageService.add({
          key: "tst",
          severity: "error",
          summary: error.error.message,
          detail: "Resend verification email failed",
        });
      },
    });
  }
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
  private showSuccessMessage(detail: string) {
    this.messageService.add({
      severity: "success",
      summary: "Success",
      detail: detail,
      life: 3000,
    });
  }

  private showErrorMessage(detail: string) {
    this.messageService.add({
      severity: "error",
      summary: "Error",
      detail: detail,
      life: 3000,
    });
  }
  private formatDateToISO(date: string): string {
    // Parse the input date and set the time to 17:00:00
    return moment(date, "YYYY-MM-DD HH:mm:ss")
      .set({ hour: 17, minute: 0, second: 0, millisecond: 0 })
      .toISOString();
  }
  mapStatus(status: any): string {
    switch (status) {
      case 1:
        return "Pending";
      case 2:
        return "InProgress";
      case 3:
        return "Completed";
      case 4:
        return "Expired";
      default:
        throw new Error("Invalid Task Status");
    }
  }

  // Helper method to map TaskPriority to API enums
  mapPriority(priority: any): string {
    switch (priority) {
      case 1:
        return "Low";
      case 2:
        return "Medium";
      case 3:
        return "High";
      default:
        throw new Error("Invalid Task Priority");
    }
  }
  mapStatusValue(status: any) {
    switch (status) {
      case 1:
        return {
          label: "Pending",
          value: "pending",
        };
      case 2:
        return {
          label: "InProgress",
          value: "inprogress",
        };
      case 3:
        return {
          label: "Completed",
          value: "completed",
        };
      case 4:
        return {
          label: "Expired",
          value: "expired",
        };
      default:
        throw new Error("Invalid Task Status");
    }
  }

  // Helper method to map TaskPriority to API enums
  mapPriorityValue(priority: any) {
    switch (priority) {
      case 1:
        return {
          label: "Low",
          value: "low",
        };
      case 2:
        return {
          label: "Medium",
          value: "medium",
        };
      case 3:
        return {
          label: "High",
          value: "high",
        };
      default:
        throw new Error("Invalid Task Priority");
    }
  }
  mapStatusNumber(status: any): number {
    switch (status.toLowerCase()) {
      case "pending":
        return 1;
      case "inprogress":
        return 2;
      case "completed":
        return 3;
      case "expired":
        return 4;
      default:
        throw new Error("Invalid Task Status");
    }
  }

  // Helper method to map TaskPriority to API enums
  mapPriorityNumber(priority: any): number {
    switch (priority.toLowerCase()) {
      case "low":
        return 1;
      case "medium":
        return 2;
      case "high":
        return 3;
      default:
        throw new Error("Invalid Task Priority");
    }
  }
}
