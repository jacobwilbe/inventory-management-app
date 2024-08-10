export async function GET(request) {
    return new Response(JSON.stringify({ message: 'API is working' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }