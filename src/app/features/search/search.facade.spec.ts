import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SearchFacade } from './search.facade';
import { TmdbService } from '../../core/services/tmdb.service';

const response = { 
  page: 1, 
  total_pages: 1, 
  total_results: 1, 
  results: [{ 
    id: 1, 
    title: 'Test', 
    overview: '', 
    poster_path: null, 
    backdrop_path: null, 
    release_date: '2020-01-01', 
    vote_average: 8, 
    vote_count: 1 
  }] 
};

describe('SearchFacade', () => {
  let facade: SearchFacade;
  let api: jasmine.SpyObj<TmdbService>;
  beforeEach(() => {
    api = jasmine.createSpyObj('TmdbService',['searchMovies']);
    api.searchMovies.and.returnValue(of(response));
    TestBed.configureTestingModule({providers:[SearchFacade,{provide:TmdbService,useValue:api}]});
    facade = TestBed.inject(SearchFacade);
  });

  it('returns idle for an empty query', done => {
    facade.state$.subscribe(state => { if(state.state === 'idle'){ expect(api.searchMovies).not.toHaveBeenCalled(); done(); } });
  });

  it('loads and filters by minimum rating', done => {
    facade.setParams({query:'test',minRating:9});
    facade.state$.subscribe(state => { if(state.state === 'empty'){ expect(api.searchMovies).toHaveBeenCalled(); done(); } });
  });

  it('maps API errors to an error state', done => {
    api.searchMovies.and.returnValue(throwError(() => new Error('failed')));
    facade.setParams({query:'test'});
    facade.state$.subscribe(state => { if(state.state === 'error'){ expect(state.error).toBe('failed'); done(); } });
  });
});
