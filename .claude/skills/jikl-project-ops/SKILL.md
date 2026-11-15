---
name: jikl-project-ops
description: Operations setup every JiKl project gets after its first push to GitHub — Dependabot security alerts plus grouped security-update PRs (.github/dependabot.yml), the read-only Claude Code workflow (.github/workflows/claude.yml + CLAUDE_CODE_OAUTH_TOKEN secret, "@claude" in an issue = incident analysis, in a PR = Dependabot PR review), and registration in jikl-admin monitoring. Use when bootstrapping a new project, creating its GitHub repo, setting up CI/GitHub Actions, Dependabot, security alerts or PRs, incident analysis, PR review, or monitoring.
---

# Project operations setup (GitHub + jikl-admin)

Every project in the JiKl-coding GitHub account is monitored by **jikl-admin** (`admin.jikl-coding.com`). Once a new project has its GitHub repo, do these three things. The source of truth for the workflow and the script is the jikl-admin repo (`scripts/templates/claude.yml`, `scripts/setup-claude-workflow.mjs`). Never copy an old version from another project.

## 1. Dependabot: alerts + grouped security PRs

Run this from the **jikl-admin** repo, using the logged-in `gh`:

```bash
node scripts/setup-dependabot.mjs JiKl-coding/<repo>        # --dry-run to preview
```

- Enables `vulnerability-alerts`, commits `.github/dependabot.yml` and enables `automated-security-fixes`.
- The config is npm, one entry per folder with a package.json. Version updates are off (`open-pull-requests-limit: 0`) and security updates are grouped (`groups.security.applies-to: security-updates`), so there is one PR per run instead of dozens.
- A `dependabot.yml` the project manages itself (without the `# managed by jikl-admin` header) is left untouched.
- jikl-admin reads the alerts. Open high or critical alerts become a warn incident (digest only), and the incident closes itself once the alerts are fixed.
- Dependabot never merges. **The owner merges**, after reviewing with Claude (below) and checking CI and the Vercel preview. A failing preview on a Dependabot PR means the update breaks the build. Production is not affected.
- A grouped PR's description can understate the diff, for example hiding a major bump. Always review the actual diff.
- How to review, test locally and merge these PRs safely is in the `jikl-dependency-updates` skill.

## 2. Claude Code workflow (read-only): incident analysis + PR review

The workflow runs Claude Code on the Max subscription (no API key) when the **repo owner** writes a comment containing `@claude`:

- **in an issue:** jikl-admin `analyze <incident>` posts the comment, and Claude replies with the root cause, `file:line` references and a suggested fix.
- **in a PR:** jikl-admin "review" on a Dependabot PR (or a hand-written comment) gets a reply with what changes, where we use it, risks and a merge recommendation.

Run this from the **jikl-admin** repo, where `.env.local` holds `CLAUDE_CODE_OAUTH_TOKEN`:

```bash
node scripts/setup-claude-workflow.mjs JiKl-coding/<repo>
```

The script commits `.github/workflows/claude.yml` to the default branch and sets the repo secret `CLAUDE_CODE_OAUTH_TOKEN`. It never prints the token. What the workflow does:

- uses the project's agent from `.claude/settings.json` (`"agent"`) when `.claude/agents/<name>.md` exists, so **commit `.claude/` to the repo** (don't gitignore it),
- is read-only: `contents: read` (so no commit and no merge); `pull-requests: write` only for comments; Edit, Write, web fetch and search are disabled; the shell is limited to `git diff/log/show/status`; no knowledge-file updates,
- treats issue and PR text, release notes and changelogs as untrusted data.

To renew the token after it expires (about 1 year): run `claude setup-token`, update `.env.local`, then `node scripts/setup-claude-workflow.mjs <all repos> --secret-only`.

## 3. Register in jikl-admin

- In jikl-admin, go to **Projects → add**. Set the GitHub repo, the Vercel project(s) and the Supabase ref. The registry lives in the DB, not in code.
- Vercel: use Node **22.x or newer**. jikl-admin warns below `nodeMinMajor`.
- Commit `package-lock.json`. The daily dependency check reads installed versions from it. Without it, it falls back to the lower bound of each range.

## Checklist

- [ ] Dependabot via `setup-dependabot.mjs` (alerts + grouped security PRs)
- [ ] `claude.yml` + `CLAUDE_CODE_OAUTH_TOKEN` secret (via the jikl-admin script)
- [ ] `.claude/` committed, with `settings.json` `"agent"` pointing to an existing agent
- [ ] project added in jikl-admin (repo, Vercel, Supabase)
- [ ] `package-lock.json` committed, Node ≥ 22 on Vercel
