export function formatCoverDate(start: Date, end: Date) {
    const sameYear = start.getFullYear() === end.getFullYear();

    const monthFormatter = new Intl.DateTimeFormat("en-US", {
        month: "long",
    });

    const startMonth = monthFormatter.format(start);
    const endMonth = monthFormatter.format(end);

    return {
        yearLine: sameYear
            ? String(start.getFullYear())
            : `${start.getFullYear()}–${end.getFullYear()}`,

        monthLine: sameYear
            ? `${startMonth} – ${endMonth}`
            : `${startMonth} ${start.getFullYear()} – ${endMonth} ${end.getFullYear()}`,
    };
}
