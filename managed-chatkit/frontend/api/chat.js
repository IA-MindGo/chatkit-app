/* eslint-disable no-undef */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { workflow } = req.body;
    const workflowId = workflow?.id;

    if (!workflowId) {
      return res.status(400).json({ error: "Missing workflow id" });
    }

    // Call backend to create session
    const backendUrl = process.env.BACKEND_URL || "https://chatkit-backend-y0c9.onrender.com";

    const response = await fetch(`${backendUrl}/api/create-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workflow: { id: workflowId },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: error.error || "Failed to create session" });
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ 
      error: "Server error", 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}
