import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class AnalyticsService {
  private apiUrl = "api/v1/analytics";

  constructor(private http: HttpClient) {}

  getAnalytics(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/${this.apiUrl}`);
  }
  getAIFeedback(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/${this.apiUrl}/feedback`);
  }
}
