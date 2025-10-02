import Link from 'next/link';

const cards = [
  { href: '/bisection', title: 'Método de la Bisección', desc: 'Método cerrado' },
  { href: '/false-position', title: 'Método de la Falsa Posición', desc: 'Método cerrado' },
  { href: '/fixed-point', title: 'Iteración de Punto Fijo', desc: 'Método abierto' },
  { href: '/secant', title: 'Método de la Secante', desc: 'Método abierto' },
  { href: '/newton', title: 'Método de Newton-Raphson', desc: 'Método abierto' },
  { href: '/newton-modified', title: 'Newton-Raphson Modificado', desc: 'Derivada fija' }
];

export default function Page() {
  return (
    <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <Link
          key={c.href}
          href={c.href}
          className="group rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/70 backdrop-blur-md shadow-lg shadow-slate-200/60 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:border-indigo-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
        >
          <h2 className="text-lg font-semibold tracking-tight">{c.title}</h2>
          <p className="text-sm text-gray-600 mt-1">{c.desc}</p>
          <span className="mt-3 inline-flex items-center gap-1 text-indigo-600 text-sm">
            Abrir <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
          </span>
        </Link>
      ))}
    </section>
  );
}
