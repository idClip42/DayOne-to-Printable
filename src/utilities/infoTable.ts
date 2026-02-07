type InfoTableEntries = { [statName: string]: number };

export function RenderInfoTable(info: InfoTableEntries): string {
    const infoBlocks = Object.keys(info).map(infoName => {
        return `
        <tr>
            <td class="info-table-label">
                ${infoName}
            </td>
            <td class="info-table-value">
                ${info[infoName].toLocaleString()}
            </td>
        </tr>
        `.trim();
    });

    const fullHTML = `
<table id="info-table">
    ${infoBlocks.join("\n")}
</table>
    `.trim();

    return fullHTML;
}
