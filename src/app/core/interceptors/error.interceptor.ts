import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/components/toast/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError(error => {
      // 401 is handled by auth interceptor
      if (error.status === 401) {
        return throwError(() => error);
      }

      const message = error.error?.errorMessage
        || error.error?.message
        || error.error?.title
        || getDefaultMessage(error.status);

      toastService.danger(message);

      return throwError(() => error);
    })
  );
};

function getDefaultMessage(status: number): string {
  switch (status) {
    case 0:
      return 'Unable to connect to the server';
    case 400:
      return 'Invalid request';
    case 403:
      return 'You do not have permission to perform this action';
    case 404:
      return 'The requested resource was not found';
    case 409:
      return 'A conflict occurred with the current state';
    case 422:
      return 'The request could not be processed';
    case 500:
      return 'An internal server error occurred';
    default:
      return 'An unexpected error occurred';
  }
}
