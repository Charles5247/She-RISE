/**
 * Server-side cross-post copy generation. Per spec Section 3/4/10:
 * - Copy is ALWAYS generated server-side, never client-side, so the
 *   "no program history" filter can't be bypassed.
 * - System-generated copy must NEVER contain the words "correctional",
 *   "reintegration", "rehabilitation", or "program" — it may only reference
 *   the milestone the user tagged, in her own words plus her chosen
 *   milestone label.
 * - Facebook Graph API + LinkedIn OAuth/Share API both require app review
 *   before going live — this module runs behind FEATURE_CROSSPOST_LIVE.
 *   When false (default, since no review has started), providers are mocked:
 *   the queue + undo-toast + status transitions all function for real, but
 *   the final "send" step logs instead of calling the real Graph/Share API.
 */

const BANNED_WORDS = ["correctional", "reintegration", "rehabilitation", "program"];

export const MILESTONE_LABELS: Record<string, string> = {
  first_income: "First income",
  week_complete: "Week complete",
  new_skill: "New skill",
  none: "",
};

export function containsBannedLanguage(text: string): string[] {
  const lower = text.toLowerCase();
  return BANNED_WORDS.filter((w) => lower.includes(w));
}

/**
 * Generates the public cross-post caption. Uses ONLY:
 *  - the milestone label the user selected
 *  - the free-text body the user wrote herself
 * Never appends anything referencing program history, case status, or admin
 * metadata. If the user's own body text happens to contain a banned word,
 * we still block it — dignity/consent rules apply regardless of who typed it.
 */
export function generateCrosspostCopy(body: string, milestoneType: string): { copy: string; blocked: boolean; blockedWords: string[] } {
  const label = MILESTONE_LABELS[milestoneType] || "";
  const trimmedBody = body.trim();
  const copy = label ? `${trimmedBody} #${label.replace(/\s+/g, "")} #SheRISE` : `${trimmedBody} #SheRISE`;
  const blockedWords = containsBannedLanguage(copy);
  return { copy, blocked: blockedWords.length > 0, blockedWords };
}

export const FEATURE_CROSSPOST_LIVE = process.env.FEATURE_CROSSPOST_LIVE === "true"; // default false — app review not started

export interface CrosspostProvider {
  send(params: { userId: string; copy: string; photoUrl?: string | null }): Promise<{ ok: boolean; externalId?: string; error?: string }>;
}

class MockFacebookProvider implements CrosspostProvider {
  async send({ copy }: { userId: string; copy: string; photoUrl?: string | null }) {
    console.log(`[mock:facebook] would publish -> "${copy}"`);
    return { ok: true, externalId: `fb_mock_${Date.now()}` };
  }
}

class MockLinkedInProvider implements CrosspostProvider {
  async send({ copy }: { userId: string; copy: string; photoUrl?: string | null }) {
    console.log(`[mock:linkedin] would publish -> "${copy}"`);
    return { ok: true, externalId: `li_mock_${Date.now()}` };
  }
}

// Swap these for real Graph API / LinkedIn Share API clients once app review
// clears (FEATURE_CROSSPOST_LIVE=true) — the interface stays identical.
export const facebookProvider: CrosspostProvider = new MockFacebookProvider();
export const linkedinProvider: CrosspostProvider = new MockLinkedInProvider();
