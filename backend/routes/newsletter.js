const express = require('express');
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const router = express.Router();

const subSchema = new mongoose.Schema({
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});
const Subscriber = mongoose.model('Subscriber', subSchema);

async function sendEmail({ to, subject, html, bcc }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY not set in environment variables');
    throw new Error('Email service not configured.');
  }

  const payload = {
    from: 'Madam Seun <hello@madamseun.com.ng>',
    subject,
    html,
  };

  if (bcc && bcc.length) {
    payload.to = [process.env.GMAIL_USER || 'admin@madamseun.com.ng'];
    payload.bcc = bcc;
  } else if (to) {
    payload.to = Array.isArray(to) ? to : [to];
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('Resend API error:', data);
    throw new Error(data.message || 'Failed to send email.');
  }
  return data;
}

router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required.' });
    }

    const existing = await Subscriber.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Already subscribed.' });

    await Subscriber.create({ email });

    sendEmail({
      to: email,
      subject: 'Welcome to Madam Seun!',
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:2rem;background:#f9f9fb;border-radius:16px">
          <h2 style="color:#1a1a2e;font-size:1.4rem;margin-bottom:0.8rem">You're in!</h2>
          <p style="color:#444;line-height:1.7;margin:0 0 1rem">
            Thanks for joining the Madam Seun mailing list.<br>
            You'll be the <strong>first to know</strong> every time a new fragrance drops, and get exclusive access to our premium collection.
          </p>
          <a href="https://madamseun.com.ng"
             style="display:inline-block;padding:0.75rem 1.5rem;background:#1a1a2e;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:0.9rem">
            Shop Now
          </a>
          <p style="color:#aaa;font-size:0.75rem;margin-top:2rem">
            — Madam Seun Team &nbsp;|&nbsp; madamseun.com.ng
          </p>
        </div>`
    }).catch(err => console.error('Welcome email failed (non-blocking):', err.message));

    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/subscribers', protect, async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 }).lean();
    res.json({ subscribers, total: subscribers.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/broadcast', protect, async (req, res) => {
  try {
    const { subject, productName, productPrice, productImage, productDesc } = req.body;

    const subscribers = await Subscriber.find().lean();
    if (!subscribers.length) {
      return res.json({ sent: 0, message: 'No subscribers yet.' });
    }

    const emails = subscribers.map(s => s.email);
    const BATCH_SIZE = 50;
    let totalSent = 0;

    const emailHtml = `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:2rem;background:#f9f9fb;border-radius:16px">
        <p style="font-size:0.72rem;font-weight:700;letter-spacing:2px;color:#888;text-transform:uppercase;margin-bottom:1rem">
          New Arrival — Madam Seun
        </p>
        ${productImage ? `
          <img src="${productImage}" alt="${productName}"
               style="width:100%;border-radius:12px;margin-bottom:1.2rem;display:block">
        ` : ''}
        <h2 style="color:#1a1a2e;font-size:1.2rem;margin:0 0 0.5rem">${productName}</h2>
        ${productDesc ? `<p style="color:#555;line-height:1.7;font-size:0.88rem;margin:0 0 1rem">${productDesc}</p>` : ''}
        ${productPrice ? `
          <p style="font-size:1.3rem;font-weight:800;color:#1a1a2e;margin:0 0 1.2rem">
            ₦${Number(productPrice).toLocaleString()}
          </p>
        ` : ''}
        <a href="https://madamseun.com.ng"
           style="display:inline-block;padding:0.8rem 1.6rem;background:#1a1a2e;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:0.88rem">
          Shop Now
        </a>
        <p style="color:#bbb;font-size:0.72rem;margin-top:2rem;border-top:1px solid #e8e8e8;padding-top:1rem">
          You're receiving this because you joined the Madam Seun mailing list.
        </p>
      </div>`;

    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE);
      await sendEmail({
        bcc: batch,
        subject: subject || `New Product: ${productName}`,
        html: emailHtml,
      });
      totalSent += batch.length;

      if (i + BATCH_SIZE < emails.length) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    res.json({ sent: totalSent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { router, Subscriber, sendEmail };
