export function NumberToHue(num: number, baseHue: number): number {
    const GOLDEN_ANGLE = 137.50776405003785;
    return (baseHue + num * GOLDEN_ANGLE) % 360;
}
