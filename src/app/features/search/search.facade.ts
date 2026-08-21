import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject, combineLatest, defer, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { TmdbService } from '../../core/services/tmdb.service';
import { Movie, MovieSearchResponse } from '../../models/movie.model';
import { AsyncState } from '../../models/ui-state.model';

export interface SearchParams {
  query: string;
  year: number | null;
  minRating: number | null;
  page: number;
}

@Injectable()
export class SearchFacade {
  private readonly tmdb = inject(TmdbService);
  private readonly paramsSubject = new BehaviorSubject<SearchParams>({ query: '', year: null, minRating: null, page: 1 });
  private readonly retrySubject = new Subject<void>();
  private readonly cache = new Map<string, MovieSearchResponse>();
  private readonly totalPagesSubject = new BehaviorSubject<number>(1);
  private readonly loadingMoreSubject = new BehaviorSubject(false);

  private accumulatedMovies: Movie[] = [];
  private resultKey = '';

  readonly totalPages$ = this.totalPagesSubject.asObservable();
  readonly currentPage$ = this.paramsSubject.pipe(map(p => p.page), distinctUntilChanged(), shareReplay({ bufferSize: 1, refCount: true }));
  readonly loadingMore$ = this.loadingMoreSubject.asObservable();

  readonly state$: Observable<AsyncState<Movie[]>> = combineLatest([
    this.paramsSubject.pipe(
      debounceTime(250),
      distinctUntilChanged((a, b) => a.query === b.query && a.year === b.year && a.minRating === b.minRating && a.page === b.page)
    ),
    this.retrySubject.pipe(startWith(undefined))
  ]).pipe(
    switchMap(([params]) => this.load(params)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  setParams(params: Partial<SearchParams>): void {
    const current = this.paramsSubject.value;
    const filtersChanged = params.query !== undefined || params.year !== undefined || params.minRating !== undefined;
    const next: SearchParams = {
      ...current,
      ...params,
      page: filtersChanged ? 1 : (params.page ?? current.page)
    };

    if (filtersChanged) this.resetResults();
    this.paramsSubject.next(next);
  }

  loadMore(): void {
    const current = this.paramsSubject.value;
    if (current.page >= this.totalPagesSubject.value || this.loadingMoreSubject.value) return;
    this.loadingMoreSubject.next(true);
    this.paramsSubject.next({ ...current, page: current.page + 1 });
  }

  retry(): void { this.retrySubject.next(); }

  private load(params: SearchParams): Observable<AsyncState<Movie[]>> {
    const query = params.query.trim();
    const key = `${query.toLowerCase()}|${params.year ?? ''}|${params.minRating ?? ''}|${params.page}`;
    const baseKey = `${query.toLowerCase()}|${params.year ?? ''}|${params.minRating ?? ''}`;
    const isFirstPage = params.page === 1 || this.resultKey !== baseKey;
    if (isFirstPage) this.resetResults(baseKey);

    const cached = this.cache.get(key);
    if (cached) return of(this.appendAndState(cached, params, baseKey));

    return defer(() => this.tmdb.searchMovies(query, params.page, params.year ?? undefined, params.minRating ?? undefined)).pipe(
      tap(response => this.cache.set(key, response)),
      map(response => this.appendAndState(response, params, baseKey)),
      startWith({ state: 'loading' as const, data: this.accumulatedMovies, error: null }),
      catchError(error => {
        this.loadingMoreSubject.next(false);
        return of({ state: 'error' as const, data: this.accumulatedMovies, error: error?.message ?? 'Unable to load movies.' });
      })
    );
  }

  private appendAndState(response: MovieSearchResponse, params: SearchParams, baseKey: string): AsyncState<Movie[]> {
    this.resultKey = baseKey;
    this.totalPagesSubject.next(response.total_pages || 1);

    const q = params.query.trim().toLocaleLowerCase();
    const filtered = response.results.filter(movie => {
      const title = (movie.title ?? '').toLocaleLowerCase();
      const releaseYear = movie.release_date ? Number(movie.release_date.slice(0, 4)) : null;
      const matchesTitle = title.includes(q);
      const matchesYear = params.year === null || releaseYear === params.year;
      const matchesRating = params.minRating === null || Number(movie.vote_average) >= params.minRating;
      return matchesTitle && matchesYear && matchesRating;
    });

    const existingIds = new Set(this.accumulatedMovies.map(movie => movie.id));
    this.accumulatedMovies = [...this.accumulatedMovies, ...filtered.filter(movie => !existingIds.has(movie.id))];
    this.loadingMoreSubject.next(false);

    return { state: this.accumulatedMovies.length ? 'success' : 'empty', data: this.accumulatedMovies, error: null };
  }

  private resetResults(baseKey = ''): void {
    this.accumulatedMovies = [];
    this.resultKey = baseKey;
    this.totalPagesSubject.next(1);
    this.loadingMoreSubject.next(false);
  }
}
