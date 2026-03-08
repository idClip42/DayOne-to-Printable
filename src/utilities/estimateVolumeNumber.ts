const RUN_TEST = false;

/**
 * Loosely estimate the volume number of the
 * current set of journal entries, in order to
 * validate the configured volume number.
 */
export function estimateVolumeNumber(start: Date, finish: Date): number {
    // Anything before 2022 just gets a 0.
    if (finish.getFullYear() < 2022) return 0;
    // Volume 1 is 2022.
    if (finish.getFullYear() === 2022) return 1;
    // From here on, we assume a volume every four months
    const yearsSince2023 = finish.getFullYear() - 2023;
    const thirdOfYear = Math.ceil((finish.getMonth() + 1) / 4);
    const volNum = 1 + yearsSince2023 * 3 + thirdOfYear;
    return volNum;
}

if (RUN_TEST) {
    const CASES: [number, number, number][] = [
        [2020, 1, 0],
        [2021, 2, 0],
        [2022, 3, 1],
        [2022, 9, 1],
        [2023, 1, 2],
        [2023, 4, 2],
        [2023, 5, 3],
        [2023, 8, 3],
        [2023, 9, 4],
        [2023, 12, 4],
        [2024, 4, 5],
        [2024, 8, 6],
        [2024, 12, 7],
        [2025, 4, 8],
        [2025, 8, 9],
        [2025, 12, 10],
        [2026, 4, 11],
        [2026, 8, 12],
        [2026, 12, 13],
    ];
    const tableData = CASES.map(c => {
        const y = c[0];
        const m = c[1];
        const d = new Date(y, m - 1, 1);
        const est = estimateVolumeNumber(d, d);
        const act = c[2];
        const pass = est === act;
        return {
            Year: y,
            Month: m,
            Expected: act,
            Estimated: est,
            Failures: pass ? "" : "FAIL",
        };
    });
    console.table(tableData);
}
