// Throttle: limits fn calls to at most once per `ms` milliseconds
export const throttle = (fn: () => void, ms: number): (() => void) => {
  let last = 0;
  return () => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn();
    }
  };
};

// Debounce: delays fn until after `ms` of silence
export const debounce = <T extends unknown[]>(
  fn: (...args: T) => void,
  ms: number,
): ((...args: T) => void) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: T) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};

// Type-safe querySelector with null safety
export const qs = <T extends Element>(
  selector: string,
  root: Document | Element = document,
): T | null => root.querySelector<T>(selector);

// Type-safe querySelectorAll
export const qsAll = <T extends Element>(
  selector: string,
  root: Document | Element = document,
): NodeListOf<T> => root.querySelectorAll<T>(selector);
