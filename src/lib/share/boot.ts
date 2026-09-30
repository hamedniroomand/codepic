import { mergeAppearance, type AppearanceConfig } from '$lib/appearance-config';
import { DEFAULT_CODE } from '$lib/default-code';
import { NO_MARKS, type LineMarks } from '$lib/marks/line-marks';

import { parseOpenParams } from './open-params';
import type { SharedSnapshot } from './share-url';

export type Boot = {
  appearance: AppearanceConfig;
  code: string;
  marks: LineMarks;
  notice: string;
};

/**
 * What the page starts with. A share link is a full snapshot and wins outright.
 * Otherwise URL parameters win over saved settings, and those win over defaults.
 */
export function resolveBoot(shared: SharedSnapshot, search: string, saved: AppearanceConfig): Boot {
  const params = parseOpenParams(search);
  return {
    appearance: shared.appearance ?? mergeAppearance(saved, params.appearance),
    code: shared.code ?? params.code ?? DEFAULT_CODE,
    marks: shared.marks ?? params.marks ?? NO_MARKS,
    notice: params.errors.join(' '),
  };
}
