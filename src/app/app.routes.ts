import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'search' },
  { path: 'search', loadComponent: () => import('./features/search/search-page.component').then(m => m.SearchPageComponent) },
  { path: 'movies/:id', loadComponent: () => import('./features/details/movie-details-page.component').then(m => m.MovieDetailsPageComponent) },
  { path: 'watchlist', loadComponent: () => import('./features/watchlist/watchlist-page.component').then(m => m.WatchlistPageComponent) },
  { path: '**', redirectTo: 'search' }
];
