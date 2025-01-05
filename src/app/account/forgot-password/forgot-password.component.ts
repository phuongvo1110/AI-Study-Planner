import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  providers: [MessageService]
})
export class ForgotPasswordComponent implements OnInit {
  form!: FormGroup;
  loading: boolean = false;
  submitted: boolean = false;
  error?: string;
  constructor(private messageService: MessageService, private formBuilder: FormBuilder, private accountService: AccountService) {}
  ngOnInit(): void {
    this.form = this.formBuilder.group({
          email: ["", [Validators.required, Validators.email]],
        });
  }
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
      this.accountService.sendChangePassword(this.f.email.value).subscribe({
        next: (response: any) => {
          this.loading = false;
          this.showSuccessMessage("Send Forgot Password Email Successfully");
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
