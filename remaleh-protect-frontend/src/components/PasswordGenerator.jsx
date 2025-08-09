import React, { useMemo, useRef, useState } from "react";
import { MobileCard, MobileCardHeader, MobileCardContent } from './ui/mobile-card';
import { MobileInput } from './ui/mobile-input';
import { Button } from './ui/button';
import { Lock } from 'lucide-react';

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
  if (opts.ambiguous) alphabet += "{}[]()/\\\\'\\\"`~,;:.<>";
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
  if (opts.ambiguous) requiredPools.push("{}[]()/\\\\'\\\"`~,;:.<>");

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

  const entropy = useMemo(() => estimateEntropy(length, opts), [length, opts]);

  function toggle(key) {
    setOpts(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function handleGenerate() {
    try {
      const password = generatePassword(length, opts);
      setValue(password);
      setCopied(false);
    } catch (error) {
      console.error("Failed to generate password:", error);
    }
  }

  async function handleCopy() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy password:", error);
    }
  }

  function handleUse() {
    if (onUse && value) {
      onUse(value);
    }
  }

  return (
    <MobileCard className="mb-6">
      <MobileCardHeader>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-600" />
          Password Generator
        </h3>
        <p className="text-sm text-gray-600">Generate secure, random passwords</p>
      </MobileCardHeader>
      
      <MobileCardContent>
        <div className="space-y-4">
          {/* Generated Password Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Generated Password
            </label>
            <div className="flex space-x-2">
              <MobileInput
                ref={inputRef}
                value={value}
                readOnly
                className="flex-1 font-mono text-sm"
                placeholder="Click 'Generate' to create a password"
              />
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="px-3"
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            {value && <StrengthBar bits={entropy} />}
          </div>

          {/* Length Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password Length: {length}
            </label>
            <input
              type="range"
              min="8"
              max="64"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>8</span>
              <span>16</span>
              <span>32</span>
              <span>64</span>
            </div>
          </div>

          {/* Character Set Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Character Sets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(opts).map(([key, enabled]) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => toggle(key)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {key === 'lower' ? 'Lowercase' : 
                     key === 'upper' ? 'Uppercase' : 
                     key === 'digits' ? 'Numbers' : 
                     key === 'symbols' ? 'Symbols' : 
                     key === 'ambiguous' ? 'Ambiguous' : 
                     key === 'similar' ? 'Similar' : key}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              onClick={handleGenerate}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Generate Password
            </Button>
            {value && onUse && (
              <Button
                onClick={handleUse}
                variant="outline"
                className="flex-1"
              >
                Use This Password
              </Button>
            )}
          </div>

          {/* Security Tips */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-1">Security Tips</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Use at least 16 characters for maximum security</li>
              <li>• Include uppercase, lowercase, numbers, and symbols</li>
              <li>• Avoid similar-looking characters (l, 1, I, O, 0)</li>
              <li>• Store passwords in a secure password manager</li>
            </ul>
          </div>
        </div>
      </MobileCardContent>
    </MobileCard>
  );
}
