import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TMDB_API_KEY } from '../config/tmdb.token';

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  const apiKey = inject(TMDB_API_KEY);

  if (!apiKey || !req.url.includes('api.themoviedb.org')) {
    return next(req);
  }

  return next(req.clone({
    setParams: { api_key: apiKey }
  }));
};
