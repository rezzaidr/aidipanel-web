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

test("dashboard and terminal windows use matching plain macOS-style controls", () => {
  assert.match(
    html,
    /<span class="wdots" aria-hidden="true"><i><\/i><i><\/i><i><\/i><\/span>/,
  );
  assert.match(
    html,
    /<div class="tbar" aria-hidden="true"><span class="d"><\/span><span class="d"><\/span><span class="d"><\/span><\/div>/,
  );
  assert.match(html, /\.wdots i,\s*\.tbar \.d\s*\{[^}]*width:\s*12px/s);
  assert.doesNotMatch(html, /data-symbol=/);
  assert.doesNotMatch(html, /\.wdots i::after\s*\{/);
  assert.doesNotMatch(html, /\.tbar \.d::after\s*\{/);
  assert.match(html, /\.wdots i:nth-child\(1\)\s*\{[^}]*background:\s*#ff5f57/s);
  assert.match(html, /\.wdots i:nth-child\(2\)\s*\{[^}]*background:\s*#febc2e/s);
  assert.match(html, /\.wdots i:nth-child\(3\)\s*\{[^}]*background:\s*#28c840/s);
});

test("mobile and tablet product panel keeps the desktop dashboard topology", () => {
  const panelMediaStart = html.indexOf("@media(max-width:1024px){\n  #how .stage");
  assert.notEqual(panelMediaStart, -1, "product panel mobile and tablet media query is present");

  const panelMobileCss = html.slice(panelMediaStart, panelMediaStart + 2600);
  assert.match(panelMobileCss, /#how \.sgrid\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(panelMobileCss, /#how \.kpis\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(panelMobileCss, /#how \.wcols\s*\{[^}]*grid-template-columns:\s*1\.7fr\s+1fr/s);
  assert.match(panelMobileCss, /#how \.wtop\s*\{[^}]*flex-wrap:\s*nowrap/s);
  assert.match(panelMobileCss, /#how \.cperf\s*\{[^}]*flex-direction:\s*column/s);
  assert.match(panelMobileCss, /#how \.cstats\s*\{[^}]*width:\s*100%/s);
});

test("mobile navigation opens as a centered lightweight modal", () => {
  const navMediaStart = html.indexOf("@media(max-width:920px){\n  .menu-pill");
  assert.notEqual(navMediaStart, -1, "mobile navigation media query is present");

  const navMobileCss = html.slice(navMediaStart, navMediaStart + 2400);
  assert.match(navMobileCss, /\.nav\.menuopen::before\s*\{[^}]*position:\s*fixed[^}]*backdrop-filter:\s*blur\(10px\)/s);
  assert.match(navMobileCss, /\.mobnav\s*\{[^}]*position:\s*fixed[^}]*top:\s*50%[^}]*left:\s*50%/s);
  assert.match(navMobileCss, /\.mobnav\s*\{[^}]*width:\s*min\(360px,calc\(100vw - 34px\)\)/s);
  assert.match(navMobileCss, /\.mobnav\s*\{[^}]*border-radius:\s*14px/s);
  assert.match(html, /<div class="mobnav" id="mobnav" aria-hidden="true" role="dialog" aria-modal="true" aria-label="AidiPanel menu">/);
  assert.match(html, /Manage fast LEMP sites without the bloat/);
  assert.match(html, /<button class="mobnav-close" type="button" aria-label="Close menu">/);
  assert.match(html, /mobClose\.addEventListener\('click',function\(\)\{closeMenu\(\);ham\.focus\(\);\}\)/);
  assert.match(html, /document\.body\.style\.overflow='hidden'/);
  assert.match(html, /e\.target===nav&&nav\.classList\.contains\('menuopen'\)/);
});
