import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, defer, of, Subject } from 'rxjs';
import { catchError, filter, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { TmdbService } from '../../core/services/tmdb.service';
import { MovieDetails } from '../../models/movie.model';
import { AsyncState } from '../../models/ui-state.model';

@Injectable()
export class MovieDetailsFacade {
  private readonly tmdb = inject(TmdbService);
  private readonly cache = new Map<number, MovieDetails>();
  private readonly id$ = new BehaviorSubject<number | null>(null);
  private readonly retry$ = new Subject<void>();
  private currentId: number | null = null;

  readonly state$: Observable<AsyncState<MovieDetails | null>> = this.id$.pipe(
    filter((id): id is number => id !== null),
    tap(id => this.currentId = id),
    switchMap(id => this.retry$.pipe(startWith(undefined), map(() => id))),
    switchMap(id => {
      const cached = this.cache.get(id);
      if (cached) return of({ state:'success' as const, data:cached, error:null });
      return defer(() => this.tmdb.getMovieDetails(id)).pipe(
        tap(movie => this.cache.set(id, movie)),
        map(movie => ({state:'success' as const, data:movie, error:null})),
        startWith({state:'loading' as const, data:null, error:null}),
        catchError(error => of({state:'error' as const, data:null, error:error?.message ?? 'Unable to load movie details.'}))
      );
    }),
    shareReplay({bufferSize:1, refCount:true})
  );

  load(id: number): void { this.id$.next(id); }
  retry(): void { if (this.currentId !== null) this.retry$.next(); }
}
