'use client';

import { useServerInsertedHTML } from 'next/navigation';

export default function ThemeInitScript({ script }: { script: string }) {
    useServerInsertedHTML(() => (
        <script dangerouslySetInnerHTML={{ __html: script }} />
    ));
    return null;
}