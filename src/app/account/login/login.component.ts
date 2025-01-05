import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MessageService } from "primeng/api";
import { first } from "rxjs";
import { AccountService } from "src/app/services/account.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
  providers: [MessageService],
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  submitted = false;
  error?: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private messageService: MessageService
  ) {
    // redirect to home if already logged in
    if (this.accountService.userValue) {
      this.router.navigate(["/"]);
    }
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: ["", Validators.required],
      password: ["", Validators.required],
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }
  signInAsGuest() {
    this.accountService
      .loginAsGuest()
      .pipe()
      .subscribe({
        next: (response: any) => {
          const returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/";
          this.router.navigateByUrl(returnUrl);
        },
        error: (error) => {
          this.error = error;
          console.log(error);
          this.loading = false;
          this.messageService.add({
            key: "tst",
            severity: "error",
            summary: "Validation failed",
            detail: error.error.message,
          });
        },
      });
  }
  onSubmit() {
    this.submitted = true;

    // reset alert on submit
    this.error = "";

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.accountService
      .login(this.f.email.value, this.f.password.value)
      .pipe(first())
      .subscribe({
        next: () => {
          // get return url from query parameters or default to home page
          const returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/";
          this.router.navigateByUrl(returnUrl);
          this.loading = false;
        },
        error: (error) => {
          this.error = error;
          console.log(error);
          this.loading = false;
          this.messageService.add({
            key: "tst",
            severity: "error",
            summary: "Validation failed",
            detail: error.error.message,
          });
        },
      });
  }
  onGoogleSignin(): void {
    this.accountService.googleSignin();
  }
}
