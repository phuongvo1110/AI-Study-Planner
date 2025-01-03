import { Component, OnDestroy, OnInit } from "@angular/core";
import { debounceTime, Subscription } from "rxjs";
import { LayoutService } from "src/app/layout/service/app.layout.service";
import { Task } from "src/app/models/task";
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
    private analyticsService: AnalyticsService
  ) {
    this.subscription = this.layoutService.configUpdate$
      .pipe(debounceTime(25))
      .subscribe(() => {
        this.initCharts();
      });
  }

  ngOnInit(): void {
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
        this.analytics = response.data;
        console.log(this.analytics);
        this.generateBarChartData();
      },
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
