import { Component, OnDestroy, OnInit } from "@angular/core";
import { MessageService } from "primeng/api";
import { debounceTime, Subscription } from "rxjs";
import { LayoutService } from "src/app/layout/service/app.layout.service";
import { User } from "src/app/models";
import { Task } from "src/app/models/task";
import { AccountService } from "src/app/services/account.service";
import { AnalyticsService } from "src/app/services/analytic.service";
import { TaskService } from "src/app/services/tasks.service";

@Component({
  selector: "app-analytics",
  templateUrl: "./analytics.component.html",
  styleUrls: ["./analytics.component.scss"],
})
export class AnalyticsComponent implements OnDestroy, OnInit {
  subscription: Subscription;
  barData: any;
  barOptions: any;
  tasks: Task[] = [];
  daysAccessed: number = 0;
  totalTimeFocused: number = 0;
  createUserModal: boolean = false;
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
  userForm: any = {
    email: '',
    password: '',
  }
  user: User = null;
  analytics: any;
  totalTasksByStatus: { [key: string]: number } = {};
  messageAI: {
    excellent_areas: string[];
    motivation: string[];
    suggestions: string[];
  } = null;
  constructor(
    private layoutService: LayoutService,
    private taskService: TaskService,
    private analyticsService: AnalyticsService,
    private accountService: AccountService,
    private messageService: MessageService
  ) {
    this.subscription = this.layoutService.configUpdate$
      .pipe(debounceTime(25))
      .subscribe(() => {
        this.initCharts();
      });
  }

  ngOnInit(): void {
    this.accountService.user.subscribe((user) => {
      this.user = user;
    })
    this.user = this.accountService.userValue;
    console.log(this.user);
    this.taskService.getTasks().subscribe({
      next: (response: any) => {
        this.tasks = response.data.data;
        this.tasks.forEach((task) => {
          this.totalTimeFocused += task.total_spend_time;
        });
        this.totalTimeFocused = Math.round(
          this.totalTimeFocused / 60 / 1000 / 60
        );
        this.calculateTasksByStatus();
      },
    });
    this.analyticsService.getAnalytics().subscribe({
      next: (response: any) => {
        console.log(response);
        if (response.data) {
          this.analytics = response.data;
          console.log(this.analytics);
          this.generateBarChartData();
        }
      },
    });
  }
  upgradeMember() {
    this.createUserModal = true;
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
  calculateTasksByStatus() {
    this.totalTasksByStatus = {};
    this.tasks.forEach((task) => {
      const status = this.mapStatusValue(task.status);
      this.totalTasksByStatus[status.value] =
        (this.totalTasksByStatus[status.value] || 0) + 1;
    });
    console.log(this.totalTasksByStatus);
  }
  feedbackAI() {
    this.analyticsService.getAIFeedback().subscribe({
      next: (response: any) => {
        this.messageAI = response.data;
        console.log(this.messageAI);
      },
      error: () => {
        console.error("Failed to get AI feedback");
      },
    });
  }
  generateBarChartData() {
    const groupedData: { [key: string]: number } = {};

    // Convert milliseconds to minutes and populate groupedData
    Object.keys(this.analytics.total_spent_time_daily).forEach((key) => {
      groupedData[key] =
        this.analytics.total_spent_time_daily[key] / (60 * 1000); // Convert ms to minutes
    });

    console.log("group", groupedData);

    // Determine the full date range based on groupedData
    const taskDates = Object.keys(groupedData).map(
      (dateStr) => new Date(dateStr)
    );
    const minDate = new Date(
      Math.min(...taskDates.map((date) => date.getTime()))
    );
    const maxDate = new Date(
      Math.max(...taskDates.map((date) => date.getTime()))
    );

    // Adjust minDate to the nearest Monday and maxDate to the nearest Sunday
    minDate.setDate(minDate.getDate() - ((minDate.getDay() + 6) % 7)); // Set to Monday
    maxDate.setDate(maxDate.getDate() + ((7 - maxDate.getDay()) % 7)); // Set to Sunday

    // Generate all dates within the range, including zero time for missing days
    const labels: string[] = [];
    const data: number[] = [];

    for (
      let date = new Date(minDate);
      date <= maxDate;
      date.setDate(date.getDate() + 1)
    ) {
      const dateKey = date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
      labels.push(
        date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      ); // Example: Mon 1-Jan
      data.push(groupedData[dateKey] || 0); // Use total time or 0 if no data
    }

    // Prepare bar chart data
    this.barData = {
      labels: labels,
      datasets: [
        {
          label: "Total Time Spent (minutes)",
          backgroundColor: "#42A5F5",
          borderColor: "#1E88E5",
          data: data, // Values are now in minutes
        },
      ],
    };

    // Calculate days accessed based on non-zero values in groupedData
    this.daysAccessed = Object.values(groupedData).filter(
      (value) => value > 0
    ).length;

    this.initCharts();
  }

  initCharts() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue("--text-color");
    const textColorSecondary = documentStyle.getPropertyValue(
      "--text-color-secondary"
    );
    const surfaceBorder = documentStyle.getPropertyValue("--surface-border");

    this.barOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
            font: {
              weight: 500,
            },
          },
          grid: {
            display: false,
            drawBorder: false,
          },
        },
        y: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
      },
    };
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  getWeekNumber(date: Date): number {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDays =
      (date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000);
    return Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
  }

  // Helper to assign colors for each day
  getDayColor(day: string): string {
    const dayColors: { [key: string]: string } = {
      Mon: "rgba(255, 99, 132, 0.2)", // Light red
      Tue: "rgba(54, 162, 235, 0.2)", // Light blue
      Wed: "rgba(75, 192, 192, 0.2)", // Light green
      Thu: "rgba(153, 102, 255, 0.2)", // Light purple
      Fri: "rgba(255, 159, 64, 0.2)", // Light orange
      Sat: "rgba(255, 206, 86, 0.2)", // Light yellow
      Sun: "rgba(201, 203, 207, 0.2)", // Light gray
    };
    return dayColors[day] || "rgba(0, 0, 0, 0.1)"; // Default color
  }
  calculateDaysAccessed(groupedData: { [key: string]: number }): number {
    let daysAccessed = 0;

    Object.values(groupedData).forEach((timeSpent) => {
      if (timeSpent > 0) {
        daysAccessed++;
      }
    });

    return daysAccessed;
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
}
