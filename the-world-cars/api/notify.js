/* ==========================================================================
   THE WORLD CARS - Serverless API Endpoint: Telegram Notification Dispatcher
   Runs securely on Vercel Serverless / Node.js
   Hides Bot Token and Chat ID from client browser network inspector
   ========================================================================== */

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { type, clientName, phone, email, serviceName, startDate, endDate, totalPrice, notes, location } = req.body;

    // Retrieve secret environment variables
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn("⚠️ Telegram environment variables TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID are not set.");
      return res.status(200).json({ 
        success: false, 
        message: 'Telegram API non configurato nelle variabili ambiente di Vercel.' 
      });
    }

    // Format Markdown message according to user specification
    let tgText = `🏎️ *Nuova richiesta THE WORLD CARS*\n\n`;
    tgText += `📋 *Servizio:* ${type || 'Richiesta Generale'}\n`;
    tgText += `👤 *Nome cliente:* ${clientName || 'N/D'}\n`;
    tgText += `📞 *Telefono:* ${phone || 'N/D'}\n`;
    tgText += `✉️ *Email:* ${email || 'Non specificata'}\n`;

    if (serviceName) tgText += `🚗 *Auto / Intervento:* ${serviceName}\n`;
    if (startDate) tgText += `📅 *Data:* ${startDate} ${endDate ? 'fino a ' + endDate : ''}\n`;
    if (totalPrice) tgText += `💰 *Prezzo Stimato:* € ${totalPrice}\n`;
    if (location) tgText += `📍 *Posizione GPS:* ${location}\n`;
    if (notes) tgText += `📝 *Messaggio / Note:* ${notes}\n`;

    tgText += `\n⚙️ _Gestisci la richiesta dal Pannello Amministratore._`;

    // Execute server-side fetch to Telegram API
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const tgResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: tgText,
        parse_mode: 'Markdown'
      })
    });

    const tgData = await tgResponse.json();

    if (tgData.ok) {
      return res.status(200).json({ success: true, message: 'Notifica Telegram inviata!' });
    } else {
      console.error("Telegram API Error:", tgData);
      return res.status(400).json({ success: false, error: tgData.description });
    }

  } catch (error) {
    console.error("Serverless Notify Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
