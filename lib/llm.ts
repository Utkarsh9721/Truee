import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) throw new Error('GROQ_API_KEY is not set');

const groq = new Groq({ apiKey });

type LlmMessage = { role: 'user' | 'assistant' | 'system'; content: string };

const SYSTEM_PROMPT = `You are truee, a professional AI assistant created to help users with clarity, depth, and precision.

## Communication style
- Be concise but complete. Prefer short paragraphs over walls of text.
- Use **markdown** naturally: headings for structure, bold for key terms, bullet lists for steps, tables for comparisons, and fenced code blocks with language tags for code.
- When explaining concepts, lead with the answer, then add context. Avoid filler phrases like "Great question!" or "Certainly!".
- For code, always specify the language in the fence (e.g. \`\`\`ts). Keep code comments minimal but meaningful.
- For multi-step instructions, use numbered lists. For feature comparisons, use tables. For warnings or key takeaways, use blockquotes.

## Boundaries
- If you don't know something, say so directly — never invent facts, citations, or APIs.
- If a request is ambiguous, ask one focused clarifying question instead of guessing.
- Never output raw HTML unless explicitly asked.

## Tone
Warm, direct, and intellectually honest. Treat the user as a capable peer, not a beginner.`;

// ── Retry helper ─────────────────────────────────────────────────────────────

function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

function isRetryable(err: any): boolean {
    const status = err?.status ?? err?.response?.status;
    if (typeof status === 'number' && (status === 429 || status >= 500)) return true;
    const code = err?.error?.code ?? err?.code;
    return code === 'rate_limit_exceeded' || code === 'server_error' || code === 'timeout';
}

async function callOnce(messages: LlmMessage[], temperature: number): Promise<string> {
    const response = await groq.chat.completions.create({
        model: 'openai/gpt-oss-20b',
        messages,
        temperature,
        max_tokens: 2048,
    });

    const content = response.choices[0]?.message?.content;
    return content?.trim() ?? '';
}

async function callWithRetry(
    messages: LlmMessage[],
    temperature: number,
    maxAttempts = 3
): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const reply = await callOnce(messages, temperature);
            if (reply) return reply;
            lastError = new Error('Empty response from model');
        } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));

            if (!isRetryable(err) || attempt === maxAttempts) {
                throw lastError;
            }
            // Exponential backoff: 500ms, 1000ms, 2000ms
            await sleep(500 * 2 ** (attempt - 1));
        }
    }

    throw lastError ?? new Error('Model call failed');
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function generateReply(
    history: { role: 'user' | 'bot'; content: string }[],
    userContent: string,
    fileText?: string
): Promise<string> {
    const messages: LlmMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.map<LlmMessage>((m) => ({
            role: m.role === 'bot' ? 'assistant' : 'user',
            content: m.content,
        })),
        {
            role: 'user',
            content: fileText
                ? `${userContent || 'Please analyze the attached file.'}\n\n--- Attached file content ---\n${fileText}`
                : userContent || '(no message)',
        },
    ];

    try {
        const reply = await callWithRetry(messages, 0.7);
        if (reply.length >= 2) return reply;

        const stricter = await callWithRetry(messages, 0.3);
        if (stricter.length >= 2) return stricter;
    } catch (err) {
        console.error('[generateReply] failed:', err);
    }

    return "I wasn't able to generate a response just now. Please try again in a moment.";
}