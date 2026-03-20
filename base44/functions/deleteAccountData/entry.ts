import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const { memberName, memberEmail } = await req.json();
    const normalizedName = String(memberName || '').trim();
    const normalizedEmail = String(memberEmail || '').trim().toLowerCase();

    if (!normalizedName || !normalizedEmail) {
      return Response.json({ error: 'memberName and memberEmail are required' }, { status: 400 });
    }

    const submissions = await base44.asServiceRole.entities.Submission.filter({ member_name: normalizedName });
    const matchingSubmissions = submissions.filter((submission) =>
      String(submission.member_email || '').trim().toLowerCase() === normalizedEmail
    );

    await Promise.all(
      matchingSubmissions.map((submission) => base44.asServiceRole.entities.Submission.delete(submission.id))
    );

    return Response.json({
      success: true,
      deleted_submissions: matchingSubmissions.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});