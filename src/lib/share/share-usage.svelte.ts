import { SHARE_HASH_LIMIT, measureShare, type ShareSnapshot } from './share-url';

const MEASURE_DELAY_MS = 200;

export type ShareUsage = {
  /** Share of the link limit the current snapshot takes. Above 1 means the code is dropped. */
  readonly ratio: number;
};

export function createShareUsage(source: () => ShareSnapshot): ShareUsage {
  let ratio = $state(0);

  $effect(() => {
    const snapshot = source();
    let stale = false;
    const timer = setTimeout(async () => {
      const size = await measureShare(snapshot);
      if (!stale) ratio = size / SHARE_HASH_LIMIT;
    }, MEASURE_DELAY_MS);
    return (): void => {
      stale = true;
      clearTimeout(timer);
    };
  });

  return {
    get ratio(): number {
      return ratio;
    },
  };
}
