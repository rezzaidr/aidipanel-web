import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("speed section uses the shared borderless page background", () => {
  assert.match(html, /<section class="section" id="speed">/);
  assert.doesNotMatch(html, /<section class="[^"]*\bband(?:-contrast)?\b[^"]*" id="speed">/);
});

test("cyan route follows the cache-hit branch from entry to response", () => {
  assert.match(
    html,
    /\.cache-pipeline\s*>\s*\.pl-trunk:first-of-type\s+\.pconn\s*\{[^}]*background:\s*var\(--speed\)/s,
  );
  assert.match(html, /\.pl-split \.stub\s*\{[^}]*background:\s*var\(--speed\)/s);
  assert.match(html, /\.pl-split \.rail\s*\{[^}]*linear-gradient\(to right,\s*var\(--speed\)/s);
  assert.match(html, /\.branch\.hit \.pconn\s*\{[^}]*background:\s*var\(--speed\)/s);
  assert.match(html, /\.pl-merge \.rail\s*\{[^}]*linear-gradient\(to right,\s*var\(--speed\)/s);
  assert.match(html, /\.pl-merge \.stub\s*\{[^}]*background:\s*var\(--speed\)/s);
});

test("responsive pipeline preserves the desktop two-branch topology", () => {
  const mediaStart = html.indexOf("@media (max-width: 760px)");
  assert.notEqual(mediaStart, -1, "responsive pipeline media query is present");

  const responsivePipelineCss = html.slice(mediaStart, mediaStart + 2200);
  assert.match(responsivePipelineCss, /\.pl-branches\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(0,\s*1fr\)/s);
  assert.doesNotMatch(responsivePipelineCss, /\.pl-split \.rail[\s\S]{0,180}display:\s*none/);
  assert.doesNotMatch(responsivePipelineCss, /\.pl-split \.drop\.l[\s\S]{0,120}left:\s*50%/);
});

test("dashboard and terminal windows use matching macOS-style controls", () => {
  assert.match(
    html,
    /<span class="wdots" aria-hidden="true"><i data-symbol="×"><\/i><i data-symbol="−"><\/i><i data-symbol="↗"><\/i><\/span>/,
  );
  assert.match(
    html,
    /<div class="tbar" aria-hidden="true"><span class="d" data-symbol="×"><\/span><span class="d" data-symbol="−"><\/span><span class="d" data-symbol="↗"><\/span><\/div>/,
  );
  assert.match(html, /\.wdots i,\s*\.tbar \.d\s*\{[^}]*width:\s*12px/s);
  assert.match(html, /\.wdots i::after\s*\{[^}]*content:\s*attr\(data-symbol\)/s);
  assert.match(html, /\.wdots i:nth-child\(1\)\s*\{[^}]*background:\s*#ff5f57/s);
  assert.match(html, /\.wdots i:nth-child\(2\)\s*\{[^}]*background:\s*#febc2e/s);
  assert.match(html, /\.wdots i:nth-child\(3\)\s*\{[^}]*background:\s*#28c840/s);
});
