import { AsyncPipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { WatchlistService } from '../watchlist/watchlist.service';
import { MovieDetailsFacade } from './movie-details.facade';

@Component({
  selector: 'app-movie-details-page',
  standalone: true,
  imports: [
    AsyncPipe,
    DecimalPipe,
    RouterLink,
    LoadingComponent,
    ErrorMessageComponent,
    EmptyStateComponent,
    MovieCardComponent,
  ],
  providers: [MovieDetailsFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './movie-details-page.component.html',
  styleUrl: './movie-details-page.component.scss',
})
export class MovieDetailsPageComponent {
  readonly facade = inject(MovieDetailsFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly watchlist = inject(WatchlistService);
  readonly state$ = this.facade.state$;

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => Number(params.get('id'))),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((id) => {
        if (id) {
          this.facade.load(id);
        }
      });
  }

  poster(path: string): string {
    return `https://image.tmdb.org/t/p/w780${path}`;
  }

  profile(path: string): string {
    return `https://image.tmdb.org/t/p/w185${path}`;
  }

  isSaved(id: number): boolean {
    return this.watchlist.contains(id);
  }

  toggle(movie: Parameters<WatchlistService['add']>[0]): void {
    if (this.isSaved(movie.id)) {
      this.watchlist.remove(movie.id);
    } else {
      this.watchlist.add(movie);
    }
  }
}
