export async function extractText(file: File): Promise<string> {
  const type = file.type;

  if (type.startsWith('text/') || type === 'application/json') {
    const text = await file.text();
    return text.slice(0, 20_000);
  }

  return `[File: ${file.name}, ${type || 'unknown type'}, ${file.size} bytes]`;
}
