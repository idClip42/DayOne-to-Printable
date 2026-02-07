const GOLDEN_ANGLE = 137.50776405003785;

export function numberToHue(num: number, baseHue: number): number {
    return (baseHue + num * GOLDEN_ANGLE) % 360;
}
