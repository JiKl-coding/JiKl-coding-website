---
name: jikl-dependency-updates
description: Which package versions to use and how to install them safely in JiKl projects — adding a new package or scaffolding a project (newest stable version at least ~7 days old, npm install --before, --ignore-scripts, no prereleases, keep the project's majors), plus dependency updates and Dependabot pull requests — reading the Claude review on GitHub (gh pr view --comments), checking a PR out locally, installing safely (npm ci --ignore-scripts, lockfile sources, release age), lint/typecheck/build, Vercel preview, merge order, major bumps (e.g. Next.js), and npm supply-chain risks of install scripts. Use when adding or installing any npm package, running a scaffolder (create-next-app, create vite, …), choosing a package version, when the owner asks to check, review, test, merge or close a Dependabot PR, a "Bump …" / "security group" PR, npm audit or vulnerable packages, or upgrading dependencies.
---

# Dependencies: versions, adding packages, updates and Dependabot PRs

## Version policy (always)

**Use the newest stable version that has been public for at least ~7 days.** Brand-new releases are when compromised versions get published, caught and unpublished (event-stream, ua-parser-js, Shai-Hulud), so a short cooling-off period is cheap insurance. Never "whatever is newest right now", never an old version without a reason.

- **No prereleases** (`-alpha`, `-beta`, `-rc`, `-canary`, `-next`, `@next`/`@canary` tags) unless the owner asks for one.
- **Existing project: keep its majors.** Match what `package.json` and the lockfile already use (React, Next, Tailwind v3 vs v4, Zod, Supabase CLI …). A major upgrade is a separate, requested task (see "Major bumps" below).
- **Install without install scripts** and run only the scripts a package really needs afterwards (Dependabot PRs, section 2, step 5).
- **Commit `package-lock.json`** together with `package.json`. The lockfile pins the exact versions.

## Adding a package

```bash
npm view <pkg> dist-tags --json            # stable "latest" vs. prerelease tags
npm view <pkg> time --json                 # publish date of each version
npm install <pkg> --ignore-scripts --before=<YYYY-MM-DD, ~7 days ago>
```

`--before` makes npm resolve the package (and the new transitive deps) as if it were that date: you get the newest version published before the cutoff. If the project already pins a major, add it: `npm install <pkg>@^<major> --before=…`. Exception: a **security fix** that is newer than 7 days. Take it, but say so and check its release notes and the lockfile sources (section 2).

## Starting a project (scaffolders)

`npx <tool>@latest` downloads and **runs** the newest release immediately. So pick the version first:

```bash
npm view create-next-app time --json       # or: create-vite
npx create-next-app@<newest stable version ≥ ~7 days old> --skip-install
npm install --ignore-scripts --before=<YYYY-MM-DD, ~7 days ago>
```

For `npm create vite@<version>`, answer **No** to "install and start now", then install the same way. Then rebuild only what needs it (`npm rebuild esbuild`, `npx prisma generate` …) and run `npm run build`.

## Dependabot PRs

All JiKl repos get **security-only Dependabot PRs**, grouped into one PR per run (`.github/dependabot.yml`, managed by jikl-admin). Version updates are off. Besides the grouped PR, Dependabot sometimes opens a separate PR for a fix it cannot put in the group.

**The owner decides and merges. Never merge, close or push to a Dependabot PR on your own.**

### 1. Read what is already known

- The Claude review from GitHub Actions is a comment in the PR (from `github-actions[bot]`, "Claude finished …"):
  ```bash
  gh pr view <n> --comments        # review + Dependabot description
  gh pr diff <n> --name-only       # changed files
  gh pr checks <n>                 # CI + Vercel preview status
  ```
- The review only **reads** code. It does not install, build or run anything, so verify its claims.
- **The PR description can understate the diff.** A grouped PR may contain a major bump that is not in its table. Trust `gh pr diff <n> -- package.json` and the lockfile, not the description.

### 2. Check it out locally (safely)

```bash
gh pr checkout <n>
```

**Install scripts are the main risk.** `npm ci` runs `preinstall` / `install` / `postinstall` scripts of new package versions with your user rights. A compromised version (like the event-stream, ua-parser-js and Shai-Hulud incidents) can read `.env.local`, `~/.npmrc`, the `gh` token and SSH keys, send them out, or publish itself further. So:

1. **Lockfile sources:** every `resolved` URL must point to `https://registry.npmjs.org/`:
   ```bash
   grep '"resolved"' package-lock.json | grep -v 'https://registry.npmjs.org/' || echo "all from registry.npmjs.org"
   ```
2. **Release age:** be careful with versions published only hours or days ago. That is when malicious releases get caught and unpublished.
   ```bash
   npm view <pkg> time --json | grep '"<version>"'
   ```
3. **Install without scripts:**
   ```bash
   npm ci --ignore-scripts
   ```
4. **Regenerating a lockfile** (manual upgrade branch, ERESOLVE from a stale tree): resolve it in an empty scratch
   dir that has its own `package.json` (otherwise npm walks up to a parent `package.json`), with a release-age cutoff,
   then copy `package-lock.json` back and `npm ci --ignore-scripts`:
   ```bash
   npm install --package-lock-only --ignore-scripts --before=<YYYY-MM-DD, ~1 week ago>
   ```
5. Run scripts only for packages that need them, after the checks above (`npm rebuild sharp`, `npx prisma generate`, `npm rebuild esbuild` …).

`--ignore-scripts` only blocks install hooks. `build` and `dev` still run the packages' code (bundler plugins, frameworks). Do steps 1–2 before building anything.

### 3. Verify

```bash
npm run lint && npx tsc --noEmit && npm run build     # use the project's actual scripts
```

- Run the project's tests, if it has any.
- Start the dev server and click through the pages that use the updated packages (the review lists them with `file:line`).
- **Vercel preview** (link in the PR checks or in the Vercel bot comment) runs on Vercel and **usually uses the production Supabase**. Click carefully: no deleting, no real submits or emails.
- A failing preview or CI means the update breaks the build. Production is not affected until merge.

### 4. Report and decide (owner)

- Give the owner a short verdict: what changes, what you verified (lint/tsc/build/tests/manual), what failed, and a recommendation: **merge**, **merge after X**, or **hold**.
- **Order:** merge the small, lockfile-only patch PRs first, then the grouped PR. After each merge, Dependabot rebases the remaining PRs and closes the ones that are no longer needed.
- **Do not close a security PR just to tidy up.** Dependabot will not reopen it, and the alert stays open. To get a fresh PR against the current `main`, comment `@dependabot recreate`.
- **Major bumps** (for example Next 15 → 16): do not patch the Dependabot branch, because Dependabot stops rebasing branches with foreign commits. Plan the migration on a separate branch from `main` (bump + fixes, codemods), open a PR, and let the Dependabot PR close itself afterwards.
- Merge: on GitHub or `gh pr merge <n> --squash --delete-branch`. Then `git checkout main && git pull && npm ci`.

### 5. After the merge

- jikl-admin incidents for Dependabot alerts close themselves once GitHub marks the alerts fixed (a few minutes after the push to `main`, then 2 cron runs).
- Record any project-specific gotchas you found (a package that needs `npm rebuild`, a breaking change) in your knowledge file.
