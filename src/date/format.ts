export function formatDate(
    iso: string,
    timeZone: string,
    includeYear: boolean
): string {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
        timeZone: timeZone,
        weekday: "long",
        year: includeYear ? "numeric" : undefined,
        month: "long",
        day: "numeric",
    });
}

export function formatDateTime(
    iso: string,
    timeZone: string,
    includeYear: boolean
): string {
    const d = new Date(iso);

    const datePart = d.toLocaleDateString("en-US", {
        timeZone,
        // weekday: 'long',
        year: includeYear ? "numeric" : undefined,
        month: "long",
        day: "numeric",
    });

    let timePart = d.toLocaleTimeString("en-US", {
        timeZone,
        hour: "numeric",
        minute: "2-digit",
    });
    if (!timePart.endsWith("AM") && !timePart.endsWith("PM"))
        throw new Error("Time string not ending as expected.");
    timePart = timePart.replace(
        /\s?(AM|PM)$/,
        '<span class="am-pm"> $1</span>'
    );

    return `${datePart} · ${timePart}`;
}
