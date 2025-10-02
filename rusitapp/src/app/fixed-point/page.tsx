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
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Método de Punto Fijo</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-3">
          <FunctionInput value={gExpr} onChange={setGExpr} label="g(x)" placeholder="ej: cbrt(x + 2)" />
        </div>
        <div>
          <label className="block text-sm font-medium">x0</label>
          <input type="number" value={x0} onChange={(e) => setX0(Number(e.target.value))} className="w-full border rounded px-3 py-2 text-sm" />
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
                <th className="p-2 border">xi</th>
                <th className="p-2 border">g(xi)</th>
                <th className="p-2 border">error</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.i} className="odd:bg-white even:bg-gray-50">
                  <td className="p-2 border text-center">{r.i}</td>
                  <td className="p-2 border font-mono">{fmt(r.xi)}</td>
                  <td className="p-2 border font-mono">{fmt(r.gxi)}</td>
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
