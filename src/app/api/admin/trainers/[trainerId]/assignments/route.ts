import { manageRelationship } from "@/lib/relationships";
import { withErrorHandling } from "@/lib/apiError";
const handle = withErrorHandling(
  async (
    req: Request,
    { params }: { params: Promise<{ trainerId: string }> },
  ) => manageRelationship(req, "trainer", (await params).trainerId),
);
export { handle as GET, handle as POST, handle as DELETE };
