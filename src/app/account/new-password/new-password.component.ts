import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MessageService } from "primeng/api";
import { AccountService } from "src/app/services/account.service";

@Component({
  selector: "app-new-password",
  templateUrl: "./new-password.component.html",
  styleUrl: "./new-password.component.scss",
})
export class NewPasswordComponent {
  form!: FormGroup;
  loading = false;
  submitted = false;
  error?: string;
  tokenUpdate: string;
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private messageService: MessageService
  ) {
    // redirect to home if already logged in
  }

  ngOnInit() {
    let token = this.route.snapshot.queryParams['token'];
    if (token) {
      this.tokenUpdate = token.replace(/ /g, '+');
    } else {
      console.error('No token found in query parameters');
    }
    this.form = this.formBuilder.group({
      password: ["", Validators.required],
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
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
      this.accountService.emailChangePassword(this.f.password.value, this.tokenUpdate).subscribe({
        next: (repsponse: any) => {
          this.loading = false;
          this.showSuccessMessage("Change Password Successfully");
          this.router.navigate(["/authenticate/login"]);
        },
        error: (error: any) => {
          this.loading = false;
          this.error = error.error.message;
          this.showErrorMessage(error.error.message);
        }
      })
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
}
