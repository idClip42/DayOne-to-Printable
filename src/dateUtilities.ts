import CONFIG from "./../config.json";

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
    
    const datePart = d.toLocaleDateString('en-US', {
        timeZone,
        // weekday: 'long',
        year: CONFIG.ENTRIES.METADATA.DATE_TIME.INCLUDE_YEAR ?
            'numeric' :
            undefined,
        month: 'long',
        day: 'numeric',
    });

    let timePart = d.toLocaleTimeString('en-US', {
        timeZone,
        hour: 'numeric',
        minute: '2-digit',
    });
    if(!timePart.endsWith("AM") && !timePart.endsWith("PM"))
        throw new Error("Time string not ending as expected.");
    timePart = timePart.replace(
        /\s?(AM|PM)$/, 
        '<span class="am-pm"> $1</span>'
    );

    return `${datePart} · ${timePart}`;
}

export function GetDayOfWeek(iso: string, timeZone: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
        timeZone,
        weekday: 'long'
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

export function GetDateColor(iso: string, timeZone: string):string{
    /** starting hue for January */
    const BASE_HUE = CONFIG.ENTRIES.METADATA.DATE_TIME.COLOR.BASE_HUE;
    /** 12 months => 30° step */
    const HUE_INCREMENT = CONFIG.ENTRIES.METADATA.DATE_TIME.COLOR.HUE_INCREMENT;

    const d = new Date(iso);
    const month = d.toLocaleDateString('en-US', {
        timeZone,
        month: 'numeric'
    });
    const monthIndex = Number(month) - 1;
    if(isNaN(monthIndex) || monthIndex < 0) throw new Error(`Invalid month: '${month}'`);

    const hue = (BASE_HUE + monthIndex * HUE_INCREMENT) % 360;
    return `hsl(${hue}, 70%, 75%)`;
}

export function GetDateColorTestHtml():string{
    const dates = [
        "1/2/25",
        "2/2/25",
        "3/2/25",
        "4/2/25",
        "5/2/25",
        "6/2/25",
        "7/2/25",
        "8/2/25",
        "9/2/25",
        "10/2/25",
        "11/2/25",
        "12/2/25"
    ];

    const htmlDates = dates.map(dStr => {
        const d = new Date(dStr);
        return `
<div style="background-color: ${GetDateColor(d.toISOString(), "America/New_York")}">
    ${dStr}
</div>
        `.trim();
    });

    return htmlDates.join("\n");
}
