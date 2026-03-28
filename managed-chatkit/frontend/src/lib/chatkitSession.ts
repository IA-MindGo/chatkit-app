const readEnvString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

export function getWorkflowId() {
  const id =
    readEnvString(import.meta.env.VITE_CHATKIT_WORKFLOW_ID) ??
    readEnvString(import.meta.env.NEXT_PUBLIC_CHATKIT_WORKFLOW_ID);

  if (!id || id.startsWith("wf_replace")) {
    throw new Error(
      "Set VITE_CHATKIT_WORKFLOW_ID (or NEXT_PUBLIC_CHATKIT_WORKFLOW_ID) in your .env file."
    );
  }

  return id;
}

export function createClientSecretFetcher(
  workflow: string,
  endpoint =
    process.env.VITE_API_URL
      ? `${process.env.VITE_API_URL.replace(/\/$/, "")}/api/create-session`
      : "https://chatkit-backend-y0c9.onrender.com/api/create-session"
) {
  return async (currentSecret: string | null) => {
    if (currentSecret) return currentSecret;

    // retry a few times on network errors to smooth over backend startup
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workflow: { id: workflow } }),
        });

        const payload = (await response.json().catch(() => ({}))) as {
          client_secret?: string;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to create session");
        }

        if (!payload.client_secret) {
          throw new Error("Missing client secret in response");
        }

        return payload.client_secret;
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        // if this was a fetch-level failure (network), retry after a delay
        if (
          attempt < 2 &&
          err instanceof Error &&
          err.message.match(/Failed to contact backend/)
        ) {
          await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
          continue;
        }
        // otherwise bail out immediately
        throw err;
      }
    }
    // should never reach here, but throw lastError to satisfy type
    throw lastError || new Error("unknown error creating session");
  };
}
