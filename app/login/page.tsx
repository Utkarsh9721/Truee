'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const callbackUrl = searchParams.get('callbackUrl') || '/';

    async function handleCredentials(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (mode === 'register') {
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password }),
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Registration failed');
                }
            }

            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid email or password');
                return;
            }

            router.push(callbackUrl);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    const inputBase =
        'w-full rounded-xl border border-[#e8e6dc] bg-white px-4 py-3 text-sm text-[#1f1e1d] placeholder-[#b8b5a9] transition focus:border-[#c96442] focus:outline-none focus:ring-2 focus:ring-[#c96442]/20 dark:border-[#3a3733] dark:bg-[#1f1e1c] dark:text-[#ece9e1] dark:placeholder-[#6b6862] dark:focus:border-[#c96442]';

    return (
        <div className="grid min-h-screen w-full bg-[#faf9f5] dark:bg-[#1a1917] lg:grid-cols-2">
            {/* ── Brand Panel (left) ─────────────────────────────── */}
            <div className="relative hidden overflow-hidden bg-[#1f1e1d] lg:flex lg:flex-col lg:justify-between lg:p-12">
                {/* Radial glow */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full opacity-30 blur-3xl"
                    style={{
                        background:
                            'radial-gradient(circle, #c96442 0%, transparent 70%)',
                    }}
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full opacity-20 blur-3xl"
                    style={{
                        background:
                            'radial-gradient(circle, #c96442 0%, transparent 70%)',
                    }}
                />

                {/* Logo */}
                <div className="relative flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c96442]">
                        <svg
                            className="h-5 w-5 text-white"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                        </svg>
                    </div>
                    <span className="font-serif text-lg tracking-tight text-[#ece9e1]">
                        Truee
                    </span>
                </div>

                {/* Copy */}
                <div className="relative max-w-md">
                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[#c96442]">
                        Welcome
                    </p>
                    <h2 className="font-serif text-4xl leading-tight text-[#ece9e1]">
                        A calmer space
                        <br />
                        to think and create.
                    </h2>
                    <p className="mt-4 text-sm leading-relaxed text-[#8a877e]">
                        Join thousands of people using Truee to write, build,
                        and explore ideas with an assistant that feels
                        effortless.
                    </p>

                    <ul className="mt-8 space-y-3 text-sm text-[#b8b5a9]">
                        {[
                            'Private by default',
                            'Fast, distraction-free interface',
                            'Works on every device',
                        ].map((f, i) => (
                            <li key={i} className="flex items-center gap-3">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#3a3733] text-[10px] text-[#c96442]">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                {f}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Footer */}
                <p className="relative text-xs text-[#6b6862]">
                    © {new Date().getFullYear()} Truee. All rights reserved.
                </p>
            </div>

            {/* ── Form Panel (right) ─────────────────────────────── */}
            <div className="flex items-center justify-center px-4 py-12 sm:px-8">
                <div className="w-full max-w-md">
                    {/* Mobile brand */}
                    <div className="mb-8 flex items-center gap-3 lg:hidden">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c96442]">
                            <svg
                                className="h-5 w-5 text-white"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                            </svg>
                        </div>
                        <span className="font-serif text-lg tracking-tight text-[#1f1e1d] dark:text-[#ece9e1]">
                            Truee
                        </span>
                    </div>

                    <h1 className="font-serif text-3xl text-[#1f1e1d] dark:text-[#ece9e1]">
                        {mode === 'login' ? 'Sign in' : 'Create account'}
                    </h1>
                    <p className="mt-2 text-sm text-[#8a877e]">
                        {mode === 'login'
                            ? 'Welcome back. Enter your details to continue.'
                            : 'Get started in under a minute.'}
                    </p>

                    {/* Segmented tab switcher */}
                    <div className="mt-8 grid grid-cols-2 gap-1 rounded-xl border border-[#e8e6dc] bg-[#f3f1ea] p-1 dark:border-[#3a3733] dark:bg-[#242220]">
                        <button
                            type="button"
                            onClick={() => {
                                setMode('login');
                                setError('');
                            }}
                            className={`rounded-lg py-2 text-sm font-medium transition ${mode === 'login'
                                    ? 'bg-white text-[#1f1e1d] shadow-sm dark:bg-[#33302b] dark:text-[#ece9e1]'
                                    : 'text-[#8a877e] hover:text-[#1f1e1d] dark:hover:text-[#ece9e1]'
                                }`}
                        >
                            Sign in
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setMode('register');
                                setError('');
                            }}
                            className={`rounded-lg py-2 text-sm font-medium transition ${mode === 'register'
                                    ? 'bg-white text-[#1f1e1d] shadow-sm dark:bg-[#33302b] dark:text-[#ece9e1]'
                                    : 'text-[#8a877e] hover:text-[#1f1e1d] dark:hover:text-[#ece9e1]'
                                }`}
                        >
                            Register
                        </button>
                    </div>

                    {/* OAuth */}
                    <div className="mt-6 grid gap-2 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => signIn('google', { callbackUrl })}
                            className="flex items-center justify-center gap-2 rounded-xl border border-[#e8e6dc] bg-white py-2.5 text-sm font-medium text-[#1f1e1d] transition hover:border-[#c96442]/40 hover:bg-[#faf9f5] dark:border-[#3a3733] dark:bg-[#2a2824] dark:text-[#ece9e1] dark:hover:bg-[#33302b]"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z" />
                                <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 015.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 001 12c0 1.78.42 3.46 1.18 4.94l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 00-9.82 6.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
                            </svg>
                            Google
                        </button>
                        <button
                            type="button"
                            onClick={() => signIn('github', { callbackUrl })}
                            className="flex items-center justify-center gap-2 rounded-xl border border-[#e8e6dc] bg-white py-2.5 text-sm font-medium text-[#1f1e1d] transition hover:border-[#c96442]/40 hover:bg-[#faf9f5] dark:border-[#3a3733] dark:bg-[#2a2824] dark:text-[#ece9e1] dark:hover:bg-[#33302b]"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 007.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.24 3.33.95.1-.74.4-1.24.72-1.53-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 015.8 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.26 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5z" />
                            </svg>
                            GitHub
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-3">
                        <div className="h-px flex-1 bg-[#e8e6dc] dark:bg-[#3a3733]" />
                        <span className="text-xs font-medium uppercase tracking-wider text-[#b8b5a9]">
                            or
                        </span>
                        <div className="h-px flex-1 bg-[#e8e6dc] dark:bg-[#3a3733]" />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleCredentials} className="space-y-3">
                        {mode === 'register' && (
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-1.5 block text-xs font-medium text-[#1f1e1d] dark:text-[#ece9e1]"
                                >
                                    Full name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    placeholder="Ada Lovelace"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    autoComplete="name"
                                    className={inputBase}
                                />
                            </div>
                        )}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-1.5 block text-xs font-medium text-[#1f1e1d] dark:text-[#ece9e1]"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                className={inputBase}
                            />
                        </div>
                        <div>
                            <div className="mb-1.5 flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="text-xs font-medium text-[#1f1e1d] dark:text-[#ece9e1]"
                                >
                                    Password
                                </label>
                                {mode === 'login' && (
                                    <button
                                        type="button"
                                        className="text-xs text-[#c96442] hover:underline"
                                    >
                                        Forgot?
                                    </button>
                                )}
                            </div>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                autoComplete={
                                    mode === 'login'
                                        ? 'current-password'
                                        : 'new-password'
                                }
                                className={inputBase}
                            />
                        </div>

                        {error && (
                            <div
                                role="alert"
                                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
                            >
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 w-full rounded-xl bg-[#c96442] py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#b5563a] focus:outline-none focus:ring-2 focus:ring-[#c96442]/40 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading
                                ? 'Please wait…'
                                : mode === 'login'
                                    ? 'Sign in'
                                    : 'Create account'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-xs text-[#8a877e]">
                        By continuing you agree to our{' '}
                        <a href="#" className="underline hover:text-[#c96442]">
                            Terms
                        </a>{' '}
                        and{' '}
                        <a href="#" className="underline hover:text-[#c96442]">
                            Privacy Policy
                        </a>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen w-full items-center justify-center bg-[#faf9f5] dark:bg-[#1a1917]">
                    <div className="text-sm text-[#8a877e]">Loading…</div>
                </div>
            }
        >
            <LoginForm />
        </Suspense>
    );
}