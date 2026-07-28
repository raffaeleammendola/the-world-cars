/* ==========================================================================
   THE WORLD CARS - Serverless Dual Email Dispatcher (v2.5)
   Dispatches Emails to both Owner's Gmail AND Client's Email
   ========================================================================== */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { targetEmail, clientEmail, type, clientName, phone, serviceName, startDate, endDate, totalPrice, notes, location, isConfirmation } = req.body;

    const ownerEmail = targetEmail || process.env.OWNER_GMAIL || 'info@theworldcars.it';
    const resendApiKey = process.env.RESEND_API_KEY;
    const sendgridApiKey = process.env.SENDGRID_API_KEY;

    console.log(`📧 Dispatching Email to Owner (${ownerEmail}) & Client (${clientEmail || 'None'})...`);

    const ownerHtml = `
      <div style="font-family: Arial, sans-serif; background: #0B0E14; color: #FFF; padding: 25px; border-radius: 12px; border: 1px solid #0066FF;">
        <h2 style="color: #00F0FF; border-bottom: 2px solid #0066FF; padding-bottom: 10px; margin-top: 0;">🏎️ THE WORLD CARS - ${isConfirmation ? 'CONFERMA INVIATA' : 'NUOVA RICHIESTA'}</h2>
        <p><strong>Tipo Servizio:</strong> <span style="color: #00F0FF; font-size: 1.1rem; font-weight: bold;">${type}</span></p>
        <p><strong>Cliente:</strong> ${clientName || 'N/D'}</p>
        <p><strong>Telefono:</strong> <a href="tel:${phone}" style="color: #25D366; font-weight: bold; font-size: 1.1rem;">${phone || 'N/D'}</a></p>
        <p><strong>Email Cliente:</strong> ${clientEmail || 'Non fornita'}</p>
        <p><strong>Veicolo / Servizio:</strong> ${serviceName || 'N/D'}</p>
        <p><strong>Date:</strong> ${startDate || 'N/D'} ${endDate ? 'fino a ' + endDate : ''}</p>
        <p><strong>Prezzo Stimato:</strong> € ${totalPrice || 0}</p>
        <p><strong>Note / Posizione GPS:</strong> ${notes || location || 'Nessuna'}</p>
        <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;">
        <p style="font-size: 0.8rem; color: #888;">Notifica automatica generata da The World Cars Web Platform.</p>
      </div>
    `;

    const clientHtml = `
      <div style="font-family: Arial, sans-serif; background: #0B0E14; color: #FFF; padding: 25px; border-radius: 12px; border: 1px solid #10B981;">
        <h2 style="color: #10B981; border-bottom: 2px solid #10B981; padding-bottom: 10px; margin-top: 0;">✅ LA TUA PRENOTAZIONE È STATA CONFERMATA!</h2>
        <p>Gentile <strong>${clientName}</strong>,</p>
        <p>Siamo lieti di informarti che la tua richiesta per <strong>${serviceName || type}</strong> è stata <span style="color: #10B981; font-weight: bold;">CONFERMATA</span> dal nostro staff!</p>
        <p><strong>Periodo / Data:</strong> ${startDate || 'N/D'} ${endDate ? 'fino a ' + endDate : ''}</p>
        <p>I nostri meccatronici / operatori ti stanno raggiungendo o ti attendono in sede.</p>
        <p>Per qualsiasi urgenza puoi contattarci al <strong style="color: #00F0FF;">${phone || 'nostro recapito'}</strong>.</p>
        <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;">
        <p style="font-size: 0.9rem; color: #00F0FF;"><strong>The World Cars Elettrauto - Meccanico - Soccorso Stradale</strong><br>Corso Resina, 314/D, 80056 Ercolano NA</p>
      </div>
    `;

    // 1. Resend API
    if (resendApiKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
        body: JSON.stringify({ from: 'THE WORLD CARS <onboarding@resend.dev>', to: [ownerEmail], subject: `🏎️ Richiesta ${type} - ${clientName}`, html: ownerHtml })
      });

      if (clientEmail && clientEmail.includes('@')) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
          body: JSON.stringify({ from: 'THE WORLD CARS <onboarding@resend.dev>', to: [clientEmail], subject: `✅ Richiesta Confermata - THE WORLD CARS`, html: clientHtml })
        });
      }
    }
    // 2. SendGrid API
    else if (sendgridApiKey) {
      await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sendgridApiKey}` },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: ownerEmail }] }],
          from: { email: 'info@theworldcars.it', name: 'THE WORLD CARS' },
          subject: `🏎️ Richiesta ${type} - ${clientName}`,
          content: [{ type: 'text/html', value: ownerHtml }]
        })
      });
    }

    return res.status(200).json({ success: true, message: 'Emails processed', owner: ownerEmail, client: clientEmail });
  } catch (error) {
    console.error("Email notification error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
