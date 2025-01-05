import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MessageService } from "primeng/api";
import { first } from "rxjs";
import { AccountService } from "src/app/services/account.service";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrl: "./register.component.scss",
})
export class RegisterComponent {
  form!: FormGroup;
  loading = false;
  submitted = false;
  error?: string;
  sendVerificationEmailCheck: boolean = false;
  resendVerificationEmailCheck: boolean = false;
  userRegistered: any = null;
  interval: any = null;
  resendDuration: number = 60;
  messageSendVerification: string;
  remainingDuration: number = this.resendDuration;
  messageError: string;
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private messageService: MessageService
  ) {}
  ngOnInit() {
    this.form = this.formBuilder.group({
      username: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      confirmPassword: ["", [Validators.required]],
    });
  }
  get f() { return this.form.controls; }
  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    this.loading = true;
    this.error = undefined;
    const formValue = {
      email: this.form.controls["email"].value,
      username: this.form.controls["username"].value,
      password: this.form.controls["password"].value,
      confirm_password: this.form.controls["confirmPassword"].value,
    };
    debugger
    this.accountService
      .register(formValue)
      .pipe(first())
      .subscribe({
        next: (response: any) => {
          debugger
          console.log(response);
          this.userRegistered = response.data;
          this.loading = false;
          if (this.userRegistered.access_token) {
            this.accountService.sendVerificationEmail(this.userRegistered.access_token).subscribe({
              next: (response: any) => {
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
          // this.router.navigate(["/authenticate/login"], {
          //   queryParams: { registered: true },
          // });
        },
        error: (error) => {
          this.error = error;
          this.loading = false;
          this.messageService.add({
            key: "tst",
            severity: "error",
            summary: error.error.message,
            detail: "Register failed",
          });
        },
      });
  }
  resendVerificationEmail() {
    this.loading = true;
    this.resendVerificationEmailCheck = false;
    this.accountService.sendVerificationEmail(this.userRegistered.access_token).subscribe({
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
}
