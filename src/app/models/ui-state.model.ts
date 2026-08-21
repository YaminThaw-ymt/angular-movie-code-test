export type LoadState = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export interface AsyncState<T> {
  state: LoadState;
  data: T;
  error: string | null;
}
