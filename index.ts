// Sends the "You're registered" email with the Hero Pass attached to every team member.
// Gmail credentials live in Supabase Vault and are read with the service role only.
import { createClient } from 'npm:@supabase/supabase-js@2';
import nodemailer from 'npm:nodemailer@6.9.14';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const TEAMS: Record<string, [string, string]> = {
  neural: ['Neural', 'Iron Man'], sentinel: ['Sentinel', 'Captain America'], titan: ['Titan', 'Thor'],
  pulse: ['Pulse', 'Black Panther'], rift: ['Rift', 'Doctor Strange'], multiverse: ['Multiverse', 'Spider-Man'],
};
const esc = (s: string) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// registration mails go to Microsoft (Outlook) IDs only
const MS_RE = /^[^\s@]+@(bennett\.edu\.in|outlook\.[a-z.]+|hotmail\.[a-z.]+|live\.[a-z.]+|msn\.com)$/i;
const THROTTLE_MS = 10 * 60 * 1000;

function build(name: string, realm: string) {
  const [team, hero] = TEAMS[realm] ?? ['your team', ''];
  const teamLabel = hero ? `${team} × ${hero}` : team;
  const subject = "You're registered for ASSEMBLE '26";
  const text = `Hi ${name},\n\nYou're registered for ASSEMBLE '26 with Team ${teamLabel}.\nYour Hero Pass is attached. Show it at check-in.\n\nDate: Oct 24-25, 2026\nVenue: Bennett University, Greater Noida\n\nGFG Student Chapter, Bennett University`;
  const html = `<div style="background:#07060a;padding:32px 16px;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:520px;margin:0 auto;background:#0f0d13;border:1px solid #2a2530;border-top:4px solid #e8202a;padding:28px;color:#f3ede4">
    <p style="margin:0 0 6px;font-size:12px;letter-spacing:3px;color:#e8202a">ASSEMBLE '26</p>
    <h1 style="margin:0 0 18px;font-size:26px;line-height:1.2">You're registered, ${esc(name)}!</h1>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#cfc8d4">You're in for ASSEMBLE '26 with <b style="color:#f3ede4">Team ${esc(teamLabel)}</b>.</p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#cfc8d4">Your <b style="color:#f3ede4">Hero Pass is attached</b>. Show it at check-in.</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:10px 0;border-top:1px solid #2a2530;color:#8f8a97;width:80px">Date</td><td style="padding:10px 0;border-top:1px solid #2a2530">Oct 24-25, 2026</td></tr>
      <tr><td style="padding:10px 0;border-top:1px solid #2a2530;color:#8f8a97">Venue</td><td style="padding:10px 0;border-top:1px solid #2a2530">Bennett University, Greater Noida</td></tr>
    </table>
    <p style="margin:22px 0 0;font-size:12px;color:#8f8a97">GFG Student Chapter, Bennett University</p>
  </div></div>`;
  return { subject, text, html };
}

function passAttachment(b64?: string) {
  if (!b64 || typeof b64 !== 'string' || b64.length > 2_800_000) return [];
  const clean = b64.replace(/^data:image\/png;base64,/, '');
  if (!clean.startsWith('iVBORw0KGgo')) return []; // PNG signature
  return [{ filename: 'hero-pass.png', content: clean, encoding: 'base64', contentType: 'image/png' }];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: cfg, error: cfgErr } = await admin.rpc('get_mail_config');
    if (cfgErr || !cfg?.user || !cfg?.pass) return json({ error: 'mail not configured' }, 500);
    const body = await req.json().catch(() => ({}));
    const transport = nodemailer.createTransport({ host: 'smtp.gmail.com', port: 465, secure: true, auth: { user: cfg.user, pass: cfg.pass } });
    const from = `"ASSEMBLE '26 · GFG Bennett" <${cfg.user}>`;

    // one-off admin test: { test_token, test_to: [...] }
    if (body.test_token) {
      if (!cfg.test || body.test_token !== cfg.test) return json({ error: 'bad token' }, 403);
      const to = (body.test_to ?? []).filter((e: string) => EMAIL_RE.test(e)).slice(0, 3);
      const m = build('Test Hero', 'neural');
      const out = [];
      for (const t of to) { const r = await transport.sendMail({ from, to: t, ...m, subject: '[TEST] ' + m.subject }); out.push({ to: t, id: r.messageId }); }
      return json({ ok: true, sent: out });
    }

    const auth = req.headers.get('Authorization') ?? '';
    const userClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: 'not signed in' }, 401);
    const { data: reg } = await admin.from('registrations').select('*').eq('user_id', user.id).maybeSingle();
    if (!reg) return json({ error: 'no registration' }, 404);
    if (reg.mail_sent_at && Date.now() - new Date(reg.mail_sent_at).getTime() < THROTTLE_MS) return json({ ok: true, skipped: 'sent recently' });

    const members: { name?: string; email?: string }[] = Array.isArray(reg.members) ? reg.members.slice(0, 5) : [];
    const seen = new Set<string>();
    const list = members.filter((m) => m.email && MS_RE.test(m.email) && !seen.has(m.email.toLowerCase()) && seen.add(m.email.toLowerCase()));
    if (!list.length) return json({ ok: false, error: 'no Microsoft IDs on this team' }, 400);
    const attachments = passAttachment(body.pass);

    const sent: string[] = [], failed: string[] = [];
    for (const m of list) {
      try { await transport.sendMail({ from, to: m.email!, ...build(m.name || 'hero', reg.realm), attachments }); sent.push(m.email!); }
      catch (_e) { failed.push(m.email!); }
    }
    if (sent.length) await admin.from('registrations').update({ mail_sent_at: new Date().toISOString() }).eq('id', reg.id);
    return json({ ok: sent.length > 0, sent: sent.length, failed: failed.length });
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});
