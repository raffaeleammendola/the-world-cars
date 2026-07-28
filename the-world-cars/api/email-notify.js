/* ==========================================================================
   THE WORLD CARS - Serverless Dual Email Dispatcher (v2.6)
   Dispatches Emails to Owner via FormSubmit (No API Key Required)
   ========================================================================== */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { targetEmail, clientEmail, type, clientName, phone, serviceName, startDate, endDate, totalPrice, notes, location, isConfirmation } = req.body;

    const ownerEmail = targetEmail || process.env.OWNER_GMAIL || 'info@theworldcars.it';

    console.log(`📧 Dispatching Email to Owner (${ownerEmail}) via FormSubmit Fallback...`);

    // We use FormSubmit's AJAX API for the owner email. 
    // The very first time it runs, the owner will receive an activation email from FormSubmit!
    const formData = new URLSearchParams();
    formData.append('_subject', `🏎️ Nuova Richiesta da THE WORLD CARS: ${type} - ${clientName}`);
    formData.append('Cliente', clientName || 'N/D');
    formData.append('Telefono', phone || 'N/D');
    formData.append('Email_Cliente', clientEmail || 'Non fornita');
    formData.append('Servizio_Richiesto', type || 'N/D');
    formData.append('Dettaglio_Veicolo', serviceName || 'N/D');
    formData.append('Data', `${startDate || 'N/D'} al ${endDate || ''}`);
    if (totalPrice) formData.append('Preventivo_Stimato', `€ ${totalPrice}`);
    if (location) formData.append('Posizione_GPS', location);
    if (notes) formData.append('Messaggio', notes);

    // Invia email all'owner tramite formsubmit
    const ownerResponse = await fetch(`https://formsubmit.co/ajax/${ownerEmail}`, {
      method: "POST",
      headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
      },
      body: formData.toString()
    });

    const formSubmitResult = await ownerResponse.json();
    console.log("FormSubmit Result:", formSubmitResult);

    // Se ci sono API key di Resend configurate nel server Vercel, prova a inviare l'email di conferma bella in HTML.
    // Altrimenti ignoralo (l'utente userà WhatsApp o Mailto client-side).
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && clientEmail && clientEmail.includes('@') && isConfirmation) {
      const clientHtml = `
        <div style="font-family: Arial, sans-serif; background: #0B0E14; color: #FFF; padding: 25px; border-radius: 12px; border: 1px solid #10B981;">
          <h2 style="color: #10B981; border-bottom: 2px solid #10B981; padding-bottom: 10px; margin-top: 0;">✅ LA TUA PRENOTAZIONE È STATA CONFERMATA!</h2>
          <p>Gentile <strong>${clientName}</strong>,</p>
          <p>Siamo lieti di informarti che la tua richiesta per <strong>${serviceName || type}</strong> è stata <span style="color: #10B981; font-weight: bold;">CONFERMATA</span> dal nostro staff!</p>
          <p>I nostri meccatronici / operatori ti stanno raggiungendo o ti attendono in sede.</p>
          <p>Per qualsiasi urgenza puoi contattarci al <strong style="color: #00F0FF;">${phone || 'nostro recapito'}</strong>.</p>
        </div>
      `;

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
        body: JSON.stringify({ from: 'THE WORLD CARS <onboarding@resend.dev>', to: [clientEmail], subject: `✅ Richiesta Confermata - THE WORLD CARS`, html: clientHtml })
      });
    }

    return res.status(200).json({ success: true, message: 'Owner Email processed via FormSubmit', owner: ownerEmail });
  } catch (error) {
    console.error("Email notification error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
