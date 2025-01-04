import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-confirm-account',
  templateUrl: './confirm-account.component.html',
  styleUrl: './confirm-account.component.scss'
})
export class ConfirmAccountComponent implements OnInit {
  loading = false;
  verified = false;
  error?: string;
  constructor(private accountService: AccountService, private route: ActivatedRoute, private router: Router, private messageService: MessageService) {

  }
  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];
    if (token) {
      this.verifyEmail(token);
    }
  }
  verifyEmail(token: string){
    this.loading = true;
    debugger
    this.accountService.verifyEmail(token).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.verified = true;
        this.messageService.add({ severity:'success', summary: 'Email verified', detail: 'Your email has been successfully verified.' });
        this.router.navigate(["/authenticate/login"], {
            queryParams: { registered: true },
          });
      }, 
      error: (error) => {
        this.loading = false;
        this.error = error.error.message;
        this.messageService.add({ severity:'error', summary: 'Email verification failed', detail: 'Failed to verify your email.' });
      }
    })
  }
}
