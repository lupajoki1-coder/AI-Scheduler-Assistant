import { google } from 'googleapis';

// Endpoint Serverless Node.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { summary, description, start, end } = req.body;

    // 1. Ambil Kredensial dari Environment Variables
    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'); // Fix newline issue
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    if (!privateKey || !clientEmail || !calendarId) {
      throw new Error("Konfigurasi server belum lengkap (Missing Env Vars)");
    }

    // 2. Autentikasi sebagai Service Account (Robot)
    const jwtClient = new google.auth.JWT(
      clientEmail,
      null,
      privateKey,
      ['https://www.googleapis.com/auth/calendar.events']
    );

    // 3. Insert Event ke Kalender
    const calendar = google.calendar({ version: 'v3', auth: jwtClient });
    
    const event = await calendar.events.insert({
      calendarId: calendarId,
      requestBody: {
        summary: summary,
        description: description,
        start: { dateTime: start },
        end: { dateTime: end },
      },
    });

    return res.status(200).json({ status: 'success', link: event.data.htmlLink });

  } catch (error) {
    console.error("Calendar Error:", error);
    return res.status(500).json({ error: error.message });
  }
}