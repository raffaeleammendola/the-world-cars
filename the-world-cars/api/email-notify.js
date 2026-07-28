/* ==========================================================================
   THE WORLD CARS - Serverless Email Notification Dispatcher
   Sends email alerts to owner's Gmail via Vercel Serverless Function
   ========================================================================== */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { type, clientName, phone, email, serviceName, startDate, endDate, totalPrice, notes, location } = req.body;

    const ownerEmail = process.env.OWNER_GMAIL || 'info@theworldcars.it';
    const sendgridApiKey = process.env.SENDGRID_API_KEY;

    console.log(`📧 Email Notification triggered for ${ownerEmail} - Request: ${type} by ${clientName}`);

    // If SendGrid or Resend API key is provided in Vercel Environment Variables
    if (sendgridApiKey) {
      const emailContent = `
        <h2>🏎️ Nuova richiesta THE WORLD CARS</h2>
        <p><strong>Tipo Servizio:</strong> ${type}</p>
        <p><strong>Cliente:</strong> ${clientName}</p>
        <p><strong>Telefono:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email || 'Non fornita'}</p>
        <p><strong>Veicolo / Servizio:</strong> ${serviceName || 'N/D'}</p>
        <p><strong>Date:</strong> ${startDate || 'N/D'} ${endDate ? 'fino a ' + endDate : ''}</p>
        <p><strong>Prezzo Stimato:</strong> € ${totalPrice || 0}</p>
        <p><strong>Note / Posizione:</strong> ${notes || location || 'Nessuna'}</p>
      `;

      await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sendgridApiKey}`
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: ownerEmail }] }],
          from: { email: 'noreply@theworldcars.it', name: 'THE WORLD CARS' },
          subject: `🏎️ Nuova Richiesta ${type} - ${clientName}`,
          content: [{ type: 'text/html', value: emailContent }]
        })
      });
    }

    return res.status(200).json({ success: true, message: 'Email notification processed' });
  } catch (error) {
    console.error("Email notification error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
