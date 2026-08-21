import { AsyncPipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { distinctUntilChanged, startWith } from 'rxjs/operators';

import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { SearchFacade } from './search.facade';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [
    AsyncPipe,
    DecimalPipe,
    ReactiveFormsModule,
    MovieCardComponent,
    LoadingComponent,
    EmptyStateComponent,
    ErrorMessageComponent,
  ],
  providers: [SearchFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss',
})
export class SearchPageComponent {
  readonly facade = inject(SearchFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly query = new FormControl('', { nonNullable: true });
  readonly year = new FormControl<string>('', { nonNullable: true });
  readonly minRating = new FormControl<string>('', { nonNullable: true });
  readonly state$ = this.facade.state$;
  readonly currentPage$ = this.facade.currentPage$;

  constructor() {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const query = params.get('q') ?? '';
        const yearValue = params.get('year');
        const year = yearValue && /^\d{0,4}$/.test(yearValue) ? yearValue : '';
        const ratingValue = params.get('minRating');
        const rating = ratingValue && !Number.isNaN(Number(ratingValue))
          ? ratingValue
          : '';

        this.query.setValue(query, { emitEvent: false });
        this.year.setValue(year, { emitEvent: false });
        this.minRating.setValue(rating, { emitEvent: false });

        this.facade.setParams({
          query,
          year: /^\d{4}$/.test(year) ? Number(year) : null,
          minRating: rating ? Number(rating) : null,
        });
      });

    combineLatest([
      this.query.valueChanges.pipe(startWith(this.query.value)),
      this.year.valueChanges.pipe(startWith(this.year.value)),
      this.minRating.valueChanges.pipe(startWith(this.minRating.value)),
    ])
      .pipe(
        distinctUntilChanged(
          (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2],
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(([query, year, rating]) => {
        this.facade.setParams({
          query: query.trim(),
          year: /^\d{4}$/.test(year) ? Number(year) : null,
          minRating: rating === '' ? null : Number(rating),
        });

        void this.router.navigate([], {
          queryParams: {
            q: query.trim() || null,
            year: year || null,
            minRating: rating || null,
          },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      });
  }
}
