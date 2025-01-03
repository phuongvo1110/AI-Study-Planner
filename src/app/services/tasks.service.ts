import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Task } from "../models/task";
import { environment } from "src/environments/environment";
import * as moment from "moment";
import { query } from "@angular/animations";

@Injectable({
  providedIn: "root",
})
export class TaskService {
  private baseUrl = "/api/v1/tasks";

  constructor(private http: HttpClient) {}

  // Fetch all tasks
  getTasks(status?: number, priority?: number, page?: number, limit?: number): Observable<any[]> {
    const params: any = {};
    if (status !== undefined) params.status = status;
    if (priority !== undefined) params.priority = priority;
    if (page !== undefined) params.page = page;
    if (limit !== undefined) params.limit = limit;

    const queryString = new URLSearchParams(params).toString();

    const url = queryString ? `${environment.apiUrl}${this.baseUrl}?${queryString}` : `${environment.apiUrl}${this.baseUrl}`;
    return this.http.get<any[]>(url);
  }

  // Fetch a single task by ID
  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${environment.apiUrl}${this.baseUrl}/${id}`);
  }

  // Create a new task
  createTask(task: Task): Observable<Task> {
    const formattedStartDate = this.formatDate(task.start_date);
    const formattedEndDate = this.formatDate(task.end_date);
    const estimatedTime = this.calculateEstimatedTime(
      task.start_date,
      task.end_date
    );

    const body = {
      name: task.name,
      description: task.description,
      status: this.mapStatus(task.status),
      priority: this.mapPriority(task.priority),
      start_date: formattedStartDate,
      end_date: formattedEndDate,
      estimated_time: estimatedTime * 60 * 1000,
      total_spend_time: 0,
    };
    return this.http.post<Task>(`${environment.apiUrl}${this.baseUrl}`, body);
  }

  // Update an existing task
  updateTask(id: string, task: Task): Observable<Task> {
    const formattedStartDate = this.formatDate(task.start_date);
    const formattedEndDate = this.formatDate(task.end_date);
    const estimatedTime = this.calculateEstimatedTime(
      task.start_date,
      task.end_date
    );

    const body = {
      name: task.name,
      description: task.description,
      status:
        typeof task.status === "number"
          ? task.status
          : this.mapStatus(task.status),
      priority:
        typeof task.priority === "number"
          ? task.priority
          : this.mapPriority(task.priority),
      start_date: formattedStartDate,
      end_date: formattedEndDate,
      estimated_time: estimatedTime * 60 * 1000,
      total_spend_time: task.total_spend_time,
    };
    return this.http.put<Task>(
      `${environment.apiUrl}${this.baseUrl}/${id}`,
      body
    );
  }

  // Delete a task
  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}${this.baseUrl}/${id}`);
  }
  expireTask(id: string): Observable<Task> {
    return this.http.patch<Task>(`${environment.apiUrl}${this.baseUrl}/${id}/expire`, {});
  }
  updateTotalTimeSpend(id: string, timeSpend: number) : Observable<Task> {
    return this.http.patch<Task>(`${environment.apiUrl}${this.baseUrl}/${id}/total-spend-time`, {
      total_spend_time: timeSpend
    })
  }
  analyzeAI(tasks: Task[]): Observable<any> {
    const taskStrings = tasks.map((task) => 
      JSON.stringify({
        name: task.name,
        description: task.description,
        priority: task.priority,
        status: task.status,
        start_date: task.start_date,
        end_date: task.end_date,
      })
    );
    taskStrings.unshift('Read the Task Data and Provide feedback on potential adjustments: Warning about overly tight schedules that may lead to burnout. Recommending prioritization changes for improved focus and balance. (For each line of feedback put them in a seperated list and a heading title <h1 class="mt-3 text-3xl !font-extrabold tracking-tight text-primary-500"></h1> and HTML for example in <ol class="font-bold text-lg"></ol> and <li></li>. Give no JSON value inside. For any priority from 1 to 3 transfer them to Low, Medium and High respectively and status from 1 to 4 transfer them to Not Started, In Progress, Completed or Expired)');
    const requestData = {
      date: moment().format("DD-MM-YYYY"),
      tasks: taskStrings,
    };
    return this.http.post<any>(
      `${environment.apiUrl}/api/v1/ai/analyze`,
      JSON.stringify(requestData)
    );
  }
  private mapStatus(status: any): number {
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
  private mapPriority(priority: any): number {
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
  private formatDate(date: string | Date): string {
    return moment(date).format("YYYY-MM-DD HH:mm:ss");
  }

  // Helper method to calculate estimated time in minutes
  private calculateEstimatedTime(
    start_date: string | Date,
    end_date: string | Date
  ): number {
    const start = moment(start_date);
    const end = moment(end_date);
    return end.diff(start, "minutes"); // Return difference in minutes
  }
}
