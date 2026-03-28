import { useMemo, useState } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import type { ChatKitOptions } from "@openai/chatkit";
import { createClientSecretFetcher, getWorkflowId } from "../lib/chatkitSession";

export function ChatKitPanel() {
  const [sessionError, setSessionError] = useState<string | null>(null);

  const { workflowId, configError } = useMemo(() => {
    try {
      return { workflowId: getWorkflowId(), configError: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { workflowId: null, configError: message };
    }
  }, []);

  const getClientSecret = useMemo(() => {
    if (!workflowId) {
      return () => Promise.reject(new Error(configError ?? "Missing workflow id"));
    }

    const base = createClientSecretFetcher(workflowId);
    return async (current: string | null) => {
      try {
        return await base(current);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setSessionError(message);
        throw err;
      }
    };
  }, [workflowId, configError]);

  const options: ChatKitOptions = {
    api: {
      getClientSecret,
    },
    theme: {
      colorScheme: 'dark',
      radius: 'pill',
      density: 'normal',
      typography: {
        baseSize: 16,
        fontFamily:
          '"OpenAI Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
        fontFamilyMono:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace',
        fontSources: [
          {
            family: 'OpenAI Sans',
            src: 'https://cdn.openai.com/common/fonts/openai-sans/v2/OpenAISans-Regular.woff2',
            weight: 400,
            style: 'normal',
            display: 'swap',
          },
        ],
      },
    },
    composer: {
      attachments: {
        enabled: true,
        maxCount: 5,
        maxSize: 10485760,
      },
      tools: [
        {
          id: 'search_docs',
          label: 'Search docs',
          shortLabel: 'Docs',
          placeholderOverride: 'Search documentation',
          icon: 'book-open',
          pinned: false,
        },
      ],
    },
    startScreen: {
      greeting: '',
      prompts: [
        {
          icon: 'circle-question',
          label: 'What is ChatKit?',
          prompt: 'What is ChatKit?',
        },
      ],
    },
  };

  const chatkit = useChatKit(options);

  if (configError) {
    return (
      <div className="m-4 rounded border border-red-400 bg-red-100 p-4 text-red-800">
        <strong>Configuration error</strong>: please set{' '}
        <code>VITE_CHATKIT_WORKFLOW_ID</code> (or{' '}
        <code>NEXT_PUBLIC_CHATKIT_WORKFLOW_ID</code>) in your frontend{' '}
        <code>.env</code> and restart the dev server.
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="m-4 rounded border border-yellow-400 bg-yellow-100 p-4 text-yellow-800">
        <strong>Session error</strong>: {sessionError}
        <br />
        Confirm the backend is running at{' '}
        <code>{process.env.VITE_API_URL ?? "https://chatkit-backend-y0c9.onrender.com"}</code>.
      </div>
    );
  }

  return (
    <div className="flex h-[90vh] w-full rounded-2xl bg-white shadow-sm transition-colors dark:bg-slate-900">
      <ChatKit control={chatkit.control} className="h-full w-full" />
    </div>
  );
}
