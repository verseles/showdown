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
- ✓ Runs linter (code quality)
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

# Main Rules

- Everytime you end a task, call the play_notification tool.
- **ALWAYS run `./precommit.sh` before committing or after completing tasks**

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
