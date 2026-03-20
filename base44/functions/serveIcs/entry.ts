Deno.serve(async (req) => {
  try {
    // Accept both GET (with base64 query param) and POST (with JSON body)
    const url = new URL(req.url);

    let icsContent = "";
    let filename = "event.ics";

    if (req.method === "GET") {
      // GET: ICS content is base64-encoded in the "d" query param
      const encoded = url.searchParams.get("d");
      const fname = url.searchParams.get("f");
      if (!encoded) {
        return new Response("Missing data", { status: 400 });
      }
      icsContent = atob(encoded);
      if (fname) filename = fname;
    } else {
      // POST: JSON body with icsContent
      const body = await req.json();
      icsContent = body.icsContent || "";
      filename = body.filename || "event.ics";
    }

    if (!icsContent) {
      return new Response("No calendar data", { status: 400 });
    }

    return new Response(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store",
      },
    });
  } catch (error) {
    return new Response("Error: " + error.message, { status: 500 });
  }
});