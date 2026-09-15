export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Basic CORS — lock this down to your domain in production
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    const SYSTEM_PROMPT = `You are the enquiry assistant for Forgelux, a UK-based digital agency offering:
1. Web Design — custom websites, mobile-first, SEO-ready
2. Business Solutions — process audits, CRM setup, tech stack advice
3. Automations — workflow automation using Zapier, Make, n8n
4. Integrations — connecting business tools via APIs and webhooks

Your job is to have a friendly, concise conversation to understand what a potential client needs, then collect their contact details. Keep messages short (2-3 sentences max). Be warm but efficient — this person is a business owner, respect their time.

Follow this flow naturally (don't be robotic about it):
1. Greet them and ask what brings them to Forgelux
2. Find out which service(s) they're interested in
3. Understand their business briefly (what do they do, rough size)
4. Ask about their timeline and budget range (offer options: under £500 / £500–£2k / £2k+)
5. Collect their name and email so the team can follow up
6. Confirm everything and let them know someone will be in touch within 24 hours

When you have collected name, email, service interest, budget, and timeline — output a special JSON block at the END of your message in this exact format:
<!--ENQUIRY:{"name":"...","email":"...","service":"...","budget":"...","timeline":"...","notes":"..."}-->

Always be on-brand: professional, confident, and concise. No fluff. No emojis overload — one or two max per conversation.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,  // ← key lives here, never exposed
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic error:', data);
      return res.status(response.status).json({ error: 'AI service error' });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
