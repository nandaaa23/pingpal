let pings = [];

export async function GET() {
  return Response.json(pings);
}

export async function POST(req) {
  const { text, expiresAt } = await req.json();
  const newPing = { id: Date.now(), text, expiresAt };
  pings.push(newPing);
  return Response.json(newPing);
}

export async function DELETE(req) {
  const { id } = await req.json();
  pings = pings.filter((p) => p.id !== id);
  return Response.json({ success: true });
} 