---
name: GitHub connector quirks
description: How to call GitHub APIs and push code from this Replit when the GitHub integration is attached
---

The GitHub integration is attached (`conn_github_01KZ6ZVJRYSGAZFJM2TSHV7VA0`, user `calotwm`).

**Working patterns:**
- API calls: `import("@replit/connectors-sdk")` → `new ReplitConnectors()` → `connectors.proxy("github", "/endpoint", { method, headers, body })`. Returns a raw `Response`; call `.json()`.
- Pushing code: the `gitPush({})` CodeExecution callback pushes `main` to `origin` and reports success.

**Known failures (do not retry these):**
- `listConnections('github')` returns `[]` even though the integration is `added` — do not use it to probe the connection, and it cannot be used to get a client.
- Raw shell `git push/fetch` to the GitHub HTTPS remote fails with "Invalid username or token" — no git credentials are configured in the container. Always use the `gitPush` callback instead.
