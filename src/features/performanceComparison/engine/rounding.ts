/**
 * Rounds to 4 decimal places before materiality threshold comparisons so floating-point
 * error can't flip a result, e.g. 64.1 − 63.6 = 0.4999999999999929 counts as 0.5
 * (NXT-77217 spec §5.4). Target status uses display precision instead (spec §5.6).
 */
export const roundForComparison = (value: number): number => Math.round(value * 1e4) / 1e4;
