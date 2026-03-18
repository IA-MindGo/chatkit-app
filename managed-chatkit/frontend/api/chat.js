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

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.error || data.message || `Backend returned ${response.status}`;
      console.error(`[/api/chat] Backend error: ${errorMsg}`, data);
      return res.status(response.status).json({ error: errorMsg, details: data });
    }

    res.status(200).json(data);

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[/api/chat] Server error:", errorMsg);
    res.status(500).json({ 
      error: "Server error", 
      details: errorMsg 
    });
  }
}
