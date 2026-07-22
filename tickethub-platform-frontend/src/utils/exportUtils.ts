export function exportToCsv<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  headerMap?: Record<string, string>,
) {
  if (!data.length) return;

  const keys = Object.keys(data[0]);
  const headers = keys.map((k) => headerMap?.[k] ?? k);
  const csvRows = [headers.join(",")];

  for (const row of data) {
    const values = keys.map((k) => {
      const val = row[k];
      const str = val == null ? "" : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  }

  const bom = "\uFEFF";
  const blob = new Blob([bom + csvRows.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToPdf(
  title: string,
  columns: string[],
  rows: string[][],
) {
  const tableRows = rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td style="border:1px solid #d1d5db;padding:8px 12px;font-size:13px">${cell}</td>`).join("")}</tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:Inter,system-ui,sans-serif;padding:32px}h1{font-size:20px;font-weight:600;margin-bottom:8px}table{border-collapse:collapse;width:100%}th{background:#f9fafb;border:1px solid #d1d5db;padding:8px 12px;font-size:13px;font-weight:600;text-align:left}</style></head><body><h1>${title}</h1><p style="color:#6b7280;font-size:14px;margin-bottom:24px">Generated on ${new Date().toLocaleDateString()}</p><table><thead><tr>${columns.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${tableRows}</tbody></table></body></html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    win.print();
  }
}
