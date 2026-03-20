import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { icsContent, filename } = await req.json();

  if (!icsContent) {
    return Response.json({ error: "Missing icsContent" }, { status: 400 });
  }

  const safeName = (filename || "event.ics").replace(/[^a-zA-Z0-9._-]/g, "_");

  return new Response(icsContent, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeName}"`,
    },
  });
});