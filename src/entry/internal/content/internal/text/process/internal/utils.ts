import chalk from "chalk";
import type { DayOneEntry } from "../../../../../../../types/DayOneEntry";

const REGEX_TRIPLE_BACKTICKS = /```/g;

export function isInCodeBlock(
    fullStr: string,
    offset: number,
    entry: DayOneEntry | null
): boolean {
    const beforeNewline = fullStr.substring(0, offset);
    const afterNewline = fullStr.substring(offset);

    const backtickInstancesBefore =
        beforeNewline.match(REGEX_TRIPLE_BACKTICKS)?.length ?? 0;
    const backtickInstancesAfter =
        afterNewline.match(REGEX_TRIPLE_BACKTICKS)?.length ?? 0;

    const beforeIsEven = backtickInstancesBefore % 2 === 0;
    const afterIsEven = backtickInstancesAfter % 2 === 0;

    // These should match - if they don't, there's a problem.
    if (beforeIsEven !== afterIsEven) {
        console.warn(
            chalk.yellow(
                `${entry ? new Date(entry.creationDate).toLocaleString() : "NO DATE"}: Backticks count even/odd mismatch - ${backtickInstancesBefore} vs ${backtickInstancesAfter}.`
            )
        );
        // Default to "this is in backticks, do nothing."
        return true;
    }

    // If there's an odd number of before backticks, we're mid-code-block.
    return !beforeIsEven;
}
