/** RFC 4180-style records, including escaped quotes, CRLF and quoted newlines. */
export function parseParticipantCsv(source: string): Record<string, string>[] {
  if (source.length > 1024 * 1024) throw new Error("CSV must be smaller than 1 MB.");
  const rows: string[][] = [];
  let row: string[] = [], field = "", quoted = false, closed = false;
  const text = source.replace(/^\uFEFF/, "");
  for (let i = 0; i <= text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === undefined) throw new Error("Unclosed quote in CSV.");
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else { quoted = false; closed = true; } }
      else field += c;
      continue;
    }
    if (c === '"' && !field && !closed) { quoted = true; continue; }
    if (c === "," || c === "\n" || c === "\r" || c === undefined) {
      row.push(field); field = ""; closed = false;
      if (c !== ",") { if (row.some(v => v.trim())) rows.push(row); row = []; if (c === "\r" && text[i + 1] === "\n") i++; }
    } else { if (closed || c === '"') throw new Error("Invalid quoting in CSV."); field += c; }
  }
  const header = rows.shift()?.map(h => h.trim().toLowerCase());
  const allowed = ["first_name", "last_name", "email", "phone", "password", "language"];
  if (!header || new Set(header).size !== header.length || header.some(h => !allowed.includes(h)) || !header.includes("first_name") || !header.includes("password") || (!header.includes("email") && !header.includes("phone"))) throw new Error("Use the template headers: first_name,last_name,email,phone,password,language. Raw auth-table exports are not supported.");
  if (!rows.length || rows.length > 100) throw new Error("Import between 1 and 100 participants at a time.");
  return rows.map((values, index) => {
    if (values.length !== header.length) throw new Error(`Row ${index + 2}: column count does not match the header.`);
    return Object.fromEntries(header.map((key, i) => [key, values[i]]));
  });
}
