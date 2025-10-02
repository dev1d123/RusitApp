import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Calculadora de Métodos Numéricos',
  description: 'Métodos cerrados y abiertos para raíces de ecuaciones no lineales'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased selection:bg-fuchsia-200 selection:text-fuchsia-900">
        {/* Decorative animated gradient background */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10"
        >
          <div className="absolute left-1/2 top-[-10%] h-[50vmax] w-[50vmax] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-300 via-fuchsia-300 to-amber-200 blur-3xl opacity-30 animate-pulse" />
          <div className="absolute right-[-10%] bottom-[-10%] h-[40vmax] w-[40vmax] rounded-full bg-gradient-to-tr from-sky-200 via-emerald-200 to-indigo-200 blur-3xl opacity-25 animate-pulse" />
        </div>

        <header className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-700 to-fuchsia-700 bg-clip-text text-transparent">
              Calculadora de Métodos Numéricos
            </h1>
            <nav className="mt-3">
              <ul className="flex flex-wrap gap-4 text-sm">
                <li><Link className="text-slate-600 hover:text-indigo-700 transition-colors underline-offset-4 hover:underline" href="/bisection">Bisección</Link></li>
                <li><Link className="text-slate-600 hover:text-indigo-700 transition-colors underline-offset-4 hover:underline" href="/false-position">Regla falsa</Link></li>
                <li><Link className="text-slate-600 hover:text-indigo-700 transition-colors underline-offset-4 hover:underline" href="/fixed-point">Punto fijo</Link></li>
                <li><Link className="text-slate-600 hover:text-indigo-700 transition-colors underline-offset-4 hover:underline" href="/newton">Newton-Raphson</Link></li>
                <li><Link className="text-slate-600 hover:text-indigo-700 transition-colors underline-offset-4 hover:underline" href="/secant">Secante</Link></li>
              </ul>
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        <footer className="border-t bg-white/70 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-4 py-4 text-xs text-gray-600">
            Hecho con Next.js, TypeScript y TailwindCSS
          </div>
        </footer>
      </body>
    </html>
  );
}
