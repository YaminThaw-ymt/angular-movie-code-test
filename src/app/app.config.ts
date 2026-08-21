import { ApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_MOCK_MODE } from './core/config/tmdb.token';
import { apiKeyInterceptor } from './core/interceptors/api-key.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withInMemoryScrolling({scrollPositionRestoration:'enabled'})),
    provideHttpClient(withInterceptors([apiKeyInterceptor, errorInterceptor])),
    { provide: TMDB_API_KEY, useValue: environment.tmdbApiKey },
    { provide: TMDB_BASE_URL, useValue: environment.tmdbBaseUrl },
    { provide: TMDB_MOCK_MODE, useValue: environment.mockMode }
  ]
};
