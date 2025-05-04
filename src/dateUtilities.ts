export function formatDate(iso: string, timeZone: string): string {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
        timeZone: timeZone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export function formatDateTime(iso: string, timeZone: string): string {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
        timeZone: timeZone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

interface DateConfig {
    iso: string;
    timeZone: string;
}

export function isSameLocalDay(config1: DateConfig, config2: DateConfig): boolean {
    const formatter1 = new Intl.DateTimeFormat('en-CA', {
        timeZone: config1.timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    const formatter2 = new Intl.DateTimeFormat('en-CA', {
        timeZone: config2.timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    const date1 = formatter1.format(new Date(config1.iso));
    const date2 = formatter2.format(new Date(config2.iso));

    return date1 === date2;
}
