import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("root renders a language-selection shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Kana Quest<\/title>/i);
  assert.match(html, /Choosing your language/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
  assert.match(html, /lang="en"/);
});

for (const [locale, title, loading] of [
  ["en", "Kana Quest — Learn Hiragana &amp; Katakana", "Unfolding your journey map"],
  ["zh-Hant", "假名旅人 Kana Quest", "正在展開旅程地圖"],
  ["zh-Hans", "假名旅人 Kana Quest", "正在展开旅程地图"],
  ["es", "Kana Quest — Aprende hiragana y katakana", "Desplegando el mapa del viaje"],
]) {
  test(`server-renders localized route ${locale}`, async () => {
    const response = await render(`/${locale}`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, new RegExp(`<title>${title}<\\/title>`, "i"));
    assert.match(html, new RegExp(loading));
  });
}
