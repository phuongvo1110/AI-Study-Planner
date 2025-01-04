import { ChangeDetectorRef, Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable, throwError } from "rxjs";
import { User } from "../models";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";

@Injectable({ 
  providedIn: "root",
 })
export class AccountService {
  private userSubject: BehaviorSubject<User | null>;
  public user: Observable<User | null>;
  constructor(private router: Router, private http: HttpClient) {
    this.userSubject = new BehaviorSubject(
      JSON.parse(localStorage.getItem("user")!)
    );
    this.user = this.userSubject.asObservable();
  }
  public get userValue() {
    return this.userSubject.value;
  }
  login(email: string, password: string) {
    return this.http
      .post(`${environment.apiUrl}/api/v1/session/signin`, { email, password })
      .pipe(
        map((user: any) => {
          const userValue: User = {
            id: user.data.user.id,
            username: user.data.user.username,
            email: user.data.user.email,
            access_token: user.data.access_token,
            refresh_token: user.data.refresh_token,
            created_at: user.data.user.created_at,
            updated_at: user.data.user.updated_at,
            avatar: user.data.user.avatar,
            role: user.data.user.role,
          };
          localStorage.setItem("user", JSON.stringify(userValue));
          this.userSubject.next(userValue);
          return userValue;
        })
      );
  }
  loginAsGuest() {
    return this.http
      .post(`${environment.apiUrl}/api/v1/session/guest/signin`, {})
      .pipe(
        map((user: any) => {
          const userValue: User = {
            id: user.data.user.id,
            username: user.data.user.username,
            access_token: user.data.access_token,
            refresh_token: user.data.refresh_token,
            created_at: user.data.user.created_at,
            updated_at: user.data.user.updated_at,
            avatar: user.data.user.avatar
          };
          localStorage.setItem("user", JSON.stringify(userValue));
          this.userSubject.next(userValue);
          return userValue;
        })
      );
  }
  upgradeMember(email: string, password: string): Observable<User> {
    return this.http.patch<User>(`${environment.apiUrl}/api/v1/users/guest/update`, {
      email: email,
      password: password
    }).pipe(
      map((user: any) => {
        const currentUser = this.userValue;
        const userValue: User = {
          ...currentUser,
          role: "CUSTOMER",
          email: email
        };
        localStorage.setItem("user", JSON.stringify(userValue));
        this.userSubject.next(userValue);
        return userValue;
      })
    );;
  }
  updatedUser(updatedUser: User) {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    this.userSubject.next(updatedUser);
  }
  // remove user from local storage and set current user to null
  logout() {
    return this.http
      .delete(`${environment.apiUrl}/api/v1/session/signout`)
      .pipe()
      .subscribe({
        next: () => {
          localStorage.removeItem("user");
          this.userSubject.next(null);
          this.router.navigate(["/authenticate/login"]);
        },
      });
  }
  register({ username, email, password, confirm_password }) {
    return this.http.post(`${environment.apiUrl}/api/v1/session/signup`, {
      username,
      email,
      password,
      confirm_password,
    });
  }
  refreshToken() {
    const currentUser = this.userValue;
    if (!currentUser || !currentUser.refresh_token) {
      return throwError(() => new Error("No refresh token available"));
    }
  
    return this.http
      .post<any>(`${environment.apiUrl}/api/v1/session/refresh`, {
        refresh_token: currentUser.refresh_token,
      })
      .pipe(
        map((response) => {
          // Update tokens in user object
          const updatedUser = {
            ...currentUser, // Retain other user properties
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token,
          };
  
          // Save updated user to localStorage
          localStorage.setItem("user", JSON.stringify(updatedUser));
  
          // Update userSubject to reflect the new tokens
          this.userSubject.next(updatedUser);
  
          return updatedUser;
        })
      );
  }
  googleSignin(): void {
    // Redirect the user to the Google OAuth endpoint
    window.location.href = `${environment.apiUrl}/api/v1/session/google/signin`;
  }
  
  // Handle the response after redirection (use this in the callback handler)
  handleGoogleAuthResponse(response: any): void {
    const userValue: User = {
      id: response.user.id,
      username: response.user.username,
      email: response.user.email,
      access_token: response.access_token,
      refresh_token: response.refresh_token,
      created_at: response.user.created_at,
      updated_at: response.user.updated_at,
    };
  
    // Save the user data in localStorage
    localStorage.setItem('user', JSON.stringify(userValue));
  
    // Update the userSubject with the authenticated user
    this.userSubject.next(userValue);
  }
  getUserInfo(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/users/me`);
  }
  updateProfile(id: string, user: User): Observable<User> {
    return this.http.patch<User>(`${environment.apiUrl}/api/v1/users/${id}`, user);
  }
  changePassword(id: string, oldPassword: string, newPassword: string): Observable<User> {
    return this.http.patch<User>(`${environment.apiUrl}/api/v1/users/${id}/change-password`, {
      old_password: oldPassword,
      new_password: newPassword,
    })
  }
}
