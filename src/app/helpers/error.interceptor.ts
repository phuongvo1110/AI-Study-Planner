import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AccountService } from "../services/account.service";
import { catchError, Observable, throwError } from "rxjs";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private accountService: AccountService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err) => {
        if ([401, 403].includes(err.status) && this.accountService.userValue) {
          // auto logout if 401 or 403 response returned from api
          switch (err.status) {
            case 403:
              this.accountService.logout();
              break;
            case 401:
              break;
          }
        }
        return throwError(() => err);
      })
    );
  }
}
