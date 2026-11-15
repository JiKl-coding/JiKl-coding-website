# agent-convert

Převádí vlastní agenty a skills mezi **GitHub Copilot**, **Claude Code** a **Codex**.
Jeden soubor, bez závislostí, potřebuje jen **Node 18+**.

## Kam se co zapisuje

| Nástroj | Agenti                        | Skills                |
|---------|-------------------------------|-----------------------|
| Copilot | `.github/agents/x.agent.md`   | `.github/skills/x/`   |
| Claude  | `.claude/agents/x.md`         | `.claude/skills/x/`   |
| Codex   | `.codex/agents/x.toml`        | `.agents/skills/x/`   |

## Spuštění

Instalátor (`import-agents.mjs`) ho dává do `scripts/agent-converter/`. Spouští se z kořene repozitáře (kořen se najde podle `.git`, takže funguje i z podsložky):

```bash
node scripts/agent-converter/agent-convert.mjs --from <zdroj> --to <cíl>[,<cíl>]
```

### Příklady

```bash
# Copilot -> Claude
node scripts/agent-converter/agent-convert.mjs --from copilot --to claude

# Claude -> Copilot
node scripts/agent-converter/agent-convert.mjs --from claude --to copilot

# Copilot -> Claude i Codex najednou
node scripts/agent-converter/agent-convert.mjs --from copilot --to claude,codex

# Copilot -> Codex s OpenAI modelem
node scripts/agent-converter/agent-convert.mjs --from copilot --to codex --model gpt-5

# Jen zkouška, nic se nezapíše
node scripts/agent-converter/agent-convert.mjs --from copilot --to claude --dry-run
```

Zdroj i cíl může být `copilot`, `claude` nebo `codex`.

### Spuštění ze skriptu mimo repo

```bash
cd cesta/k/repu
node C:/tools/agent-convert.mjs --from copilot --to claude
```

Nebo zadejte repo výslovně: `--repo cesta/k/repu`.

Volitelný alias v PowerShell profilu:

```powershell
function agent-convert { node C:\tools\agent-convert.mjs @args }
```

## Volby

| Volba                       | Význam                                                          |
|-----------------------------|-----------------------------------------------------------------|
| `--from <formát>`           | zdroj: `copilot`, `claude`, `codex` (povinné)                   |
| `--to <formát,...>`         | cíl(e), oddělené čárkou (povinné)                               |
| `--repo <dir>`              | kořen repa (výchozí: nejbližší nadřazená složka s `.git`)       |
| `--out <dir>`               | kam zapisovat (výchozí: stejné jako `--repo`)                   |
| `--only agents\|skills`     | převést jen agenty nebo jen skills                              |
| `--model <hodnota>`         | vynutí model ve všech cílových agentech                         |
| `--codex-skills-dir <cesta>`| složka skills pro Codex (výchozí `.agents/skills`)              |
| `--agent <jméno>`           | hlavní agent do `.claude/settings.json` (jinak se skript zeptá) |
| `--no-settings`             | `.claude/settings.json` nezakládat ani neměnit                  |
| `--keep-attribution`        | nevypínat AI attribution (`Co-Authored-By`) v settings.json     |
| `--no-claude-md`            | kořenový `CLAUDE.md` nezakládat ani neměnit                     |
| `--gitignore`               | přidat skript, README a vytvořené složky do `.gitignore`        |
| `--no-gitignore`            | `.gitignore` neměnit a neptat se                                |
| `--dry-run`                 | jen vypíše, co by se zapsalo                                    |
| `-h`, `--help`              | nápověda                                                        |

## Co se převádí

- **Skills:** celé složky se zkopírují, formát `SKILL.md` je u všech nástrojů stejný.
- **Agenti:** `name`, `description`, `model`, `tools`.
- **Cesty v textu:** odkazy typu `.github/skills/...` se přepíšou na cílové složky.
- **Model:**
  - Copilot -> Claude: `Claude Sonnet ... (copilot)` -> `sonnet` (stejně `opus`, `haiku`).
  - Claude -> Copilot: podle tabulky `COPILOT_MODEL_NAMES` na začátku skriptu (upravte podle svých modelů).
  - Do Codexu projdou jen OpenAI modely (`gpt-*`, `o*`), jinak použijte `--model`.
- **Nástroje:** Copilot ↔ Claude se mapují (např. `search` ↔ `Grep, Glob`). Codex nemá seznam nástrojů, agent bez práva zapisovat a spouštět příkazy dostane `sandbox_mode = "read-only"`.

## Claude settings.json

Při převodu do Claude skript založí `.claude/settings.json` s `{ "agent": "<jméno>" }`.
Pokud soubor už existuje, přepíše jen klíč `agent` a ostatní nastavení nechá.
U jednoho agenta se použije ten, u více se skript zeptá (nebo použijte `--agent`).

Zároveň zapíše vypnutí AI attribution, aby Claude Code nepřidával `Co-Authored-By:` do commitů
ani „Generated with Claude Code“ do PR:

```json
{ "attribution": { "commit": "", "pr": "" } }
```

Vypnete to volbou `--keep-attribution`.

## CLAUDE.md

Claude Code čte `CLAUDE.md`, ne `AGENTS.md` (Copilot a Codex čtou `AGENTS.md` samy). Při převodu
do Claude proto skript založí v kořeni `CLAUDE.md`, který naimportuje všechny `AGENTS.md` v repu:

```markdown
@AGENTS.md
@web/AGENTS.md
```

Prohledávání vynechává skryté složky a `node_modules`, `dist`, `build`, `out`, `bin`, `obj`.
Existující `CLAUDE.md` se nepřepisuje, jen se na konec doplní chybějící importy. Pokud v repu
žádný `AGENTS.md` není, `CLAUDE.md` se nezakládá.

## .gitignore

Bez `--gitignore` / `--no-gitignore` se skript na konci zeptá. Při souhlasu přidá do kořenového
`.gitignore` (pod komentář `# agent-convert`) tento skript, jeho README a nově vytvořené kořenové
složky, např. `/.claude/`, `/.codex/`, `/.agents/`, a také `/CLAUDE.md`, pokud ho skript nově založil
(doplněný existující `CLAUDE.md` ne). Položky, které už tam jsou, nepřidává znovu.
Soubory, které už git sleduje, zůstanou sledované (`git rm -r --cached <cesta>`).

## Dobré vědět

- Nepřenositelná pole a modely se vynechají a skript je vypíše jako upozornění (`!`).
- Existující cílové soubory se **přepíšou** bez ptaní. Nejdřív zkuste `--dry-run`.
- Codex skills jsou ve výchozím nastavení v `.agents/skills`. Pokud to u vás nesedí, použijte `--codex-skills-dir`.
