import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Movie } from '../../models/movie.model';

@Injectable({providedIn:'root'})
export class WatchlistService {
  private readonly key = 'movie-watchlist';
  private readonly subject = new BehaviorSubject<Movie[]>(this.load());
  readonly watchlist$ = this.subject.asObservable();
  add(movie: Movie) {
    const items = this.subject.value;
    if (items.some(x => x.id === movie.id)) return;
    const next = [...items, movie];
    this.save(next);
    this.subject.next(next);
  }
  remove(id: number) {
    const next = this.subject.value.filter(x => x.id !== id);
    this.save(next);
    this.subject.next(next);
  }
  contains(id: number) {
    return this.subject.value.some(x => x.id === id);
  }
  private load(): Movie[] {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) as Movie[] : [];
    } catch {
      return [];
    }
  }
  private save(items: Movie[]) {
    localStorage.setItem(this.key, JSON.stringify(items));
  }
}
