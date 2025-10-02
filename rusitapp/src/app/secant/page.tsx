'use client';

import React, { useMemo, useState } from 'react';
import FunctionInput from '@/components/FunctionInput';

type Row = {
  i: number;
  x0: number;
  x1: number;
  fx0: number;
  fx1: number;
  x2: number;
  err: number;
};

function parseFunction(expr: string): (x: number) => number {
  const sanitized = (expr || '0').replace(/\^/g, '**');
  // eslint-disable-next-line no-new-func
  const fn = new Function('x', `with (Math) { return (${sanitized}); }`);
  return (x: number) => Number(fn(x));
}

export default function SecantPage() {
  const [expr, setExpr] = useState('x^3 - x - 2');
  const [x0, setX0] = useState<number>(1);
  const [x1, setX1] = useState<number>(2);
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

  const f = useMemo(() => {
    try {
      setError(null);
      return parseFunction(expr);
    } catch {
      setError('Expresión inválida.');
      return (_x: number) => NaN;
    }
  }, [expr]);

  const run = () => {
    setRows([]);
    setRoot(null);
    setError(null);

    if (!isFinite(x0) || !isFinite(x1) || !isFinite(tol) || !isFinite(maxIter)) {
      setError('Entradas numéricas inválidas.');
      return;
    }
    if (tol <= 0) {
      setError('La tolerancia debe ser positiva.');
      return;
    }

    let a = x0;
    let b = x1;
    let fa = f(a);
    let fb = f(b);
    const out: Row[] = [];

    for (let i = 1; i <= maxIter; i++) {
      if (!isFinite(fa) || !isFinite(fb)) {
        setError('f(x) no es finito.');
        setRows(out);
        return;
      }
      if (fb - fa === 0) {
        setError('División por cero en la fórmula de secante.');
        setRows(out);
        return;
      }
      const x2 = b - fb * (b - a) / (fb - fa);
      const err = Math.abs(x2 - b);

      out.push({ i, x0: a, x1: b, fx0: fa, fx1: fb, x2, err });

      if (Math.abs(f(x2)) === 0 || err < tol) {
        setRows(out);
        setRoot(x2);
        return;
      }

      a = b;
      fa = fb;
      b = x2;
      fb = f(b);
    }
    setRows(out);
    setRoot(out[out.length - 1]?.x2 ?? null);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-700 to-fuchsia-700 bg-clip-text text-transparent">
        Método de la Secante
      </h2>

      <div className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-md shadow-lg shadow-slate-200/60 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-3">
            <FunctionInput value={expr} onChange={setExpr} />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">x0</label>
            <input type="number" value={x0} onChange={(e) => setX0(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus:border-indigo-400 transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">x1</label>
            <input type="number" value={x1} onChange={(e) => setX1(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus:border-indigo-400 transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">Tolerancia</label>
            <input type="number" step="any" value={tol} onChange={(e) => setTol(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus:border-indigo-400 transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">Iteraciones máx</label>
            <input type="number" value={maxIter} onChange={(e) => setMaxIter(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus:border-indigo-400 transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">Decimales</label>
            <input type="number" min={0} max={15} step={1} value={digits} onChange={(e) => setDigits(Math.max(0, Number(e.target.value) | 0))} className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus:border-indigo-400 transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">Modo</label>
            <select value={roundMode} onChange={(e) => setRoundMode(e.target.value as 'approx' | 'trunc')} className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus:border-indigo-400 transition">
              <option value="approx">Aproximación</option>
              <option value="trunc">Truncamiento</option>
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <button onClick={run} className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-fuchsia-600 shadow-md hover:shadow-lg hover:from-indigo-500 hover:to-fuchsia-500 active:scale-[0.99] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50">
              Calcular
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200/60 bg-red-50/70 text-red-700 px-3 py-2 text-sm shadow-sm">
          {error}
        </div>
      )}

      {root !== null && !error && (
        <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/70 text-emerald-700 px-3 py-2 text-sm shadow-sm">
          Raíz aproximada: <span className="inline-block rounded-md bg-slate-900 text-white font-mono px-2 py-0.5 text-xs ml-1">{fmt(root)}</span>
        </div>
      )}

      {rows.length > 0 && (
        <div className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-md shadow-lg shadow-slate-200/60 overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
              <tr>
                <th className="p-2 text-left font-semibold text-slate-600">i</th>
                <th className="p-2 text-left font-semibold text-slate-600">x0</th>
                <th className="p-2 text-left font-semibold text-slate-600">x1</th>
                <th className="p-2 text-left font-semibold text-slate-600">f(x0)</th>
                <th className="p-2 text-left font-semibold text-slate-600">f(x1)</th>
                <th className="p-2 text-left font-semibold text-slate-600">x2</th>
                <th className="p-2 text-left font-semibold text-slate-600">error</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.i} className="odd:bg-white/80 even:bg-slate-50/70 hover:bg-white transition-colors">
                  <td className="p-2 border-t border-slate-200/70 text-center align-middle">{r.i}</td>
                  <td className="p-2 border-t border-slate-200/70 font-mono align-middle">{fmt(r.x0)}</td>
                  <td className="p-2 border-t border-slate-200/70 font-mono align-middle">{fmt(r.x1)}</td>
                  <td className="p-2 border-t border-slate-200/70 font-mono align-middle">{fmt(r.fx0)}</td>
                  <td className="p-2 border-t border-slate-200/70 font-mono align-middle">{fmt(r.fx1)}</td>
                  <td className="p-2 border-t border-slate-200/70 font-mono align-middle">{fmt(r.x2)}</td>
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
