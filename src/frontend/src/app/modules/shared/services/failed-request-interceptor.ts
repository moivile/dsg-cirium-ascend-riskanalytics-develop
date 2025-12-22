import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, EMPTY, Observable, throwError } from 'rxjs';
import { NoticeService } from './notice.service';
import { Router } from '@angular/router';
import { GlobalConstants } from '../models/global-constants';

@Injectable()
export class FailedRequestInterceptor implements HttpInterceptor {
  constructor(private noticeService: NoticeService, private readonly router: Router) {}

  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.context.get(GlobalConstants.skipFailedRequestInterceptor)) {
      return next.handle(request);
    }

    return next.handle(request).pipe(
      catchError((response: HttpErrorResponse) => {
        if (response.status === 400) {
          for (const messages of Object.values(response.error.errors)) {
            (messages as string[]).forEach((message) => {
              this.noticeService.warning(message);
              return EMPTY;
            });
          }
        }
        if (response.status === 404) {
          const notFoundUrl = this.router.url.replace(this.router.url, '404');
          this.router.navigateByUrl(notFoundUrl);
        }
        if (response.status === 422) {
          this.noticeService.warning(response.error.message);
          return EMPTY;
        }
        return throwError(() => response);
      })
    );
  }
}
