import { TestBed } from '@angular/core/testing';
import { WatchlistService } from './watchlist.service';
import { Movie } from '../../models/movie.model';

describe('WatchlistService', () => {
  let service: WatchlistService;
  const movie: Movie = { id:1,title:'Test',overview:'',poster_path:null,backdrop_path:null,release_date:'2020-01-01',vote_average:8,vote_count:1 };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistService);
  });

  it('adds and persists a movie', () => {
    service.add(movie);
    expect(service.contains(1)).toBeTrue();
    expect(JSON.parse(localStorage.getItem('movie-watchlist')!)).toEqual([movie]);
  });

  it('does not add duplicates', () => {
    service.add(movie); service.add(movie);
    let result: Movie[] = [];
    service.watchlist$.subscribe(v => result = v);
    expect(result.length).toBe(1);
  });

  it('removes a movie', () => {
    service.add(movie); service.remove(movie.id);
    expect(service.contains(movie.id)).toBeFalse();
  });
});
