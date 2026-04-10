import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://www.indigenousrising.ai',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALLOWED_ORIGINS = [
  'https://www.indigenousrising.ai',
  'https://indigenousrising.ai',
  'http://localhost:8080',
  'http://localhost:5173',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : 'https://www.indigenousrising.ai';
  return { ...corsHeaders, 'Access-Control-Allow-Origin': allowed };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  const cors = getCorsHeaders(req);

  try {
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) {
      console.error('[CAREER] RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 503, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Parse multipart form data
    const formData = await req.formData();

    const getString = (key: string) => (formData.get(key) as string) || '';

    const applicationData = {
      full_name: getString('full_name'),
      email_address: getString('email_address'),
      phone_number: getString('phone_number') || null,
      city_province: getString('city_province'),
      work_eligibility: getString('work_eligibility'),
      role_applying_for: getString('role_applying_for'),
      preferred_start_date: getString('preferred_start_date') || null,
      preferred_work_location: getString('preferred_work_location'),
      linkedin_url: getString('linkedin_url') || null,
      portfolio_github_url: getString('portfolio_github_url') || null,
      writing_samples_url: getString('writing_samples_url') || null,
      other_links: getString('other_links') || null,
      indigenous_sovereignty_meaning: getString('indigenous_sovereignty_meaning'),
      community_experience: getString('community_experience'),
      ocap_aligned_ai_interest: getString('ocap_aligned_ai_interest'),
      indigenous_identity: getString('indigenous_identity') || null,
      ip_address: req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
    };

    // Validate required fields
    if (!applicationData.full_name || !applicationData.email_address || !applicationData.role_applying_for) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    // Process file uploads → Supabase Storage
    const resumeFile = formData.get('resume_cv') as File | null;
    const coverLetterFile = formData.get('cover_letter') as File | null;
    const timestamp = Date.now();
    const safeName = applicationData.full_name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

    let resumeUrl: string | null = null;
    let coverLetterUrl: string | null = null;

    // Prepare email attachments
    const attachments: Array<{ filename: string; content: string }> = [];

    if (resumeFile && resumeFile.size > 0) {
      const ext = resumeFile.name.split('.').pop() || 'pdf';
      const path = `${timestamp}-${safeName}/resume.${ext}`;
      const bytes = new Uint8Array(await resumeFile.arrayBuffer());

      const { error: uploadErr } = await supabase.storage
        .from('career-applications')
        .upload(path, bytes, { contentType: resumeFile.type, upsert: false });

      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from('career-applications').getPublicUrl(path);
        resumeUrl = urlData.publicUrl;
      } else {
        console.error('[CAREER] Resume upload error:', uploadErr);
      }

      // Attach to email
      const base64 = btoa(String.fromCharCode(...bytes));
      attachments.push({ filename: `Resume-${applicationData.full_name}.${ext}`, content: base64 });
    }

    if (coverLetterFile && coverLetterFile.size > 0) {
      const ext = coverLetterFile.name.split('.').pop() || 'pdf';
      const path = `${timestamp}-${safeName}/cover-letter.${ext}`;
      const bytes = new Uint8Array(await coverLetterFile.arrayBuffer());

      const { error: uploadErr } = await supabase.storage
        .from('career-applications')
        .upload(path, bytes, { contentType: coverLetterFile.type, upsert: false });

      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from('career-applications').getPublicUrl(path);
        coverLetterUrl = urlData.publicUrl;
      } else {
        console.error('[CAREER] Cover letter upload error:', uploadErr);
      }

      const base64 = btoa(String.fromCharCode(...bytes));
      attachments.push({ filename: `CoverLetter-${applicationData.full_name}.${ext}`, content: base64 });
    }

    // Store in DB for backup
    const { error: dbError } = await supabase
      .from('career_applications')
      .insert({ ...applicationData, resume_url: resumeUrl, cover_letter_url: coverLetterUrl });

    if (dbError) {
      console.error('[CAREER] DB insert error:', dbError);
      // Continue — email is more important than DB backup
    }

    // Build email HTML
    const fields = [
      ['Full Name', applicationData.full_name],
      ['Email', applicationData.email_address],
      ['Phone', applicationData.phone_number],
      ['Location', applicationData.city_province],
      ['Work Eligibility', applicationData.work_eligibility],
      ['Role', applicationData.role_applying_for],
      ['Preferred Start', applicationData.preferred_start_date],
      ['Work Location', applicationData.preferred_work_location],
      ['LinkedIn', applicationData.linkedin_url],
      ['Portfolio/GitHub', applicationData.portfolio_github_url],
      ['Writing Samples', applicationData.writing_samples_url],
      ['Other Links', applicationData.other_links],
      ['Indigenous Identity', applicationData.indigenous_identity],
    ].filter(([, v]) => v);

    const fieldRows = fields.map(([label, value]) => {
      const isUrl = typeof value === 'string' && value.startsWith('http');
      const display = isUrl ? `<a href="${value}">${value}</a>` : value;
      return `<tr><td style="padding:6px 12px;font-weight:600;vertical-align:top;white-space:nowrap;">${label}</td><td style="padding:6px 12px;">${display}</td></tr>`;
    }).join('');

    const questionRows = [
      ['What does Indigenous economic sovereignty mean to you?', applicationData.indigenous_sovereignty_meaning],
      ['Community experience', applicationData.community_experience],
      ['Interest in OCAP-aligned AI', applicationData.ocap_aligned_ai_interest],
    ].map(([q, a]) => `<h3 style="margin:16px 0 4px;">${q}</h3><p style="white-space:pre-wrap;">${a}</p>`).join('');

    const fileSection = [
      resumeUrl ? `<p><strong>Resume:</strong> <a href="${resumeUrl}">Download</a></p>` : '',
      coverLetterUrl ? `<p><strong>Cover Letter:</strong> <a href="${coverLetterUrl}">Download</a></p>` : '',
    ].filter(Boolean).join('');

    const html = `
      <h1>New Application: ${applicationData.role_applying_for}</h1>
      <h2>${applicationData.full_name}</h2>
      <table style="border-collapse:collapse;width:100%;max-width:600px;">
        ${fieldRows}
      </table>
      <hr style="margin:24px 0;" />
      <h2>Short Answers</h2>
      ${questionRows}
      ${fileSection ? `<hr style="margin:24px 0;" /><h2>Uploaded Files</h2>${fileSection}` : ''}
      <hr style="margin:24px 0;" />
      <p style="color:#666;font-size:12px;">
        Submitted at ${new Date().toISOString()} from IP ${applicationData.ip_address}
      </p>
    `;

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Indigenous Rising AI <help@indigenousrising.ai>',
        to: ['help@indigenousrising.ai'],
        reply_to: applicationData.email_address,
        subject: `New Application: ${applicationData.role_applying_for} — ${applicationData.full_name}`,
        html,
        attachments: attachments.length > 0 ? attachments : undefined,
      }),
    });

    if (!emailResponse.ok) {
      const errText = await emailResponse.text();
      console.error('[CAREER] Resend error:', errText);
      // Application is saved in DB — don't fail the whole request
      return new Response(
        JSON.stringify({ success: true, warning: 'Application saved but email notification may be delayed' }),
        { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[CAREER] Application submitted successfully:', applicationData.email_address, applicationData.role_applying_for);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[CAREER] Error:', message);
    return new Response(
      JSON.stringify({ error: 'Failed to submit application. Please try again or email careers@indigenousrising.ai directly.' }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }
});
