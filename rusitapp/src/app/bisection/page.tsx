'use client';

import React, { useMemo, useState } from 'react';
import FunctionInput from '@/components/FunctionInput';

type Row = {
  i: number;
  a: number;
  b: number;
  m: number;
  fa: number;
  fb: number;
  fm: number;
  err: number;
};

function parseFunction(expr: string): (x: number) => number {
  const sanitized = (expr || '0').replace(/\^/g, '**');
  // Eval con Math en scope. Nota: asume uso local en app.
  // Se puede robustecer con un parser dedicado si se desea.
  // eslint-disable-next-line no-new-func
  const fn = new Function('x', `with (Math) { return (${sanitized}); }`);
  return (x: number) => Number(fn(x));
}

export default function BisectionPage() {
  const [expr, setExpr] = useState('x^3 - x - 2');
  const [a, setA] = useState<number>(1);
  const [b, setB] = useState<number>(2);
  const [tol, setTol] = useState<number>(1e-6);
  const [maxIter, setMaxIter] = useState<number>(50);
  const [rows, setRows] = useState<Row[]>([]);
  const [root, setRoot] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // NUEVO: controles de decimales y modo
  const [digits, setDigits] = useState<number>(6);
  const [roundMode, setRoundMode] = useState<'approx' | 'trunc'>('approx');

  // NUEVO: util de redondeo/ truncamiento y formateo
  function roundTo(x: number, d: number, mode: 'approx' | 'trunc') {
    if (!Number.isFinite(x)) return x;
    const factor = Math.pow(10, Math.max(0, d | 0));
    return mode === 'approx' ? Math.round(x * factor) / factor : Math.trunc(x * factor) / factor;
  }
  const fmt = (x: number) => roundTo(x, digits, roundMode);

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

    if (!isFinite(a) || !isFinite(b) || !isFinite(tol) || !isFinite(maxIter)) {
      setError('Entradas numéricas inválidas.');
      return;
    }
    if (a >= b) {
      setError('Requiere a < b.');
      return;
    }
    if (tol <= 0) {
      setError('La tolerancia debe ser positiva.');
      return;
    }

    let left = a;
    let right = b;
    let fa = f(left);
    let fb = f(right);

    if (!isFinite(fa) || !isFinite(fb)) {
      setError('f(a) o f(b) no son finitos. Revisa la función/intervalo.');
      return;
    }
    if (fa === 0) {
      setRoot(left);
      setRows([]);
      return;
    }
    if (fb === 0) {
      setRoot(right);
      setRows([]);
      return;
    }
    if (fa * fb > 0) {
      setError('f(a) y f(b) deben tener signos opuestos (no hay garantía de raíz en [a,b]).');
      return;
    }

    const out: Row[] = [];
    let prevM = NaN;
    for (let i = 1; i <= maxIter; i++) {
      const m = 0.5 * (left + right);
      const fm = f(m);

      const err = i === 1 ? Math.abs(right - left) / 2 : Math.abs(m - prevM);
      out.push({ i, a: left, b: right, m, fa, fb, fm, err });

      if (Math.abs(fm) === 0 || err < tol) {
        setRows(out);
        setRoot(m);
        return;
      }

      // Decide sub-intervalo
      if (fa * fm < 0) {
        right = m;
        fb = fm;
      } else {
        left = m;
        fa = fm;
      }
      prevM = m;
    }
    setRows(out);
    setRoot(out[out.length - 1]?.m ?? null);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-700 to-fuchsia-700 bg-clip-text text-transparent">
        Método de Bisección
      </h2>

      <div className="rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/70 backdrop-blur-md shadow-lg shadow-slate-200/60 p-6 transition-shadow hover:shadow-xl">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-3">
            <FunctionInput value={expr} onChange={setExpr} />
            <p className="mt-2 text-xs text-slate-500">Usa funciones de Math, ej: sin(x), exp(x), etc.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">a</label>
            <input className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm shadow-sm transition hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus:border-indigo-400" type="number" value={a} onChange={(e) => setA(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">b</label>
            <input className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm shadow-sm transition hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus:border-indigo-400" type="number" value={b} onChange={(e) => setB(Number(e.target.value))} />
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
              Calcular <span className="ml-1">⚡</span>
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
                <th className="p-2 text-left font-semibold text-slate-600">a</th>
                <th className="p-2 text-left font-semibold text-slate-600">b</th>
                <th className="p-2 text-left font-semibold text-slate-600">m</th>
                <th className="p-2 text-left font-semibold text-slate-600">f(a)</th>
                <th className="p-2 text-left font-semibold text-slate-600">f(b)</th>
                <th className="p-2 text-left font-semibold text-slate-600">f(m)</th>
                <th className="p-2 text-left font-semibold text-slate-600">error</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.i} className="odd:bg-white even:bg-slate-50 hover:bg-indigo-50/40 transition-colors">
                  <td className="p-2 border-t border-slate-200/70 text-center align-middle">{r.i}</td>
                  <td className="p-2 border-t border-slate-200/70 font-mono align-middle">{fmt(r.a)}</td>
                  <td className="p-2 border-t border-slate-200/70 font-mono align-middle">{fmt(r.b)}</td>
                  <td className="p-2 border-t border-slate-200/70 font-mono align-middle">{fmt(r.m)}</td>
                  <td className="p-2 border-t border-slate-200/70 font-mono align-middle">{fmt(r.fa)}</td>
                  <td className="p-2 border-t border-slate-200/70 font-mono align-middle">{fmt(r.fb)}</td>
                  <td className="p-2 border-t border-slate-200/70 font-mono align-middle">{fmt(r.fm)}</td>
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
