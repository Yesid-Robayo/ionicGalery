import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";
import { from, throwError } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);


  return from(authService.getToken()).pipe(
    switchMap((token) => {

      if (token) {
        request = request.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        });
      }

      return next(request);
    }),
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        authService.logout();
        router.navigateByUrl("/login", { replaceUrl: true });
      }

      return throwError(() => error);
    })
  );
};
