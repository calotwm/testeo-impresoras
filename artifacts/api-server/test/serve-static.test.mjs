import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverEntry = path.resolve(__dirname, "../dist/index.mjs");
const publicDir = path.resolve(__dirname, "../../impresoras/dist/public");
const frontendBuilt = existsSync(path.join(publicDir, "index.html"));

function startServer(port) {
  const child = spawn(
    process.execPath,
    ["--enable-source-maps", serverEntry],
    {
      env: {
        ...process.env,
        PORT: String(port),
        DATABASE_URL: "postgres://dummy:dummy@localhost:5432/nope",
        NODE_ENV: "production",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  const stdoutChunks = [];
  const stderrChunks = [];
  child.stdout.on("data", (c) => stdoutChunks.push(c));
  child.stderr.on("data", (c) => stderrChunks.push(c));

  return {
    child,
    logs: () => ({
      stdout: Buffer.concat(stdoutChunks).toString("utf8"),
      stderr: Buffer.concat(stderrChunks).toString("utf8"),
    }),
  };
}

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  let lastErr;
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      return res;
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  throw new Error(`Server did not start within ${timeoutMs}ms: ${lastErr}`);
}

test("api-server static serving contract", async (t) => {
  // Pick a random high port
  const port = 30000 + Math.floor(Math.random() * 30000);
  const baseUrl = `http://127.0.0.1:${port}`;

  const { child, logs } = startServer(port);

  try {
    await waitForServer(`${baseUrl}/api/healthz`);

    await t.test("GET /api/healthz → 200 JSON {status:ok}", async () => {
      const res = await fetch(`${baseUrl}/api/healthz`);
      assert.equal(res.status, 200);
      const ct = res.headers.get("content-type") ?? "";
      assert.ok(ct.includes("application/json"), `Expected JSON, got: ${ct}`);
      const body = await res.json();
      assert.deepEqual(body, { status: "ok" });
    });

    await t.test("GET /api/nonexistent → 404 not HTML", async () => {
      const res = await fetch(`${baseUrl}/api/nonexistent`);
      assert.equal(res.status, 404);
      const ct = res.headers.get("content-type") ?? "";
      assert.ok(!ct.includes("text/html"), `Expected non-HTML, got: ${ct}`);
    });

    await t.test("GET /ws (plain HTTP) → not HTML", async () => {
      const res = await fetch(`${baseUrl}/ws`);
      const ct = res.headers.get("content-type") ?? "";
      assert.ok(
        !ct.includes("text/html"),
        `Expected non-HTML for /ws, got: ${ct} (status ${res.status})`,
      );
    });

    if (frontendBuilt) {
      await t.test("GET / → 200 text/html with id=root", async () => {
        const res = await fetch(`${baseUrl}/`);
        assert.equal(res.status, 200);
        const ct = res.headers.get("content-type") ?? "";
        assert.ok(ct.includes("text/html"), `Expected HTML, got: ${ct}`);
        const body = await res.text();
        assert.ok(body.includes('id="root"'), "Expected id=\"root\" in HTML");
      });

      await t.test(
        "GET /definitely/not/a/route → 200 SPA fallback",
        async () => {
          const res = await fetch(`${baseUrl}/definitely/not/a/route`);
          assert.equal(res.status, 200);
          const ct = res.headers.get("content-type") ?? "";
          assert.ok(
            ct.includes("text/html"),
            `Expected HTML SPA fallback, got: ${ct}`,
          );
        },
      );
    } else {
      await t.test(
        "frontend dist not built — skipping static HTML assertions",
        (t) => {
          t.skip("dist/public/index.html does not exist");
        },
      );
    }
  } catch (err) {
    const { stdout, stderr } = logs();
    console.error("=== SERVER STDOUT ===\n" + stdout);
    console.error("=== SERVER STDERR ===\n" + stderr);
    throw err;
  } finally {
    child.kill("SIGTERM");
    // Give it a moment, then force kill if still alive
    await new Promise((r) => setTimeout(r, 500));
    if (!child.killed) {
      child.kill("SIGKILL");
    }
  }
});
