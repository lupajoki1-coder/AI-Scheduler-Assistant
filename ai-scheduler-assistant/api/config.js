export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Hanya mengembalikan Client ID publik, BUKAN API Key
  return new Response(JSON.stringify({
    clientId: process.env.GOOGLE_CLIENT_ID
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}