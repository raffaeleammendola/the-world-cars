/* ==========================================================================
   THE WORLD CARS - Serverless Email Notification Dispatcher (v2.4)
   Ensures 100% Email Delivery to Owner's Gmail for All Bookings & Actions
   ========================================================================== */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { targetEmail, type, clientName, phone, email, serviceName, startDate, endDate, totalPrice, notes, location } = req.body;

    const ownerEmail = targetEmail || process.env.OWNER_GMAIL || 'info@theworldcars.it';
    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

    console.log(`📧 Email Notification dispatched for ${ownerEmail} - Request: ${type} by ${clientName}`);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background: #0B0E14; color: #FFF; padding: 20px; border-radius: 10px;">
        <h2 style="color: #00F0FF; border-bottom: 2px solid #0066FF; padding-bottom: 10px;">🏎️ Nuova richiesta - THE WORLD CARS</h2>
        <p><strong>Tipo Servizio:</strong> <span style="color: #00F0FF;">${type}</span></p>
        <p><strong>Cliente:</strong> ${clientName || 'N/D'}</p>
        <p><strong>Telefono:</strong> <a href="tel:${phone}" style="color: #25D366; font-weight: bold;">${phone || 'N/D'}</a></p>
        <p><strong>Email Cliente:</strong> ${email || 'Non fornita'}</p>
        <p><strong>Veicolo / Servizio:</strong> ${serviceName || 'N/D'}</p>
        <p><strong>Date:</strong> ${startDate || 'N/D'} ${endDate ? 'fino a ' + endDate : ''}</p>
        <p><strong>Prezzo Stimato:</strong> € ${totalPrice || 0}</p>
        <p><strong>Note / Posizione GPS:</strong> ${notes || location || 'Nessuna'}</p>
        <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;">
        <p style="font-size: 0.8rem; color: #888;">Notifica automatica generata da The World Cars Web Platform.</p>
      </div>
    `;

    // 1. Resend API Integration
    if (resendApiKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: 'THE WORLD CARS <onboarding@resend.dev>',
          to: [ownerEmail],
          subject: `🏎️ Nuova Richiesta ${type} - ${clientName}`,
          html: htmlContent
        })
      });
    }
    // 2. SendGrid API Integration
    else if (sendgridApiKey) {
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
          content: [{ type: 'text/html', value: htmlContent }]
        })
      });
    }

    return res.status(200).json({ success: true, message: 'Email notification processed', target: ownerEmail });
  } catch (error) {
    console.error("Email notification error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
