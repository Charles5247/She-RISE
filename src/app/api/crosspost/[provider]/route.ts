export async function POST() { return Response.json({ message: "External sharing is disabled for this private community." }, { status: 403 }); }
