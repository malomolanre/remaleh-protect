import React, { useMemo, useRef, useState } from "react";

/* Crypto‑safe password generator. Uses Web Crypto API for randomness. */
const DEFAULT_LENGTH = 16;
const CHARSETS = {
  lower: "abcdefghjkmnpqrstuvwxyz",
  upper: "ABCDEFGHJKMNPQRSTUVWXYZ",
  digits: "23456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?/|~",
  similar: "ilIoO01",
};

function getRandomValues(len) {
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  return arr;
}

function buildAlphabet(opts) {
  let alphabet = "";
  if (opts.lower) alphabet += CHARSETS.lower + (opts.similar ? "il" : "");
  if (opts.upper) alphabet += CHARSETS.upper + (opts.similar ? "IO" : "");
  if (opts.digits) alphabet += (opts.similar ? "01" : "") + CHARSETS.digits;
  if (opts.symbols) alphabet += CHARSETS.symbols;
  if (opts.ambiguous) alphabet += "{}[]()/\\'\"`~,;:.<>";
  if (!opts.similar) {
    alphabet = [...alphabet].filter((c) => !CHARSETS.similar.includes(c)).join("");
  }
  return alphabet;
}

function generatePassword(length, opts) {
  const alphabet = buildAlphabet(opts);
  if (!alphabet.length) throw new Error("No character sets selected");

  const requiredPools = [];
  if (opts.lower) requiredPools.push(CHARSETS.lower);
  if (opts.upper) requiredPools.push(CHARSETS.upper);
  if (opts.digits) requiredPools.push(opts.similar ? CHARSETS.digits + "01" : CHARSETS.digits);
  if (opts.symbols) requiredPools.push(CHARSETS.symbols);
  if (opts.ambiguous) requiredPools.push("{}[]()/\\'\"`~,;:.<>");

  const out = [];
  requiredPools.forEach((pool) => {
    const r = getRandomValues(1)[0] % pool.length;
    out.push(pool[r]);
  });

  const remaining = Math.max(length - out.length, 0);
  const rv = getRandomValues(remaining);
  for (let i = 0; i < remaining; i++) {
    const idx = rv[i] % alphabet.length;
    out.push(alphabet[idx]);
  }

  for (let i = out.length - 1; i > 0; i--) {
    const r = getRandomValues(1)[0] % (i + 1);
    [out[i], out[r]] = [out[r], out[i]];
  }
  return out.join("");
}

function estimateEntropy(length, opts) {
  const alphabet = buildAlphabet(opts);
  const N = Math.max(alphabet.length, 1);
  return Math.round(length * Math.log2(N));
}

function StrengthBar({ bits }) {
  let label = "Weak", pct = 25;
  if (bits >= 80) { label = "Very strong"; pct = 100; }
  else if (bits >= 60) { label = "Strong"; pct = 75; }
  else if (bits >= 40) { label = "Okay"; pct = 50; }

  return (
    <div className="mt-2">
      <div className="w-full h-2 bg-gray-200 rounded">
        <div
          className={`h-2 rounded ${pct >= 75 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-xs text-gray-600 mt-1">Strength: {label} ({bits} bits)</div>
    </div>
  );
}

export default function PasswordGenerator({ onUse }) {
  const [length, setLength] = useState(DEFAULT_LENGTH);
  const [opts, setOpts] = useState({
    lower: true,
    upper: true,
    digits: true,
    symbols: true,
    ambiguous: false,
    similar: false,
  });
  const [value, setValue] = useState("");
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  const bits = useMemo(() => estimateEntropy(length, opts), [length, opts]);

  function toggle(key) {
    setOpts((o) => ({ ...o, [key]: !o[key] }));
  }

  function handleGenerate() {
    try {
      const pwd = generatePassword(length, opts);
      setValue(pwd);
      setCopied(false);
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      inputRef.current?.select();
    }
  }

  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white">
      <h3 className="text-lg font-semibold mb-3">Password Generator</h3>

      <div className="flex gap-2 mb-3">
        <input
          ref={inputRef}
          className="flex-1 border rounded-lg px-3 py-2 font-mono text-sm"
          readOnly
          value={value}
          placeholder="Click Generate"
        />
        <button
          onClick={handleCopy}
          disabled={!value}
          className="px-3 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          onClick={() => onUse?.(value)}
          disabled={!value}
          className="px-3 py-2 rounded-lg bg-black text-white disabled:opacity-50"
        >
          Use this
        </button>
      </div>

      <div className="mb-3">
        <label className="text-sm font-medium">Length: {length}</label>
        <input
          type="range"
          min={8}
          max={64}
          value={length}
          onChange={(e) => setLength(parseInt(e.target.value, 10))}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={opts.lower} onChange={() => toggle("lower")} /> Lowercase
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={opts.upper} onChange={() => toggle("upper")} /> Uppercase
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={opts.digits} onChange={() => toggle("digits")} /> Digits
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={opts.symbols} onChange={() => toggle("symbols")} /> Symbols
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={opts.ambiguous} onChange={() => toggle("ambiguous")} /> Extra ambiguous symbols
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={opts.similar} onChange={() => toggle("similar")} /> Include look‑alikes (I/l/1/O/0)
        </label>
      </div>

      <StrengthBar bits={bits} />

      <div className="mt-4 flex gap-2">
      <button
        onClick={handleGenerate}
        className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
      >
        Generate
      </button>
      <button
        onClick={() => setValue("")}
        className="px-4 py-2 rounded-lg border hover:bg-gray-50"
      >
        Clear
      </button>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Tip: store in a password manager; never reuse passwords across sites.
      </p>
    </div>
  );
}
