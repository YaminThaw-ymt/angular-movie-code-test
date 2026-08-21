import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Movie } from '../../../models/movie.model';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss',
})
export class MovieCardComponent {
  @Input({ required: true }) movie!: Movie;

  get releaseYear(): string {
    return this.movie.release_date?.slice(0, 4) || '—';
  }

  get posterUrl(): string {
    return `https://image.tmdb.org/t/p/w342${this.movie.poster_path}`;
  }
}
