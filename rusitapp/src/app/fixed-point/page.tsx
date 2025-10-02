'use client';

import React, { useMemo, useState } from 'react';
import FunctionInput from '@/components/FunctionInput';

type Row = {
  i: number;
  xi: number;
  gxi: number;
  err: number;
};

function parseFunction(expr: string): (x: number) => number {
  const sanitized = (expr || '0').replace(/\^/g, '**');
  // eslint-disable-next-line no-new-func
  const fn = new Function('x', `with (Math) { return (${sanitized}); }`);
  return (x: number) => Number(fn(x));
}

export default function FixedPointPage() {
  const [gExpr, setGExpr] = useState('cbrt(x + 2)'); // ejemplo para x^3 - x - 2 = 0 => x = cbrt(x+2)
  const [x0, setX0] = useState<number>(1.5);
  const [tol, setTol] = useState<number>(1e-6);
  const [maxIter, setMaxIter] = useState<number>(50);

  const [digits, setDigits] = useState<number>(6);
  const [roundMode, setRoundMode] = useState<'approx' | 'trunc'>('approx');
  function roundTo(x: number, d: number, mode: 'approx' | 'trunc') {
    if (!Number.isFinite(x)) return x;
    const factor = Math.pow(10, Math.max(0, d | 0));
    return mode === 'approx' ? Math.round(x * factor) / factor : Math.trunc(x * factor) / factor;
  }
  const fmt = (x: number) => roundTo(x, digits, roundMode);

  const [rows, setRows] = useState<Row[]>([]);
  const [root, setRoot] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const g = useMemo(() => {
    try {
      setError(null);
      return parseFunction(gExpr);
    } catch {
      setError('Expresión g(x) inválida.');
      return (_x: number) => NaN;
    }
  }, [gExpr]);

  const run = () => {
    setRows([]);
    setRoot(null);
    setError(null);

    if (!isFinite(x0) || !isFinite(tol) || !isFinite(maxIter)) {
      setError('Entradas numéricas inválidas.');
      return;
    }
    if (tol <= 0) {
      setError('La tolerancia debe ser positiva.');
      return;
    }

    let xi = x0;
    const out: Row[] = [];
    let prev = NaN;

    for (let i = 1; i <= maxIter; i++) {
      const gxi = g(xi);
      const err = i === 1 ? Math.abs(gxi - xi) : Math.abs(gxi - prev);

      out.push({ i, xi, gxi, err });

      if (!isFinite(gxi)) {
        setError('g(xi) no es finito. Revisa g(x).');
        setRows(out);
        return;
      }

      if (err < tol) {
        setRows(out);
        setRoot(gxi);
        return;
      }

      prev = gxi;
      xi = gxi;
    }
    setRows(out);
    setRoot(out[out.length - 1]?.gxi ?? null);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-700 to-fuchsia-700 bg-clip-text text-transparent">
        Método de Punto Fijo
      </h2>

      <div className="rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/70 backdrop-blur-md shadow-lg shadow-slate-200/60 p-6 transition-shadow hover:shadow-xl">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-3">
            <FunctionInput value={gExpr} onChange={setGExpr} label="g(x)" placeholder="ej: cbrt(x + 2)" />
            <p className="mt-2 text-xs text-slate-500">Asegura |g'(x)| &lt; 1 cerca de la raíz para convergencia.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">x0</label>
            <input className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm shadow-sm transition hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus:border-indigo-400" type="number" value={x0} onChange={(e) => setX0(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">Tolerancia</label>
            <input className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm shadow-sm transition hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus:border-indigo-400" type="number" step="any" value={tol} onChange={(e) => setTol(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">Iteraciones máx</label>
            <input className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm shadow-sm transition hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus:border-indigo-400" type="number" value={maxIter} onChange={(e) => setMaxIter(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">Decimales</label>
            <input className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm shadow-sm transition hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus:border-indigo-400" type="number" min={0} max={15} step={1} value={digits} onChange={(e) => setDigits(Math.max(0, Number(e.target.value) | 0))} />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">Modo</label>
            <select className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm shadow-sm transition hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus:border-indigo-400" value={roundMode} onChange={(e) => setRoundMode(e.target.value as 'approx' | 'trunc')}>
              <option value="approx">Aproximación</option>
              <option value="trunc">Truncamiento</option>
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <button onClick={run} className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-fuchsia-600 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 active:scale-[0.99]">
              Calcular <span className="ml-1">🔁</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200/60 bg-red-50/80 text-red-700 px-3 py-2 text-sm shadow-sm">
          {error}
        </div>
      )}

      {root !== null && !error && (
        <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/80 text-emerald-700 px-3 py-2 text-sm shadow-sm">
          Raíz aproximada: <span className="inline-block rounded-md bg-slate-900 text-white font-mono px-2 py-0.5 text-xs ml-1">{fmt(root)}</span>
        </div>
      )}

      {rows.length > 0 && (
        <div className="rounded-2xl border border-slate-200/60 bg-white/90 backdrop-blur-md shadow-lg shadow-slate-200/60 overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200/70">
              <tr>
                <th className="p-2 text-left font-semibold text-slate-600">i</th>
                <th className="p-2 text-left font-semibold text-slate-600">xi</th>
                <th className="p-2 text-left font-semibold text-slate-600">g(xi)</th>
                <th className="p-2 text-left font-semibold text-slate-600">error</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.i} className="odd:bg-white even:bg-slate-50 hover:bg-indigo-50/40 transition-colors">
                  <td className="p-2 border-t border-slate-200/70 text-center align-middle">{r.i}</td>
                  <td className="p-2 border-t border-slate-200/70 font-mono align-middle">{fmt(r.xi)}</td>
                  <td className="p-2 border-t border-slate-200/70 font-mono align-middle">{fmt(r.gxi)}</td>
                  <td className="p-2 border-t border-slate-200/70 font-mono align-middle">{fmt(r.err)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
