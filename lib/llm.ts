import { OpenRouter } from "@openrouter/sdk";

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');

const openrouter = new OpenRouter({ apiKey });

type LlmMessage = { role: 'user' | 'assistant' | 'system'; content: string };

/**
 * OpenRouter returns `content` as either a string (text-only)
 * or an array of content parts (multimodal). This normalizes both
 * into a single trimmed string.
 */
function contentToString(content: unknown): string {
    if (typeof content === 'string') return content.trim();

    if (Array.isArray(content)) {
        return content
            .map((part) => {
                if (typeof part === 'string') return part;
                if (part && typeof part === 'object' && 'text' in part) {
                    return String((part as { text?: unknown }).text ?? '');
                }
                return '';
            })
            .join('')
            .trim();
    }

    return '';
}

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

async function callOnce(
    messages: LlmMessage[],
    temperature: number
): Promise<string> {
    const response = await openrouter.chat.send({
        chatRequest: {
            model: 'nvidia/nemotron-3-ultra-550b-a55b:free',
            messages,
            temperature,
            maxTokens: 2048,
        },
    });

    const content = response.choices[0]?.message?.content;
    return contentToString(content);
}

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

    // Try once at temperature 0.7. If the reply is empty or too short,
    // retry with a lower temperature for more deterministic output.
    let reply = await callOnce(messages, 0.7);

    if (!reply || reply.length < 2) {
        reply = await callOnce(messages, 0.3);
    }

    if (!reply) {
        return "I wasn't able to generate a response just now. Please try rephrasing your question, or try again in a moment.";
    }

    return reply;
}