import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { WatchlistService } from './watchlist.service';

@Component({
  selector: 'app-watchlist-page',
  standalone: true,
  imports: [AsyncPipe, RouterLink, MovieCardComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './watchlist-page.component.html',
  styleUrl: './watchlist-page.component.scss',
})
export class WatchlistPageComponent {
  readonly watchlist = inject(WatchlistService);

  remove(id: number): void {
    this.watchlist.remove(id);
  }
}
