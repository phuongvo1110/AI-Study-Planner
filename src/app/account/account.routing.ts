import { Routes } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { GoogleCallbackComponent } from "./google-callback/google-callback.component";
import { ProfileComponent } from "../pages/profile/profile.component";

export const accountRoutes: Routes = [
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "register",
    component: RegisterComponent,
  },
  {
    path: 'google/callback', component: GoogleCallbackComponent
  },
];
