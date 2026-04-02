# 🚨 CRITICAL PRECOMMIT RULES - MUST FOLLOW 🚨

## ⚠️ MANDATORY: Run Precommit Script

**YOU MUST RUN `./precommit.sh` IN THESE SITUATIONS:**

1. ✅ **BEFORE EVERY COMMIT** - No exceptions!
2. ✅ **AFTER COMPLETING ANY TASK** - Before marking it as done
3. ✅ **AFTER ANY CODE CHANGES** - Before pushing to repository

### How to Run:

```bash
./precommit.sh
```

### What It Does:

- ✓ Installs dependencies
- ✓ Runs the exact CI lint gate: `npm run lint` (`prettier --check . && eslint .`)
- ✓ Generates translation files
- ✓ Performs TypeScript type checking
- ✓ Builds the project
- ✓ Validates JSON data integrity

**⚠️ IF PRECOMMIT FAILS:**

- DO NOT commit
- DO NOT push
- FIX all errors first
- Run `./precommit.sh` again
- Only proceed when ALL checks pass ✓

### Lint Is A Required CI Gate

- `npm run lint` must pass locally before every commit and push.
- GitHub Actions runs the same command in the `Lint` step, so local success must match CI success.
- Root-level scripts and utilities such as `*.cjs`, `*.js`, and `*.ts` are included by `eslint .`; do not assume only `src/` is linted.
- If CI lint fails unexpectedly, run `npm ci && npm run lint` locally to reproduce the clean-runner environment.

---

## 🌍 MANDATORY: Translation Requirements

**CRITICAL:** Any changes to user-facing text MUST include translations!

### When Translations Are Required:

- ✓ Adding new UI text, labels, or messages
- ✓ Modifying existing user-visible text
- ✓ Creating new features with text content
- ✓ Error messages, tooltips, or notifications

### Translation Files Location:

All translation files are in `/messages/` directory:

- `en.json` - English (source)
- `es.json` - Spanish
- `fr.json` - French
- `de.json` - German
- `pt-BR.json` - Brazilian Portuguese
- `ja.json` - Japanese
- `zh.json` - Chinese
- `ko.json` - Korean
- `ru.json` - Russian
- `ar.json` - Arabic
- And 11+ more languages

### Process:

1. Add/modify text in `messages/en.json` first
2. Update ALL other language files with equivalent translations
3. Run `./precommit.sh` to regenerate paraglide files
4. Verify translations are working correctly

**⚠️ DO NOT:**

- Skip translations for "minor" text changes
- Leave untranslated strings in the codebase
- Commit changes without updating all language files

---

## 📁 Key Files & Architecture

### Core Data Files

| File                 | Purpose                                       |
| -------------------- | --------------------------------------------- |
| `data/showdown.json` | All models, benchmarks, and categories        |
| `src/lib/types.ts`   | TypeScript interfaces for all data structures |
| `src/lib/ranking.ts` | Core ranking/imputation logic (~800 lines)    |
| `UPDATE.md`          | Comprehensive guide for updating model data   |

### When Making Changes

1. **New benchmark/category**: Update `types.ts` → `ranking.ts` → `showdown.json` → translations
2. **New model field**: Update `types.ts` → JSON validation in `precommit.sh` → `showdown.json`
3. **UI changes**: Update `+page.svelte` → Add translations for all 21 languages
4. **Algorithm changes**: Update `ranking.ts` → Add tests in `ranking.test.ts`

---

## 🧮 Imputation System (superior_of)

### Business Rules

- **superior_of**: Links "thinking" variants to their base model
- **Ratio calculation**: Uses shared benchmarks to estimate superiority (clamped 1.02-1.20)
- **Confidence levels**: Low (0-2 benchmarks), Medium (3-5), High (6+)
- **Validation**: Cycle detection and reference validation in `precommit.sh`

### Visual Indicators

| Icon | Meaning                    |
| ---- | -------------------------- |
| \*⚠  | Low confidence estimate    |
| \*◐  | Medium confidence estimate |
| \*✓  | High confidence estimate   |
| 🟢   | superior_of method (green) |
| 🟡   | category_average (amber)   |

---

## ✅ Testing Requirements

- **Always run tests** before committing: `npm test`
- **Add tests** for any new functions in `ranking.ts`
- **Test coverage** should include edge cases (null values, empty arrays, clamping)
- **56+ tests** currently in `src/lib/ranking.test.ts`

---

# Main Rules

- Everytime you end a task, call the play_notification tool.
- **ALWAYS run `./precommit.sh` before committing or after completing tasks** - this ensures all validation checks pass.
- **Read UPDATE.md** before adding/updating model data - it contains the complete workflow
- **Test first** - Run `npm test` to understand the current test coverage before making changes

# For Svelte 5 documentation:

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
