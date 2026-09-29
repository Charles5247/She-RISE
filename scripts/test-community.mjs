import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";

async function loadStandalone(file) {
  const js = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  return import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));
}
const { parseParticipantCsv: parse } = await loadStandalone("src/lib/participant-csv.ts");
const header = "first_name,last_name,email,phone,password,language\r\n";
const [row] = parse("\uFEFF" + header + 'Amina,"Ojo, Ade",amina@example.test,,"secret,with""quote",ha\r\n');
assert.equal(row.last_name, "Ojo, Ade");
assert.equal(row.password, 'secret,with"quote');
assert.equal(row.language, "ha");
assert.equal(parse(header + 'Amina,Ojo,,08012345678,"password\nline",yo')[0].password, "password\nline");
for (const invalid of [header, header + '"unclosed', "id,password_hash\na,hash", "first_name,password,role\nAmina,password123,admin", header + "a,b,c", header + "a,b,c,d,e,f,g", "first_name,first_name,password\na,b,abcdefgh", header + "a,b,c,d,abc\"def,ha", header + Array(101).fill("a,b,,08012345678,password123,ha").join("\n")]) assert.throws(() => parse(invalid));
const { UI_STRINGS, translateUi } = await loadStandalone("src/i18n/ui.ts");
assert.equal(new Set(UI_STRINGS.map(row => row[0])).size, UI_STRINGS.length, "No duplicate English keys");
for (const row of UI_STRINGS) { assert.equal(row.length, 4); for (const value of row) assert.ok(value.trim()); }
for (const locale of ["ha", "yo", "pcm"]) {
  assert.notEqual(translateUi(locale, "New course added: Tailoring"), "New course added: Tailoring");
  assert.ok(translateUi(locale, "Grace sent you an assignment: Sewing").includes("Sewing"));
  assert.equal(translateUi(locale, "Participant-written story"), "Participant-written story");
}
assert.equal(translateUi("ha", "Home"), "Gida");
assert.equal(translateUi("yo", "Home"), "Ilé");
for (const route of ["auth/signup", "trainer/signup", "auth/verify-otp", "auth/resend-otp", "auth/forgot-password", "auth/reset-password"]) {
  const { POST } = await loadStandalone(`src/app/api/${route}/route.ts`);
  const response = await POST();
  assert.equal(response.status, 403, route);
  assert.equal((await response.json()).code, "ADMIN_MANAGED");
}
console.log(`PASS: CSV quoting, multiline/BOM handling, invalid/privileged headers, row limits, ${UI_STRINGS.length} translations, and all six closed public auth endpoints. No database touched.`);
