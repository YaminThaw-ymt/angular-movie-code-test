import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { TMDB_BASE_URL, TMDB_MOCK_MODE } from '../config/tmdb.token';
import { Movie, MovieDetails, MovieSearchResponse } from '../../models/movie.model';

@Injectable({ providedIn: 'root' })
export class TmdbService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(TMDB_BASE_URL);
  private readonly mockMode = inject(TMDB_MOCK_MODE);

  private readonly mockMovies$ = this.mockMode
    ? forkJoin([1, 2, 3].map(page =>
        this.http.get<MovieSearchResponse>(`assets/mock/search-page-${page}.json`)
      )).pipe(
        map(responses => responses.flatMap(response => response.results)),
        shareReplay({ bufferSize: 1, refCount: true })
      )
    : null;

  searchMovies(query: string, page: number, year?: number, minRating?: number): Observable<MovieSearchResponse> {
    if (this.mockMode && this.mockMovies$) {
      const normalizedQuery = query.trim().toLocaleLowerCase();

      return this.mockMovies$.pipe(
        map(allMovies => {
          const filtered = allMovies.filter(movie => {
            const matchesTitle = !normalizedQuery || movie.title.toLocaleLowerCase().includes(normalizedQuery);
            const releaseYear = movie.release_date ? Number(movie.release_date.slice(0, 4)) : null;
            const matchesYear = year == null || releaseYear === year;
            const matchesRating = minRating == null || Number(movie.vote_average) >= minRating;
            return matchesTitle && matchesYear && matchesRating;
          });

          const pageSize = 5;
          const start = (page - 1) * pageSize;

          return {
            page,
            results: filtered.slice(start, start + pageSize),
            total_pages: Math.max(1, Math.ceil(filtered.length / pageSize)),
            total_results: filtered.length
          };
        })
      );
    }

    let params = new HttpParams().set('page', page).set('include_adult', false);
    if (query.trim()) params = params.set('query', query.trim());
    if (year) params = params.set('year', year);

    // TMDB search requires a query. For an empty query, use discover so year/rating
    // filters can still work independently.
    if (!query.trim()) {
      if (year) params = params.set('primary_release_year', year);
      if (minRating != null) params = params.set('vote_average.gte', minRating);
      return this.http.get<MovieSearchResponse>(`${this.baseUrl}/discover/movie`, { params });
    }

    return this.http.get<MovieSearchResponse>(`${this.baseUrl}/search/movie`, { params }).pipe(
      map(response => ({
        ...response,
        results: minRating == null
          ? response.results
          : response.results.filter(movie => Number(movie.vote_average) >= minRating)
      }))
    );
  }

  getMovieDetails(id: number): Observable<MovieDetails> {
    if (this.mockMode) return this.http.get<MovieDetails>(`assets/mock/movie-${id}.json`);
    return this.http.get<MovieDetails>(`${this.baseUrl}/movie/${id}`, {
      params: { append_to_response: 'credits,recommendations' }
    });
  }
}
