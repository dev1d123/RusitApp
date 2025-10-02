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
      <body>
        <header className="border-b bg-white">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <h1 className="text-xl font-semibold">Calculadora de Métodos Numéricos</h1>
            <nav className="mt-3">
              <ul className="flex gap-4 text-sm">
                <li><Link className="hover:underline" href="/bisection">Bisección</Link></li>
                <li><Link className="hover:underline" href="/false-position">Regla falsa</Link></li>
                <li><Link className="hover:underline" href="/fixed-point">Punto fijo</Link></li>
                <li><Link className="hover:underline" href="/newton">Newton-Raphson</Link></li>
                <li><Link className="hover:underline" href="/secant">Secante</Link></li>
              </ul>
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
        <footer className="border-t bg-white">
          <div className="max-w-5xl mx-auto px-4 py-4 text-xs text-gray-500">
            Hecho con Next.js, TypeScript y TailwindCSS
          </div>
        </footer>
      </body>
    </html>
  );
}
