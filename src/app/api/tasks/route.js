let tasks = [];

export async function GET() {
  return Response.json(tasks);
}

export async function POST(req) {
  const { text } = await req.json();
  const newTask = { id: Date.now(), text };
  tasks.push(newTask);
  return Response.json(newTask);
}

export async function DELETE(req) {
  const { id } = await req.json();
  tasks = tasks.filter((t) => t.id !== id);
  return Response.json({ success: true });
} 