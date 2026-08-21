import { InjectionToken } from '@angular/core';

export const TMDB_API_KEY = new InjectionToken<string>('TMDB_API_KEY');
export const TMDB_BASE_URL = new InjectionToken<string>('TMDB_BASE_URL');
export const TMDB_MOCK_MODE = new InjectionToken<boolean>('TMDB_MOCK_MODE');
