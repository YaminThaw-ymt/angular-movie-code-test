# Movie Watchlist — Angular Code Test

A small Angular 17+ standalone SPA for searching TMDB movies, viewing details and managing a local watchlist.

## Architecture

- **Standalone components only**; no NgModule boilerplate.
- **RxJS** is the single reactive model. The app is driven by Observables for HTTP, route state, debounced search and local watchlist state. `switchMap`, `catchError`, `shareReplay`, `debounceTime` and `distinctUntilChanged` are used to keep async flows cancellable and testable.
- **Feature facades** isolate orchestration from presentational components.
- **TMDB service** is the HTTP boundary.
- **HTTP interceptors** inject the API key and map HTTP failures to friendly errors.
- **Search cache** is keyed by query + year + minimum rating + page.
- **Details cache** memoizes fetched movies by id.
- **Watchlist** persists minimal movie metadata in one localStorage key.
- **URL query params** preserve `q`, `year` and `minRating` for refresh and browser navigation.
- **OnPush** is used across presentational components and route pages.
- Modern Angular `@for (...; track movie.id)` is used for stable list rendering.

## Run

```bash
npm install
npm start
```

Open `http://localhost:4200`.

## Mock mode

The default development environment has `mockMode: true`, so the project runs without a TMDB key. Mock data lives in:

- `src/assets/mock/search.json`
- `src/assets/mock/movie-details.json`

To use TMDB, edit `src/environments/environment.ts`:

```ts
mockMode: false,
tmdbApiKey: 'YOUR_TMDB_V3_API_KEY'
```

The API key is appended by an HTTP interceptor, not by feature components.

## Production build

```bash
npm run build
```

Before deployment, provide the production key through your normal environment/configuration process and do not commit a real secret.

## Tests

```bash
npm test
```

The tests cover localStorage watchlist behavior and search-facade state transitions/filtering/error handling.

## Notes on filtering

TMDB's `/search/movie` endpoint supports title search and optional year, but the requested minimum-rating filter is applied client-side to the returned page. This is intentionally documented because client-side filtering changes the effective result count compared with a server-side filter.

## Stretch-ready areas

The architecture leaves clear extension points for infinite scroll/load-more and a richer id-keyed cache policy. The current implementation intentionally keeps the core code test focused and avoids scroll-event complexity unless requested.


## Stretch: Load More

Search results support a **Load more** button backed by TMDB pagination. Each page is cached by `query + year + minRating + page`, and new pages are appended without replacing existing results. The button disables while loading and when the last page has been reached. Mock mode provides three pages of results (15 movies total) so the behavior can be demonstrated without a TMDB key.


## Project organization

The source is intentionally split into `core`, `models`, `shared`, and feature folders. Page components own presentation and route bindings, while facades/services own HTTP, caching, and local persistence. Templates and SCSS are kept in separate files for readability and maintainability.
