export const runtime = "nodejs";

export async function GET() {
  return Response.json({ status: "ok", service: "echoley-web", timestamp: new Date().toISOString() });
}
