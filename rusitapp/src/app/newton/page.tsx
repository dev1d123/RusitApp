'use client';

import React, { useMemo, useState } from 'react';
import FunctionInput from '@/components/FunctionInput';

type Row = {
  i: number;
  xi: number;
  fxi: number;
  dfxi: number;
  xi1: number;
  err: number;
};

function parseFunction(expr: string): (x: number) => number {
  const sanitized = (expr || '0').replace(/\^/g, '**');
  // eslint-disable-next-line no-new-func
  const fn = new Function('x', `with (Math) { return (${sanitized}); }`);
  return (x: number) => Number(fn(x));
}

export default function NewtonPage() {
  const [fExpr, setFExpr] = useState('x^3 - x - 2');
  const [dfExpr, setDfExpr] = useState('3*x^2 - 1');
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

  const f = useMemo(() => {
    try {
      setError(null);
      return parseFunction(fExpr);
    } catch {
      setError('Expresión f(x) inválida.');
      return (_x: number) => NaN;
    }
  }, [fExpr]);

  const df = useMemo(() => {
    try {
      setError(null);
      return parseFunction(dfExpr);
    } catch {
      setError('Expresión f\'(x) inválida.');
      return (_x: number) => NaN;
    }
  }, [dfExpr]);

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
    let prev = NaN;
    const out: Row[] = [];

    for (let i = 1; i <= maxIter; i++) {
      const fxi = f(xi);
      const dfxi = df(xi);
      if (!isFinite(fxi) || !isFinite(dfxi)) {
        setError('f(xi) o f\'(xi) no son finitos.');
        setRows(out);
        return;
      }
      if (dfxi === 0) {
        setError('Derivada cero: no se puede continuar.');
        setRows(out);
        return;
      }
      const xi1 = xi - fxi / dfxi;
      const err = i === 1 ? Math.abs(xi1 - xi) : Math.abs(xi1 - prev);

      out.push({ i, xi, fxi, dfxi, xi1, err });

      if (Math.abs(fxi) === 0 || err < tol) {
        setRows(out);
        setRoot(xi1);
        return;
      }

      prev = xi1;
      xi = xi1;
    }

    setRows(out);
    setRoot(out[out.length - 1]?.xi1 ?? null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Método de Newton-Raphson</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-3">
          <FunctionInput value={fExpr} onChange={setFExpr} label="f(x)" placeholder="ej: x^3 - x - 2" />
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <FunctionInput value={dfExpr} onChange={setDfExpr} label="f'(x)" placeholder="ej: 3*x^2 - 1" />
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
                <th className="p-2 border">f(xi)</th>
                <th className="p-2 border">f'(xi)</th>
                <th className="p-2 border">xi+1</th>
                <th className="p-2 border">error</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.i} className="odd:bg-white even:bg-gray-50">
                  <td className="p-2 border text-center">{r.i}</td>
                  <td className="p-2 border font-mono">{fmt(r.xi)}</td>
                  <td className="p-2 border font-mono">{fmt(r.fxi)}</td>
                  <td className="p-2 border font-mono">{fmt(r.dfxi)}</td>
                  <td className="p-2 border font-mono">{fmt(r.xi1)}</td>
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
