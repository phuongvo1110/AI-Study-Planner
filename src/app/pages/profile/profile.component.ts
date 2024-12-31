import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { User } from 'src/app/models';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  providers: [MessageService]
})
export class ProfileComponent implements OnInit {
  user: User = {};
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  confirmPassword: string;
  submitted = false;
  passwordSubmitted = false;
  constructor(private formBuilder: FormBuilder,private accountService: AccountService, private messageService: MessageService) {

  }
  get f() { return this.profileForm.controls; }
  get p() { return this.passwordForm.controls; }
  ngOnInit(): void {
    this.profileForm = this.formBuilder.group({
      id: [''],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      created_at: [''],
      avatar: ['']
    });
    this.passwordForm = this.formBuilder.group({
      oldPassword: ["", [Validators.required, Validators.minLength(6)]],
      newPassword: ["", [Validators.required, Validators.minLength(6)]],
    });
    this.accountService.getUserInfo().subscribe({
      next: (response) => {
        this.user = response.data;
        this.profileForm.patchValue({
          id: this.user.id,
          username: this.user.username,
          email: this.user.email,
          created_at: this.user.created_at,
          avatar: this.user.avatar
        })
      }
    })
  }
  onSubmitProfile() {
    this.submitted = true;
    if (this.profileForm.invalid) {
      return;
    }
    const userValue: User = {
      email: this.profileForm.controls["email"].value,
      username: this.profileForm.controls["username"].value,
      avatar: this.profileForm.controls["avatar"].value
    }
    this.accountService.updateProfile(this.user.id, userValue).subscribe({
      next: (response: any) => {
        const userValue: User = {...this.accountService.userValue, ...response.data};
        this.user = response.data;
        console.log(this.user);
        this.accountService.updatedUser(userValue);
        this.messageService.add({ severity:'success',summary: 'Profile Update', detail: 'Profile updated successfully' });
      }
    })
  }
  onSubmitPassword() {
    this.passwordSubmitted = true;
    if (this.passwordForm.invalid) {
      return;
    }
    const passwordValue: any = {
      old_password: this.passwordForm.controls["oldPassword"].value,
      new_password: this.passwordForm.controls["newPassword"].value,
    }
    this.accountService.changePassword(this.user.id, passwordValue.old_password, passwordValue.new_password).subscribe({
      next: (response: any) => {
        console.log(response);
        this.messageService.add({ severity:'success',summary: 'Password Change', detail: 'Password changed successfully' });
      }
    });
  }
}
