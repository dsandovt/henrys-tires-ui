import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

/**
 * HTTP interceptor to add JWT token to requests
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Get token from auth service
  const token = authService.getStoredToken();

  // Clone request and add Authorization header if token exists
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Handle response
  return next(req).pipe(
    catchError(error => {
      // If 401 Unauthorized, logout user
      if (error.status === 401) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
