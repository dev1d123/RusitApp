'use client';

import React, { useMemo, useState } from 'react';
import FunctionInput from '@/components/FunctionInput';

type Row = {
  i: number;
  a: number;
  b: number;
  xr: number;
  fa: number;
  fb: number;
  fxr: number;
  err: number;
};

function parseFunction(expr: string): (x: number) => number {
  const sanitized = (expr || '0').replace(/\^/g, '**');
  // eslint-disable-next-line no-new-func
  const fn = new Function('x', `with (Math) { return (${sanitized}); }`);
  return (x: number) => Number(fn(x));
}

export default function FalsePositionPage() {
  const [expr, setExpr] = useState('x^3 - x - 2');
  const [a, setA] = useState<number>(1);
  const [b, setB] = useState<number>(2);
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
      setError('f(a) o f(b) no son finitos.');
      return;
    }
    if (fa === 0) {
      setRoot(left);
      return;
    }
    if (fb === 0) {
      setRoot(right);
      return;
    }
    if (fa * fb > 0) {
      setError('f(a) y f(b) deben tener signos opuestos.');
      return;
    }

    const out: Row[] = [];
    let prev = NaN;

    for (let i = 1; i <= maxIter; i++) {
      const xr = right - fb * (right - left) / (fb - fa);
      const fxr = f(xr);
      const err = i === 1 ? Math.abs(right - left) : Math.abs(xr - prev);

      out.push({ i, a: left, b: right, xr, fa, fb, fxr, err });

      if (Math.abs(fxr) === 0 || err < tol) {
        setRows(out);
        setRoot(xr);
        return;
      }

      if (fa * fxr < 0) {
        right = xr;
        fb = fxr;
      } else {
        left = xr;
        fa = fxr;
      }

      prev = xr;
    }

    setRows(out);
    setRoot(out[out.length - 1]?.xr ?? null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Método de Regla Falsa</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-3">
          <FunctionInput value={expr} onChange={setExpr} />
        </div>
        <div>
          <label className="block text-sm font-medium">a</label>
          <input type="number" value={a} onChange={(e) => setA(Number(e.target.value))} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium">b</label>
          <input type="number" value={b} onChange={(e) => setB(Number(e.target.value))} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium">Tolerancia</label>
          <input type="number" step="any" value={tol} onChange={(e) => setTol(Number(e.target.value))} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium">Iteraciones máx</label>
          <input type="number" value={maxIter} onChange={(e) => setMaxIter(Number(e.target.value))} className="w-full border rounded px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium">Decimales</label>
          <input type="number" min={0} max={15} step={1} value={digits} onChange={(e) => setDigits(Math.max(0, Number(e.target.value) | 0))} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium">Modo</label>
          <select value={roundMode} onChange={(e) => setRoundMode(e.target.value as 'approx' | 'trunc')} className="w-full border rounded px-3 py-2 text-sm">
            <option value="approx">Aproximación</option>
            <option value="trunc">Truncamiento</option>
          </select>
        </div>

        <div className="sm:col-span-2 lg:col-span-3">
          <button onClick={run} className="px-4 py-2 bg-black text-white rounded text-sm">Calcular</button>
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      {root !== null && !error && (
        <div className="text-sm">
          Raíz aproximada: <span className="font-mono">{fmt(root)}</span>
        </div>
      )}

      {rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 border">i</th>
                <th className="p-2 border">a</th>
                <th className="p-2 border">b</th>
                <th className="p-2 border">xr</th>
                <th className="p-2 border">f(a)</th>
                <th className="p-2 border">f(b)</th>
                <th className="p-2 border">f(xr)</th>
                <th className="p-2 border">error</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.i} className="odd:bg-white even:bg-gray-50">
                  <td className="p-2 border text-center">{r.i}</td>
                  <td className="p-2 border font-mono">{fmt(r.a)}</td>
                  <td className="p-2 border font-mono">{fmt(r.b)}</td>
                  <td className="p-2 border font-mono">{fmt(r.xr)}</td>
                  <td className="p-2 border font-mono">{fmt(r.fa)}</td>
                  <td className="p-2 border font-mono">{fmt(r.fb)}</td>
                  <td className="p-2 border font-mono">{fmt(r.fxr)}</td>
                  <td className="p-2 border font-mono">{fmt(r.err)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
