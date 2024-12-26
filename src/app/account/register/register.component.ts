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
    this.accountService
      .register(formValue)
      .pipe(first())
      .subscribe({
        next: () => {
          this.router.navigate(["/authenticate/login"], {
            queryParams: { registered: true },
          });
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
}
