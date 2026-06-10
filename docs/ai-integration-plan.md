# AI Integration Plan

## Overview

This document covers best practices for integrating OpenAI `gpt-4o-mini` into DevStash for the four Pro-only AI features:

- **Auto-tag suggestions** — suggest tags based on item title/content
- **Item summaries** — generate a short description from content
- **Explain This Code** — plain-English explanation of a snippet/command
- **Prompt optimizer** — rewrite a prompt to be clearer and more effective

All four features are **Pro-only** and should use the existing gating pattern in `src/lib/subscription.ts`.

---

## 1. SDK Setup and Configuration

### Installation

```bash
npm install openai
```

Use an exact version (no `^`) per project convention.

### Singleton client

Create a shared client at `src/lib/openai.ts`:

```ts
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

`OPENAI_API_KEY` must only ever live in server-side env vars. Never expose it to the browser — do not add it to `NEXT_PUBLIC_*` variables.

---

## 2. Server Action Patterns

Follow the same pattern used in `src/actions/items.ts`. Every AI action must:

1. Authenticate the caller
2. Check Pro status (see §4)
3. Validate input with Zod
4. Call OpenAI
5. Return `{ success, data, error }`

### Example: auto-tag action skeleton

File: `src/actions/ai.ts`

```ts
"use server";

import { auth } from "@/auth";
import { openai } from "@/lib/openai";
import { checkProAccess } from "@/lib/subscription";
import { AutoTagSchema } from "@/lib/validations/ai";

interface AiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function suggestTags(input: unknown): Promise<AiResult<string[]>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const proError = await checkProAccess(session.user.id);
  if (proError) return { success: false, error: proError };

  const result = AutoTagSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.errors[0].message };
  }

  const { title, content } = result.data;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a tagging assistant. Return 3–6 relevant lowercase tags as a JSON array of strings. Only return the JSON array, nothing else.",
        },
        {
          role: "user",
          content: `Title: ${title}\n\nContent: ${content?.slice(0, 1000) ?? ""}`,
        },
      ],
      max_tokens: 100,
      temperature: 0.3,
    });

    const raw = completion.choices[0].message.content ?? "[]";
    const tags: string[] = JSON.parse(raw);
    return { success: true, data: tags };
  } catch (err) {
    if (err instanceof Error && err.message.includes("rate limit")) {
      return { success: false, error: "Rate limit reached. Please try again shortly." };
    }
    return { success: false, error: "AI request failed. Please try again." };
  }
}
```

---

## 3. Streaming vs Non-Streaming

| Feature         | Recommendation | Reason                                        |
|-----------------|---------------|-----------------------------------------------|
| Auto-tag        | Non-streaming  | Short JSON output, simpler to parse            |
| Item summary    | Streaming      | Can be several sentences; streaming feels faster |
| Explain code    | Streaming      | Potentially long; users want to read as it types |
| Prompt optimizer| Streaming      | Rewrites can be long; streaming is better UX   |

### Non-streaming (auto-tag, summary short form)

Use `chat.completions.create` directly as shown above. Return the full string once complete.

### Streaming via API route

Server Actions cannot stream arbitrary chunks to the client in Next.js today — the RSC streaming mechanism is separate from token-by-token text streaming. Use an **API route** for streaming features:

File: `src/app/api/ai/explain/route.ts`

```ts
import { auth } from "@/auth";
import { openai } from "@/lib/openai";
import { checkProAccess } from "@/lib/subscription";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const proError = await checkProAccess(session.user.id);
  if (proError) return new Response(proError, { status: 403 });

  const { content, language } = await req.json();
  if (!content || typeof content !== "string") {
    return new Response("Invalid input", { status: 400 });
  }

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    stream: true,
    messages: [
      {
        role: "system",
        content: "Explain this code clearly in plain English. Focus on what it does and why.",
      },
      {
        role: "user",
        content: language ? `Language: ${language}\n\n${content.slice(0, 4000)}` : content.slice(0, 4000),
      },
    ],
    max_tokens: 500,
  });

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? "";
        if (text) controller.enqueue(new TextEncoder().encode(text));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
```

On the client, consume with `fetch` + `ReadableStream` reader:

```ts
const res = await fetch("/api/ai/explain", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ content, language }),
});
const reader = res.body!.getReader();
const decoder = new TextDecoder();
let result = "";
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  result += decoder.decode(value);
  setExplanation(result); // update state incrementally
}
```

---

## 4. Pro User Gating

Add a `checkProAccess` helper in `src/lib/subscription.ts` alongside the existing limit checks:

```ts
export async function checkProAccess(userId: string): Promise<string | null> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { isPro: true } });
  if (user?.isPro) return null;
  return "AI features are available on the Pro plan. Upgrade to unlock.";
}
```

Call it at the top of every AI server action/route before doing any OpenAI work.

---

## 5. Error Handling

Catch these OpenAI error types explicitly:

| Error class               | Cause                              | User message                           |
|---------------------------|------------------------------------|----------------------------------------|
| `openai.RateLimitError`   | Too many requests / quota exceeded | "Rate limit reached. Try again shortly." |
| `openai.APIConnectionError` | Network failure                  | "Could not reach AI service."          |
| `openai.APIError`         | Any other API error                | "AI request failed. Try again."        |

Pattern:

```ts
import OpenAI from "openai";

try {
  const completion = await openai.chat.completions.create({ ... });
} catch (err) {
  if (err instanceof OpenAI.RateLimitError) {
    return { success: false, error: "Rate limit reached. Please try again shortly." };
  }
  if (err instanceof OpenAI.APIConnectionError) {
    return { success: false, error: "Could not reach AI service. Check your connection." };
  }
  return { success: false, error: "AI request failed. Please try again." };
}
```

---

## 6. Rate Limiting for AI Actions

AI calls are expensive. Add a per-user AI rate limiter using the existing Upstash pattern in `src/lib/rate-limit.ts`:

```ts
export const aiLimiter = slidingWindow(10, "1 h"); // 10 AI calls per user per hour
```

Apply it in AI server actions:

```ts
const allowed = await checkRateLimit(aiLimiter, `ai:${session.user.id}`);
if (!allowed) {
  return { success: false, error: "AI usage limit reached. Try again later." };
}
```

---

## 7. Cost Optimization

- **Model**: Use `gpt-4o-mini` — it is the cheapest capable model for these tasks ($0.15/1M input tokens, $0.60/1M output tokens as of mid-2026).
- **Truncate input**: Slice `content` to a maximum before sending (e.g., 1000–4000 chars depending on feature). Never send the raw full content without a cap.
- **Limit output tokens**: Set `max_tokens` per feature — tags: 100, summary: 150, explain: 500, prompt optimizer: 400.
- **Temperature**: Use low temperature (0.2–0.4) for deterministic tasks (tagging, summary); slightly higher (0.6) for creative rewriting.
- **No caching needed initially**: These are on-demand calls. Add response caching only if usage data shows the same content is frequently re-queried.

### Token budget per feature

| Feature          | max input chars | max_tokens | Approx cost/call |
|------------------|-----------------|------------|-----------------|
| Auto-tag         | 1 000           | 100        | ~$0.0002        |
| Summary          | 2 000           | 150        | ~$0.0003        |
| Explain code     | 4 000           | 500        | ~$0.0008        |
| Prompt optimizer | 2 000           | 400        | ~$0.0005        |

---

## 8. UI Patterns for AI Features

### Loading state

Show a spinner or skeleton while the non-streaming action runs. For streaming, show the text building up in real time.

```tsx
const [loading, setLoading] = useState(false);
const [result, setResult] = useState<string | null>(null);

async function handleClick() {
  setLoading(true);
  const res = await suggestTags({ title, content });
  setLoading(false);
  if (res.success) setResult(res.data);
}
```

### Accept / Reject suggestions

For auto-tags and summaries, show an inline suggestion bar:

```tsx
{suggestedTags && (
  <div className="flex items-center gap-2 mt-2">
    <span className="text-xs text-muted-foreground">Suggested:</span>
    {suggestedTags.map(tag => (
      <Badge key={tag} variant="outline" className="cursor-pointer" onClick={() => addTag(tag)}>
        + {tag}
      </Badge>
    ))}
    <Button variant="ghost" size="sm" onClick={() => setSuggestedTags(null)}>Dismiss</Button>
  </div>
)}
```

For summaries and explanations, show a "Use this" / "Dismiss" button pair below the generated text.

### AI trigger placement

- **Auto-tag**: Small "Suggest tags" button near the tag input in the item drawer
- **Summary**: "Generate description" button next to the description field
- **Explain code**: "Explain" button in the item detail drawer for snippet/command types
- **Prompt optimizer**: "Optimize" button in the prompt item drawer

---

## 9. Security Considerations

### API key

- Store `OPENAI_API_KEY` in `.env.local` (never committed) and in the deployment environment
- Never reference it in client components or `NEXT_PUBLIC_*` vars
- The singleton client in `src/lib/openai.ts` is server-only — it will never be bundled into the client

### Input sanitization

- Validate all inputs with Zod before passing to OpenAI (prevent oversized or malformed payloads)
- Truncate `content` server-side before inclusion in the prompt — do not trust the client to send a reasonable length
- Do not include any user-supplied string verbatim in the **system** message; only user-turn messages should carry user data
- Sanitize any AI output before rendering in the DOM; use `{text}` JSX interpolation (not `dangerouslySetInnerHTML`) for all AI-generated text

### Prompt injection

Treat item content as untrusted user data. Keep it clearly separated from system instructions:

```ts
messages: [
  { role: "system", content: "Your fixed system instructions here." },
  { role: "user", content: userContent }, // user data stays in user role only
]
```

### Authorization double-check

Every AI route/action must independently verify auth and Pro status. Do not rely on the client to gate the UI — always enforce on the server.

---

## 10. File Structure

```
src/
  actions/
    ai.ts                  # suggestTags, generateSummary, optimizePrompt (non-streaming)
  app/
    api/
      ai/
        explain/route.ts   # streaming explain-code endpoint
        optimize/route.ts  # streaming prompt optimizer endpoint
  lib/
    openai.ts              # singleton OpenAI client
    validations/
      ai.ts                # Zod schemas: AutoTagSchema, SummarySchema, ExplainSchema, OptimizeSchema
  components/
    ai/
      SuggestTagsButton.tsx
      GenerateSummaryButton.tsx
      ExplainCodePanel.tsx
      OptimizePromptButton.tsx
```

---

## Sources

- [OpenAI Chat Completions API](https://developers.openai.com/api/docs/api-reference/chat/create)
- [OpenAI Streaming Responses](https://developers.openai.com/api/docs/guides/streaming-responses)
- [OpenAI Error Codes](https://developers.openai.com/api/docs/guides/error-codes)
- [OpenAI Rate Limits](https://developers.openai.com/api/docs/guides/rate-limits)
- [OpenAI Node.js SDK — GitHub](https://github.com/openai/openai-node)
- [GPT-4o mini Model](https://developers.openai.com/api/docs/models/gpt-4o-mini)
- [Vercel AI SDK 6: Streaming with Next.js](https://www.digitalapplied.com/blog/vercel-ai-sdk-6-streaming-chat-nextjs-guide)
- [Streaming AI Responses in Next.js — DEV Community](https://dev.to/whoffagents/streaming-ai-responses-in-nextjs-claude-openai-and-the-vercel-ai-sdk-1gm3)
