import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-google-callback',
  templateUrl: './google-callback.component.html',
  styleUrl: './google-callback.component.scss'
})
export class GoogleCallbackComponent {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    // Extract the tokens and user information from query params or response
    this.route.queryParams.subscribe((params) => {
      const accessToken = params['access_token'];
      const refreshToken = params['refresh_token'];
      const username = params['username'];

      if (accessToken && refreshToken) {
        // Pass the response to the AccountService
        this.accountService.handleGoogleAuthResponse({
          access_token: accessToken,
          refresh_token: refreshToken,
          user: {username},
        });

        // Redirect to the home page or intended page
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      } else {
        // Handle error (e.g., invalid response)
        this.router.navigate(['/authenticate/login'], {
          queryParams: { error: 'Google authentication failed' },
        });
      }
    });
  }
}
