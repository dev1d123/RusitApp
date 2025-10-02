'use client';

import React from 'react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  placeholder?: string;
};

export default function FunctionInput({ value, onChange, label = 'f(x)', placeholder = 'ej: x^3 - x - 2' }: Props) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border rounded px-3 py-2 text-sm"
      />
      <p className="text-xs text-gray-500">
        Soporta + - * / ^, paréntesis, x y Math: sin, cos, tan, exp, log, sqrt, etc. Usa ^ como potencia.
      </p>
    </div>
  );
}
