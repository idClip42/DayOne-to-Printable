type StatEntries = {[statName:string]:number};

export function RenderStatsTable(stats:StatEntries):string{
    
    const statBlocks = Object.keys(stats).map(statName => {
        return `
        <tr>
            <td class="stat-label">
                ${statName}
            </td>
            <td class="stat-value">
                ${stats[statName].toLocaleString()}
            </td>
        </tr>
        `.trim();
    });

    const fullHTML = `
<table id="stats-table">
    ${statBlocks.join("\n")}
</table>
    `.trim();

    return fullHTML;
}