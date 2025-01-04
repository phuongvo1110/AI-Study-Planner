import { NgModule } from "@angular/core";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { accountRoutes } from "./account.routing";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { CheckboxModule } from "primeng/checkbox";
import { MessageModule } from "primeng/message";
import { MessagesModule } from "primeng/messages";
import { ToastModule } from "primeng/toast";
import { ChipModule } from "primeng/chip";
import { GoogleCallbackComponent } from "./google-callback/google-callback.component";
import { ConfirmAccountComponent } from "./confirm-account/confirm-account.component";

@NgModule({
  declarations: [LoginComponent, RegisterComponent, GoogleCallbackComponent, ConfirmAccountComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(accountRoutes),
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    MessageModule,
    MessagesModule,
    ToastModule,
    ChipModule
],
})
export class AccountModule {}
