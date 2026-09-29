import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { withErrorHandling } from "@/lib/apiError";
import { parseParticipantCsv } from "@/lib/participant-csv";
import { validateAccount, accountExists, insertAccount, type AccountInput } from "@/lib/managed-accounts";

export const POST = withErrorHandling(async (req: Request) => {
  const actor = await requireRole("admin");
  if (actor instanceof Response) return actor;
  const body = await req.json().catch(() => null);
  if (typeof body?.csv !== "string" || typeof body?.confirm !== "boolean") return Response.json({ message: "Select a CSV file and preview it before importing." }, { status: 400 });
  let accounts: AccountInput[];
  try {
    const emails = new Set<string>(), phones = new Set<string>();
    accounts = parseParticipantCsv(body.csv).map((row, i) => {
      try {
        const a = validateAccount({ firstName: row.first_name, lastName: row.last_name, email: row.email, phone: row.phone, password: row.password, language: row.language || "ha", role: "participant" });
        if ((a.email && emails.has(a.email)) || (a.phone && phones.has(a.phone))) throw new Error("Duplicate email or phone in this file.");
        if (a.email) emails.add(a.email); if (a.phone) phones.add(a.phone);
        return a;
      } catch (error) { throw new Error(`Row ${i + 2}: ${(error as Error).message}`); }
    });
  } catch (error) { return Response.json({ message: (error as Error).message }, { status: 400 }); }
  try {
    return await getDb().transaction(async tx => {
      for (const [i, a] of accounts.entries()) if (await accountExists(tx, a)) return Response.json({ message: `Row ${i + 2}: email or phone is already registered. No accounts were imported.` }, { status: 409 });
      if (!body.confirm) return Response.json({ preview: accounts.map(a => ({ firstName: a.firstName, lastName: a.lastName, email: a.email, phone: a.phone, language: a.language })), count: accounts.length });
      for (const a of accounts) await insertAccount(tx, a);
      return Response.json({ count: accounts.length, ok: true }, { status: 201 });
    })();
  } catch (error) {
    if ((error as { code?: string }).code === "23505") return Response.json({ message: "An email or phone was registered during import. No accounts were imported. Preview the file again." }, { status: 409 });
    throw error;
  }
});
