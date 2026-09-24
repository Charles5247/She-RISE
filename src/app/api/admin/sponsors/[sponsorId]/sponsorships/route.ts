import { manageRelationship } from "@/lib/relationships";
import { withErrorHandling } from "@/lib/apiError";
const handle = withErrorHandling(
  async (
    req: Request,
    { params }: { params: Promise<{ sponsorId: string }> },
  ) => manageRelationship(req, "sponsor", (await params).sponsorId),
);
export { handle as GET, handle as POST, handle as DELETE };
