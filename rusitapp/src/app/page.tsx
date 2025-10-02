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
    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <Link key={c.href} href={c.href} className="bg-white shadow-sm border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold">{c.title}</h2>
          <p className="text-sm text-gray-600 mt-1">{c.desc}</p>
          <span className="mt-3 inline-block text-blue-600 text-sm">Abrir →</span>
        </Link>
      ))}
    </section>
  );
}
