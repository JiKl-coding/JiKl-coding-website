#!/usr/bin/env node
/**
 * agent-convert — převod custom agentů a skills mezi GitHub Copilot, Claude Code a Codex.
 *
 *   Copilot : .github/agents/<n>.agent.md   + .github/skills/<n>/SKILL.md
 *   Claude  : .claude/agents/<n>.md         + .claude/skills/<n>/SKILL.md
 *   Codex   : .codex/agents/<n>.toml        + .agents/skills/<n>/SKILL.md
 *
 * Bez závislostí, stačí Node 18+. Skript je samostatný soubor – zkopíruj ho kamkoli.
 *
 * Použití:
 *   node scripts/agent-converter/agent-convert.mjs --from copilot --to claude,codex [volby]
 *   node scripts/agent-converter/agent-convert.mjs --from claude  --to copilot
 *
 * Volby:
 *   --from <copilot|claude|codex>     zdrojový formát (povinné)
 *   --to   <copilot|claude|codex,..>  cílové formáty, čárkou oddělené (povinné)
 *   --repo <dir>        kořen repozitáře (výchozí: nejbližší nadřazený adresář s .git, jinak cwd)
 *   --out  <dir>        kam zapisovat (výchozí: stejný --repo)
 *   --only <agents|skills>   převést jen agenty nebo jen skills
 *   --model <hodnota>   vynutí model v cílových agentech (přepíše mapování)
 *   --codex-skills-dir <rel>  složka skills pro Codex (výchozí: .agents/skills)
 *   --agent <name>      hlavní agent do .claude/settings.json (jinak se skript zeptá,
 *                       pokud se převádí víc agentů; s jedním agentem se použije ten)
 *   --no-settings       nezakládat/neupravovat .claude/settings.json
 *   --keep-attribution  nezapisovat do settings.json vypnutí AI attribution (Co-Authored-By)
 *   --no-claude-md      nezakládat/neupravovat kořenový CLAUDE.md
 *   --gitignore         přidá do kořenového .gitignore tento skript, jeho README
 *                       a vytvořené cílové složky (.claude, .codex, …)
 *   --no-gitignore      .gitignore neměnit a neptat se (bez obou voleb se skript zeptá)
 *   --dry-run          nic nezapisuje, jen vypíše co by se stalo
 *   -h, --help
 *
 * Při převodu do Claude skript založí (nebo doplní) .claude/settings.json o { "agent": "<name>" }
 * a { "attribution": { "commit": "", "pr": "" } } (Claude Code pak nepřidává Co-Authored-By
 * do commitů ani "Generated with" do PR), ostatní klíče v existujícím souboru zachová. Dále založí kořenový CLAUDE.md s importy (@cesta)
 * všech AGENTS.md v repu – Claude Code AGENTS.md sám nečte. Existující CLAUDE.md jen doplní.
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";

// ───────────────────────── konfigurace (uprav podle potřeby) ─────────────────────────

const LAYOUT = {
  copilot: { agents: ".github/agents", skills: ".github/skills" },
  claude: { agents: ".claude/agents", skills: ".claude/skills" },
  codex: { agents: ".codex/agents", skills: ".agents/skills" },
};

// Alias Claude modelu -> jak se jmenuje v Copilot model pickeru. Uprav na verze, které máš k dispozici.
const COPILOT_MODEL_NAMES = {
  sonnet: "Claude Sonnet 5.5 (copilot)",
  opus: "Claude Opus 5.5 (copilot)",
  haiku: "Claude Haiku 5.5 (copilot)",
};

// Kanonické nástroje (pojmenované jako v moderním Copilotu) -> názvy v Claude Code.
const CANON_TO_CLAUDE = {
  read: ["Read"],
  edit: ["Edit", "Write"],
  search: ["Grep", "Glob"],
  execute: ["Bash"],
  web: ["WebFetch", "WebSearch"],
  agent: ["Agent"],
  todo: ["TodoWrite"],
};
const CLAUDE_TO_CANON = {
  Read: "read", Edit: "edit", Write: "edit", NotebookEdit: "edit", MultiEdit: "edit",
  Grep: "search", Glob: "search", Bash: "execute", PowerShell: "execute",
  WebFetch: "web", WebSearch: "web", Agent: "agent", Task: "agent", TodoWrite: "todo",
};
// Staré i nové názvy Copilot nástrojů -> kanonické.
const COPILOT_TO_CANON = {
  read: "read", readFile: "read", problems: "read", changes: "read",
  edit: "edit", editFiles: "edit", createFile: "edit", createDirectory: "edit",
  search: "search", codebase: "search", usages: "search", findTestFiles: "search",
  githubRepo: "search", textSearch: "search", fileSearch: "search", listDirectory: "search",
  execute: "execute", runCommands: "execute", runTasks: "execute", terminalLastCommand: "execute",
  web: "web", fetch: "web", webSearch: "web",
  agent: "agent", runSubagent: "agent",
  todo: "todo", todos: "todo",
};
const CANON_TO_COPILOT = ["read", "edit", "search", "execute", "web", "agent", "todo"];

// ───────────────────────── YAML frontmatter (minimální) ─────────────────────────

function splitFrontmatter(text) {
  text = text.replace(/^\uFEFF/, "");
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n([\s\S]*))?$/);
  if (!m) return { entries: {}, body: text };
  const entries = {};
  let key = null;
  for (const line of m[1].split(/\r?\n/)) {
    const km = /^([A-Za-z0-9_-]+):[ \t]*(.*)$/.exec(line);
    if (km) {
      key = km[1];
      entries[key] = { raw: km[2].trim(), extra: [] };
    } else if (key) entries[key].extra.push(line);
  }
  return { entries, body: m[2] ?? "" };
}

function unquote(s) {
  s = s.trim();
  if (s.startsWith("'") && s.endsWith("'") && s.length >= 2) return s.slice(1, -1).replace(/''/g, "'");
  if (s.startsWith('"') && s.endsWith('"') && s.length >= 2) {
    try { return JSON.parse(s); } catch { return s.slice(1, -1); }
  }
  return s;
}

function splitInlineList(s) {
  const out = [];
  let cur = "", q = null;
  for (const ch of s) {
    if (q) { cur += ch; if (ch === q) q = null; }
    else if (ch === "'" || ch === '"') { q = ch; cur += ch; }
    else if (ch === ",") { out.push(cur); cur = ""; }
    else cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out.map(unquote).filter((x) => x !== "");
}

/** Vrátí string | string[] | undefined. */
function fmValue(entry) {
  if (!entry) return undefined;
  const { raw, extra } = entry;
  const lines = extra.map((l) => l.trim()).filter(Boolean);
  if (/^[>|][+-]?$/.test(raw)) return lines.join(raw.startsWith(">") ? " " : "\n");
  if (raw === "" && lines.some((l) => l.startsWith("-"))) {
    return lines.filter((l) => l.startsWith("-")).map((l) => unquote(l.replace(/^-\s*/, "")));
  }
  if (raw.startsWith("[") && raw.endsWith("]")) return splitInlineList(raw.slice(1, -1));
  return [unquote(raw), ...lines].join(" ").trim();
}

function yamlStr(s) {
  if (/\n/.test(s)) return JSON.stringify(s);
  if (/^[A-Za-z0-9][^:#'"]*$/.test(s) && !/\s$/.test(s) && !/: /.test(s)) return s;
  return "'" + s.replace(/'/g, "''") + "'";
}

// ───────────────────────── TOML (minimální, jen to, co Codex agent potřebuje) ─────────────────────────

function parseToml(text) {
  const out = {};
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*\[/.test(lines[i])) break; // tabulky (mcp_servers, skills.config…) ignorujeme
    const m = /^([A-Za-z0-9_-]+)\s*=\s*(.*)$/.exec(lines[i]);
    if (!m) continue;
    const v = m[2];
    const ml = /^("""|''')/.exec(v);
    if (ml) {
      const d = ml[1];
      const first = v.slice(3);
      let s;
      if (first.includes(d)) s = first.slice(0, first.indexOf(d));
      else {
        const parts = [first];
        while (++i < lines.length) {
          const e = lines[i].indexOf(d);
          if (e >= 0) { parts.push(lines[i].slice(0, e)); break; }
          parts.push(lines[i]);
        }
        s = parts.join("\n");
      }
      if (s.startsWith("\n")) s = s.slice(1);
      if (d === '"""') s = s.replace(/\\\r?\n\s*/g, "").replace(/\\(["\\])/g, "$1").replace(/\\n/g, "\n").replace(/\\t/g, "\t");
      out[m[1]] = s;
    } else if (v.startsWith('"')) {
      try { out[m[1]] = JSON.parse(v.replace(/\s+#.*$/, "")); } catch { out[m[1]] = v.slice(1, -1); }
    } else if (v.startsWith("'")) out[m[1]] = v.slice(1, v.lastIndexOf("'"));
    else if (v.startsWith("[")) {
      try { out[m[1]] = JSON.parse(v.replace(/'/g, '"')); } catch { /* ignore */ }
    } else out[m[1]] = v.replace(/\s+#.*$/, "").trim();
  }
  return out;
}

function tomlString(s) {
  if (!s.includes("'''") && !s.endsWith("'")) return "'''\n" + s + "\n'''";
  return JSON.stringify(s); // JSON string je platný TOML basic string
}

// ───────────────────────── převody modelu a nástrojů ─────────────────────────

function claudeAlias(model) {
  if (!model) return undefined;
  const m = model.toLowerCase();
  if (m === "inherit") return undefined;
  for (const a of ["opus", "sonnet", "haiku"]) if (m.includes(a)) return a;
  return undefined;
}

function modelFor(target, model, opts, warn) {
  if (opts.model) return opts.model;
  if (!model) return undefined;
  if (target === "claude") {
    const a = claudeAlias(model);
    if (!a) warn(`model "${model}" nemá v Claude odpovídající alias – vynechán (inherit)`);
    return a;
  }
  if (target === "copilot") {
    if (/\(copilot\)/i.test(model)) return model;
    const a = claudeAlias(model);
    if (a) return COPILOT_MODEL_NAMES[a];
    warn(`model "${model}" nelze přeložit do Copilotu – vynechán (použij --model)`);
    return undefined;
  }
  if (target === "codex") {
    if (/^(gpt|o\d|codex)/i.test(model)) return model;
    warn(`model "${model}" není OpenAI model – v Codexu vynechán (použij --model)`);
    return undefined;
  }
}

/** Zdrojový seznam nástrojů -> množina kanonických jmen (nebo null = "vše"). */
function toCanon(source, list, warn) {
  if (list === undefined) return null;
  const arr = Array.isArray(list) ? list : String(list).split(",").map((s) => s.trim()).filter(Boolean);
  const out = new Set();
  for (const t of arr) {
    if (source === "copilot") {
      if (COPILOT_TO_CANON[t]) out.add(COPILOT_TO_CANON[t]);
      else if (t.includes("/")) out.add("mcp:" + t);
      else warn(`neznámý Copilot nástroj "${t}" – vynechán`);
    } else {
      const base = t.replace(/\(.*\)$/, "").trim(); // Bash(git:*) -> Bash
      if (CLAUDE_TO_CANON[base]) out.add(CLAUDE_TO_CANON[base]);
      else if (base.startsWith("mcp__")) {
        const [, server, tool] = base.split("__");
        out.add("mcp:" + server + "/" + (tool ?? "*"));
      } else warn(`neznámý Claude nástroj "${t}" – vynechán`);
    }
  }
  return out;
}

function fromCanon(target, canon) {
  if (!canon) return undefined;
  const out = [];
  for (const c of canon) {
    if (c.startsWith("mcp:")) {
      const [server, tool] = c.slice(4).split("/");
      if (target === "claude") out.push(tool && tool !== "*" ? `mcp__${server}__${tool}` : `mcp__${server}`);
      else out.push(`${server}/${tool ?? "*"}`);
    } else if (target === "claude") out.push(...CANON_TO_CLAUDE[c]);
    else if (CANON_TO_COPILOT.includes(c)) out.push(c);
  }
  return [...new Set(out)];
}

// ───────────────────────── čtení agentů ─────────────────────────

const AGENT_EXT = { copilot: /\.agent\.md$/, claude: /\.md$/, codex: /\.toml$/ };
const KNOWN_KEYS = {
  copilot: ["name", "description", "model", "tools"],
  claude: ["name", "description", "model", "tools"],
};

function readAgent(source, file, warn) {
  return parseAgent(source, fs.readFileSync(file, "utf8"), path.basename(file).replace(AGENT_EXT[source], ""), warn);
}

function parseAgent(source, text, fallbackName, warn) {
  if (source === "codex") {
    const t = parseToml(text);
    return {
      name: t.name || fallbackName,
      description: t.description || "",
      model: t.model,
      canonTools: undefined,
      readOnly: t.sandbox_mode === "read-only",
      body: t.developer_instructions || "",
    };
  }
  const { entries, body } = splitFrontmatter(text);
  const dropped = Object.keys(entries).filter((k) => !KNOWN_KEYS[source].includes(k));
  if (dropped.length) warn(`nepřenesená frontmatter pole: ${dropped.join(", ")}`);
  const canon = toCanon(source, fmValue(entries.tools), warn);
  return {
    name: fmValue(entries.name) || fallbackName,
    description: fmValue(entries.description) || "",
    model: fmValue(entries.model),
    canonTools: canon,
    readOnly: canon ? !canon.has("edit") && !canon.has("execute") : false,
    body: body.replace(/^\r?\n/, ""),
  };
}

// ───────────────────────── zápis agentů ─────────────────────────

function renderAgent(target, a, srcFile, opts, warn) {
  const model = modelFor(target, a.model, opts, warn);
  if (target === "codex") {
    const lines = [
      `# Vygenerováno skriptem agent-convert z ${srcFile}. Ruční úpravy se při dalším převodu přepíšou.`,
      `name = ${JSON.stringify(a.name)}`,
      `description = ${JSON.stringify(a.description)}`,
    ];
    if (model) lines.push(`model = ${JSON.stringify(model)}`);
    if (a.readOnly) lines.push(`sandbox_mode = "read-only"`);
    else if (a.canonTools) warn("Codex nemá per-agent seznam nástrojů – dědí se výchozí sandbox");
    lines.push(`developer_instructions = ${tomlString(a.body.replace(/\s+$/, ""))}`);
    return lines.join("\n") + "\n";
  }
  const fm = [`name: ${yamlStr(a.name)}`, `description: ${yamlStr(a.description)}`];
  if (model) fm.push(`model: ${yamlStr(model)}`);
  if (a.canonTools !== undefined || a.readOnly) {
    let canon = a.canonTools;
    if (!canon && a.readOnly) canon = new Set(["read", "search", "web"]); // z Codex read-only
    const tools = fromCanon(target, canon);
    if (tools && tools.length) {
      fm.push(target === "claude" ? `tools: ${tools.join(", ")}` : `tools: [${tools.map((t) => `'${t}'`).join(", ")}]`);
    }
  }
  return `---\n${fm.join("\n")}\n---\n\n${a.body.replace(/^\s+/, "")}`;
}

function targetAgentFile(target, name) {
  const ext = { copilot: ".agent.md", claude: ".md", codex: ".toml" }[target];
  return path.join(LAYOUT[target].agents, name + ext);
}

// ───────────────────────── přepis cest v textu ─────────────────────────

function rewritePaths(text, source, target, layout) {
  let out = text;
  for (const kind of ["agents", "skills"]) {
    const from = LAYOUT[source][kind];
    const to = layout[target][kind];
    if (from !== to) out = out.split(from).join(to);
  }
  return out;
}

// ───────────────────────── skills ─────────────────────────

const TEXT_EXT = new Set([".md", ".txt", ".json", ".yml", ".yaml", ".toml"]);

function copyTree(srcDir, dstDir, ctx, rel = "") {
  for (const ent of fs.readdirSync(path.join(srcDir, rel), { withFileTypes: true })) {
    const r = path.join(rel, ent.name);
    if (ent.isDirectory()) copyTree(srcDir, dstDir, ctx, r);
    else {
      const from = path.join(srcDir, r);
      const to = path.join(dstDir, r);
      if (TEXT_EXT.has(path.extname(ent.name).toLowerCase())) {
        const txt = rewritePaths(fs.readFileSync(from, "utf8"), ctx.source, ctx.target, ctx.layout);
        ctx.write(to, txt);
      } else ctx.write(to, fs.readFileSync(from));
    }
  }
}

// ───────────────────────── hlavní běh ─────────────────────────

function parseArgs(argv) {
  const o = { dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === "--from") o.from = next();
    else if (a === "--to") o.to = next();
    else if (a === "--repo") o.repo = next();
    else if (a === "--out") o.out = next();
    else if (a === "--only") o.only = next();
    else if (a === "--model") o.model = next();
    else if (a === "--codex-skills-dir") o.codexSkills = next();
    else if (a === "--agent") o.agent = next();
    else if (a === "--no-settings") o.noSettings = true;
    else if (a === "--keep-attribution") o.keepAttribution = true;
    else if (a === "--no-claude-md") o.noClaudeMd = true;
    else if (a === "--gitignore") o.gitignore = true;
    else if (a === "--no-gitignore") o.gitignore = false;
    else if (a === "--dry-run") o.dryRun = true;
    else if (a === "-h" || a === "--help") o.help = true;
    else throw new Error(`Neznámá volba: ${a}`);
  }
  return o;
}

function findRepoRoot(start) {
  let d = path.resolve(start);
  while (true) {
    if (fs.existsSync(path.join(d, ".git"))) return d;
    const p = path.dirname(d);
    if (p === d) return path.resolve(start);
    d = p;
  }
}

/** Vybere hlavního agenta: --agent, jediný agent, nebo dotaz na uživatele. Vrací jméno nebo undefined. */
async function chooseMainAgent(names, opts) {
  if (opts.agent) {
    if (!names.includes(opts.agent)) throw new Error(`--agent "${opts.agent}" není mezi převedenými agenty (${names.join(", ")})`);
    return opts.agent;
  }
  if (names.length === 1) return names[0];
  if (!process.stdin.isTTY) {
    console.warn(`  ! neinteraktivní běh a víc agentů – settings.json se nezapíše (použij --agent <name>)`);
    return undefined;
  }
  console.log("\nKterý agent má být hlavní v .claude/settings.json?");
  names.forEach((n, i) => console.log(`  ${i + 1}) ${n}`));
  console.log("  0) žádný (settings.json nezapisovat)");
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    while (true) {
      const ans = (await rl.question(`Volba [1-${names.length}, Enter = 1]: `)).trim();
      if (ans === "") return names[0];
      if (ans === "0") return undefined;
      const i = Number(ans);
      if (Number.isInteger(i) && i >= 1 && i <= names.length) return names[i - 1];
      if (names.includes(ans)) return ans;
      console.log("  neplatná volba");
    }
  } finally {
    rl.close();
  }
}

function writeClaudeSettings(agentName, out, write, { noAttribution = true } = {}) {
  const rel = path.join(".claude", "settings.json");
  const abs = path.join(out, rel);
  let settings = {};
  if (fs.existsSync(abs)) {
    try {
      settings = JSON.parse(fs.readFileSync(abs, "utf8").replace(/^﻿/, ""));
    } catch (e) {
      console.warn(`  ! ${rel} nelze načíst (${e.message}) – nezměněno`);
      return false;
    }
  }
  if (agentName) settings.agent = agentName;
  // Prázdné řetězce = Claude Code nepřidává Co-Authored-By do commitů ani "Generated with" do PR.
  if (noAttribution) settings.attribution = { ...settings.attribution, commit: "", pr: "" };
  const parts = [agentName && `agent: ${agentName}`, noAttribution && "attribution: vypnuto"].filter(Boolean);
  console.log(`Settings (${parts.join(", ")})`);
  write(rel, JSON.stringify(settings, null, 2) + "\n");
  return true;
}

async function askYesNo(question, def = false) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const ans = (await rl.question(`${question} ${def ? "[Y/n]" : "[y/N]"}: `)).trim().toLowerCase();
    if (ans === "") return def;
    return ["y", "yes", "a", "ano"].includes(ans);
  } finally {
    rl.close();
  }
}

/** Doplní do <repo>/.gitignore skript, jeho README a vytvořené kořenové složky. Vrací počet přidaných řádků. */
function updateGitignore(repo, out, createdTopDirs, dryRun) {
  const toEntry = (abs) => {
    const rel = path.relative(repo, abs).replace(/\\/g, "/");
    if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) return undefined; // mimo repo
    return "/" + rel;
  };
  const scriptAbs = fileURLToPath(import.meta.url);
  const wanted = [
    toEntry(scriptAbs),
    toEntry(path.join(path.dirname(scriptAbs), "agent-convert.README.md")),
    ...[...createdTopDirs].map((d) => {
      const isDir = d.endsWith("/");
      const e = toEntry(path.join(out, d.replace(/\/$/, "")));
      return e && (isDir ? e + "/" : e);
    }),
  ].filter(Boolean);

  const file = path.join(repo, ".gitignore");
  const existing = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  const norm = (l) => l.trim().replace(/^\//, "").replace(/\/$/, "");
  const have = new Set(existing.split(/\r?\n/).map(norm).filter(Boolean));
  const add = [...new Set(wanted)].filter((e) => !have.has(norm(e)));

  console.log(`\n.gitignore`);
  if (!add.length) {
    console.log("  (vše už je v .gitignore)");
    return 0;
  }
  for (const e of add) console.log(`  ${dryRun ? "[dry] " : ""}+ ${e}`);
  if (dryRun) return add.length;
  const eol = existing.includes("\r\n") ? "\r\n" : "\n";
  const sep = existing === "" ? "" : existing.endsWith("\n") ? eol : eol + eol;
  fs.writeFileSync(file, existing + sep + ["# agent-convert", ...add].join(eol) + eol);
  console.log("  (už verzované soubory zůstávají v gitu – případně `git rm -r --cached <cesta>`)");
  return add.length;
}

const SCAN_SKIP = new Set(["node_modules", "dist", "build", "out", "bin", "obj", "vendor", "coverage"]);

/** Najde všechny AGENTS.md v repu (bez skrytých a build složek). Vrací cesty relativní k `base`, kořenový první. */
function findAgentsMd(repo, base) {
  const found = [];
  const walk = (dir) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.isDirectory()) {
        if (!ent.name.startsWith(".") && !SCAN_SKIP.has(ent.name)) walk(path.join(dir, ent.name));
      } else if (ent.name === "AGENTS.md") found.push(path.relative(base, path.join(dir, ent.name)).replace(/\\/g, "/"));
    }
  };
  walk(repo);
  return found.sort((a, b) => a.split("/").length - b.split("/").length || a.localeCompare(b));
}

/**
 * Claude Code nečte AGENTS.md sám – kořenový CLAUDE.md je naimportuje přes @cesta.
 * Existující CLAUDE.md se nepřepisuje, jen se na konec doplní chybějící importy.
 * Vrací "created" | "updated" | undefined.
 */
function writeClaudeMd(repo, out, write) {
  const imports = findAgentsMd(repo, out);
  console.log("CLAUDE.md");
  if (!imports.length) {
    console.log("  (v repu není žádný AGENTS.md – CLAUDE.md se nezakládá)");
    return undefined;
  }
  const abs = path.join(out, "CLAUDE.md");
  if (!fs.existsSync(abs)) {
    write("CLAUDE.md", imports.map((p) => "@" + p).join("\n") + "\n");
    return "created";
  }
  const existing = fs.readFileSync(abs, "utf8");
  const have = new Set(
    [...existing.matchAll(/^@(\S+)/gm)].map((m) => m[1].replace(/^\.\//, "").replace(/\\/g, "/").toLowerCase()),
  );
  const missing = imports.filter((p) => !have.has(p.toLowerCase()));
  if (!missing.length) {
    console.log("  (všechny AGENTS.md už jsou naimportované)");
    return undefined;
  }
  const eol = existing.includes("\r\n") ? "\r\n" : "\n";
  const sep = existing === "" || existing.endsWith("\n") ? "" : eol;
  write("CLAUDE.md", existing + sep + missing.map((p) => "@" + p).join(eol) + eol);
  return "updated";
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help || !opts.from || !opts.to) {
    console.log(fs.readFileSync(new URL(import.meta.url), "utf8").split("*/")[0].replace(/^#!.*\n\/\*\*?/, "").replace(/^ \* ?/gm, ""));
    process.exit(opts.help ? 0 : 1);
  }
  const formats = Object.keys(LAYOUT);
  const targets = opts.to.split(",").map((s) => s.trim());
  for (const f of [opts.from, ...targets]) {
    if (!formats.includes(f)) throw new Error(`Neznámý formát "${f}" (povolené: ${formats.join(", ")})`);
  }
  if (targets.includes(opts.from)) throw new Error("--from a --to nesmí být stejné");

  const layout = structuredClone(LAYOUT);
  if (opts.codexSkills) layout.codex.skills = opts.codexSkills.replace(/\\/g, "/");

  const repo = path.resolve(opts.repo ?? findRepoRoot(process.cwd()));
  const out = path.resolve(opts.out ?? repo);
  let written = 0, warnings = 0;
  // kořenové položky zapsaných souborů: složky s "/" na konci (.claude/, .codex/…), soubory bez (CLAUDE.md)
  const createdTopDirs = new Set();

  const write = (relOrAbs, data) => {
    const abs = path.isAbsolute(relOrAbs) ? relOrAbs : path.join(out, relOrAbs);
    written++;
    const parts = path.relative(out, abs).split(/[\\/]/);
    createdTopDirs.add(parts.length > 1 ? parts[0] + "/" : parts[0]);
    console.log(`  ${opts.dryRun ? "[dry] " : ""}→ ${path.relative(out, abs)}`);
    if (opts.dryRun) return;
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, data);
  };

  console.log(`Repo: ${repo}\nOut:  ${out}\n${opts.from} → ${targets.join(", ")}\n`);

  // agenti
  const convertedAgents = [];
  const agentsDir = path.join(repo, layout[opts.from].agents);
  if (opts.only !== "skills" && fs.existsSync(agentsDir)) {
    const files = fs.readdirSync(agentsDir).filter((f) => AGENT_EXT[opts.from].test(f));
    for (const f of files) {
      console.log(`Agent ${f}`);
      const warn = (m) => { warnings++; console.warn(`  ! ${m}`); };
      const agent = readAgent(opts.from, path.join(agentsDir, f), warn);
      convertedAgents.push(agent.name);
      for (const target of targets) {
        const rendered = renderAgent(target, agent, `${layout[opts.from].agents}/${f}`, opts, warn);
        const body = rewritePaths(rendered, opts.from, target, layout);
        const dest = path.join(layout[target].agents, agent.name + { copilot: ".agent.md", claude: ".md", codex: ".toml" }[target]);
        write(dest, body);
      }
    }
    if (!files.length) console.log("(žádní agenti)");
  } else if (opts.only !== "skills") console.log(`(složka ${layout[opts.from].agents} neexistuje)`);

  // skills
  const skillsDir = path.join(repo, layout[opts.from].skills);
  if (opts.only !== "agents" && fs.existsSync(skillsDir)) {
    for (const ent of fs.readdirSync(skillsDir, { withFileTypes: true })) {
      if (!ent.isDirectory() || !fs.existsSync(path.join(skillsDir, ent.name, "SKILL.md"))) continue;
      console.log(`Skill ${ent.name}`);
      for (const target of targets) {
        copyTree(path.join(skillsDir, ent.name), path.join(out, layout[target].skills, ent.name), {
          source: opts.from, target, layout, write,
        });
      }
    }
  } else if (opts.only !== "agents") console.log(`(složka ${layout[opts.from].skills} neexistuje)`);

  // .claude/settings.json s hlavním agentem + vypnutou AI attribution v commitech/PR
  if (targets.includes("claude") && !opts.noSettings) {
    const mainAgent = convertedAgents.length ? await chooseMainAgent(convertedAgents, opts) : undefined;
    if (convertedAgents.length && !mainAgent) warnings++;
    const noAttribution = !opts.keepAttribution;
    if (mainAgent || noAttribution) writeClaudeSettings(mainAgent, out, write, { noAttribution });
  }

  // CLAUDE.md v kořeni s importy AGENTS.md
  if (targets.includes("claude") && !opts.noClaudeMd) {
    const res = writeClaudeMd(repo, out, write);
    // do .gitignore jen CLAUDE.md, který skript sám založil – existující (ručně psaný) ne
    if (res === "updated") createdTopDirs.delete("CLAUDE.md");
  }

  // .gitignore
  if (written) {
    let doIgnore = opts.gitignore;
    if (doIgnore === undefined && process.stdin.isTTY) {
      doIgnore = await askYesNo(`\nPřidat skript, README a ${[...createdTopDirs].join(", ")} do .gitignore?`);
    }
    if (doIgnore) updateGitignore(repo, out, createdTopDirs, opts.dryRun);
  }

  console.log(`\nHotovo: ${written} souborů${opts.dryRun ? " (dry-run, nic nezapsáno)" : ""}, ${warnings} upozornění.`);
}

// ───────────────────────── API pro jiné skripty (update-agents.mjs) ─────────────────────────

/** Cesta souboru v cílovém formátu, např. .github/agents/x.agent.md -> .claude/agents/x.md. */
export function convertPath(rel, from, to) {
  rel = rel.replace(/\\/g, "/");
  const a = LAYOUT[from].agents + "/";
  if (rel.startsWith(a)) return LAYOUT[to].agents + "/" + rel.slice(a.length).replace(AGENT_EXT[from], "") + { copilot: ".agent.md", claude: ".md", codex: ".toml" }[to];
  const s = LAYOUT[from].skills + "/";
  if (rel.startsWith(s)) return LAYOUT[to].skills + "/" + rel.slice(s.length);
  throw new Error(`${rel} není agent ani skill formátu ${from}`);
}

/** Převede obsah jednoho souboru (agent nebo soubor skillu) v paměti. Vrací string (binární soubory beze změny). */
export function convertContent(rel, content, from, to, { warn = () => {}, model } = {}) {
  rel = rel.replace(/\\/g, "/");
  if (rel.startsWith(LAYOUT[from].agents + "/")) {
    const fallback = path.basename(rel).replace(AGENT_EXT[from], "");
    const agent = parseAgent(from, String(content), fallback, warn);
    return rewritePaths(renderAgent(to, agent, rel, { model }, warn), from, to, LAYOUT);
  }
  if (!TEXT_EXT.has(path.extname(rel).toLowerCase())) return content;
  return rewritePaths(String(content), from, to, LAYOUT);
}

export { LAYOUT };

// Spustit main() jen při přímém volání (`node agent-convert.mjs`), ne při importu.
const samePath = (a, b) => {
  const real = (p) => { try { return fs.realpathSync(p); } catch { return path.resolve(p); } };
  const [x, y] = [real(a), real(b)];
  return process.platform === "win32" ? x.toLowerCase() === y.toLowerCase() : x === y;
};
const isMain = Boolean(process.argv[1]) && samePath(process.argv[1], fileURLToPath(import.meta.url));
if (isMain) {
  main().catch((e) => {
    console.error("Chyba: " + e.message);
    process.exit(1);
  });
}
