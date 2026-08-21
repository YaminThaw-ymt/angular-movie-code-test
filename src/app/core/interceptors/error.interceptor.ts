import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export class ApiFriendlyError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiFriendlyError';
  }
}

export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Something went wrong. Please try again.';

      if (error.status === 0) message = 'Network error. Please check your connection.';
      else if (error.status === 401 || error.status === 403) message = 'TMDB authentication failed. Check the API key.';
      else if (error.status === 404) message = 'The requested movie could not be found.';
      else if (error.status === 429) message = 'Too many requests. Please wait a moment and retry.';
      else if (error.status >= 500) message = 'TMDB is temporarily unavailable. Please retry.';

      return throwError(() => new ApiFriendlyError(message, error.status));
    })
  );
