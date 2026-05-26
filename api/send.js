export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID   = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const formData = await req.formData();
    const photo   = formData.get('photo');
    const caption = formData.get('caption');

    if (!photo || !caption) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const tgForm = new FormData();
    tgForm.append('chat_id', CHAT_ID);
    tgForm.append('photo',   photo);
    tgForm.append('caption', caption);

    const tgRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
      { method: 'POST', body: tgForm }
    );

    const tgJson = await tgRes.json();

    return new Response(JSON.stringify(tgJson), {
      status: tgRes.ok ? 200 : 502,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
