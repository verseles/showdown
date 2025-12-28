# Data Update Guide

This document provides detailed instructions for updating `data/showdown.json` with new models or updated benchmark scores.

## Quick Reference for AI Assistants

When asked to update data (e.g., "Add GPT-5.2 to the rankings"), follow this process:

1. **Check current branch** - If on 'main', create a new branch first
2. **Search for official benchmark data** using the sources listed below
3. **Collect all available scores** from each benchmark source
4. **Get pricing and performance metrics** from provider pages and Artificial Analysis
5. **Create/update the model entry** following the schema
6. **Validate locally** with `./precommit.sh`
7. **Commit changes** and create a PR using `gh` CLI if available

---

## Navigation & Research Guidelines

### Branch Management

If working on the main branch:

```bash
# Create and switch to a new branch
git checkout -b feature/update-model-name

# After making changes and committing
gh pr create --title "Update [Model Name] benchmarks" --body "Update [Model Name] with latest benchmark scores"
```

### Accessing Links & Content

**Priority order for accessing web content:**

1. **Always use the proxy first** - Prefix URLs with `https://r.jina.ai/`
   - Example: `https://r.jina.ai/https://lmarena.ai/leaderboard/text/coding`
   - This provides clean, text-only content without heavy rendering

2. **Web Search** - Use `Web Search` tool when you need to find current information
   - Search for specific benchmark scores
   - Find official announcements from providers
   - Locate updated leaderboard data

3. **WebFetch** - Only use if `r.jina.ai` fails or returns incomplete content
   - Use for simple static content retrieval
   - Avoid for JavaScript-heavy pages

4. **Browser/Playwright** - Last resort only
   - Required for dynamic content that can't be accessed otherwise
   - Should be discouraged whenever possible

### Best Practices

- **Always start with Web Search** when looking for current benchmark data
- **Use r.jina.ai proxy** for all benchmark URLs listed in this document
- **Don't rely on cached knowledge** - Always verify current scores
- **Cross-validate data sources** - Never rely on a single source. Verify in at least 2-3 authoritative sources before applying corrections
- **Document ALL sources consulted** in commit messages when data is hard to find

---

## Critical Benchmarks (Most Important!)

### 🏆 SWE-Bench Verified - Gold Standard for Coding

- **URL**: https://swebench.com
- **What it measures**: Real-world GitHub issue resolution from popular Python repositories
- **Why it matters**: Most reliable indicator of actual coding capability in production environments
- **Look for**: "Overall Acc" or "Verified" column
- **Context**: This is THE benchmark that matters for coding work

### 🧠 ARC-AGI-2 - Most Important for Reasoning

- **URL**: https://arcprize.org/leaderboard#leaderboard-table
- **What it measures**: Abstract reasoning and generalization (contamination-resistant)
- **Why it matters**: Best indicator of true reasoning vs pattern matching
- **How to read**: Look for "ARC-AGI-2" column (not ARC-AGI-1)
- **Prioritize**: Entries where `System Type` == `CoT` (Chain of Thought)
- **Context**: Scores typically range from 5-55%. Higher is dramatically better.

---

## Trustworthy Data Sources (Always Verify These First!)

**PRIORITY ORDER:**

1. **LMArena** (lmarena.ai) - Real-time human preference votes, updated continuously
2. **LiveBench** (livebench.ai) - Continuously updated benchmark with 21 diverse tasks resistant to contamination
3. **SWE-Bench Verified** (swebench.com) - Gold standard for coding performance on real-world GitHub issues
4. **ARC-AGI-2** (arcprize.org) - Most important benchmark for abstract reasoning capability
5. **Provider Official Announcements** (OpenAI, Google, Anthropic, Meta) - Official press releases and technical reports

⚠️ **Warning:** Some models have history of data manipulation or outdated scores:

- **Llama 4 Maverick**: Benchmark manipulation controversy reported by The Verge (April 2025)
- Always cross-verify with multiple sources for models with suspicious data history

---

## Data Sources (Search These First!)

### Primary Benchmark Sources

| Benchmark                      | URL                                                                                          | What to Search                    |
| ------------------------------ | -------------------------------------------------------------------------------------------- | --------------------------------- |
| **LiveBench**                  | https://livebench.ai                                                                         | Overall Acc column                |
| **IFEval**                     | https://github.com/google-research/google-research/tree/master/instruction_following_eval    | Use Prompt-level strict accuracy  |
| **AIDER Polyglot**             | https://aider.chat/docs/leaderboards/                                                        | Overall accuracy across languages |
| **MMLU-Pro**                   | https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro                                           | Use Accuracy column               |
| **MMMU-Pro**                   | https://mmmu-benchmark.github.io                                                             | Overall Acc column                |
| **HLE** (Humanity's Last Exam) | https://scale.com/hle                                                                        | Overall accuracy column           |
| **FrontierMath**               | https://epoch.ai/benchmarks/frontiermath                                                     | Leaderboard tab                   |
| **ARC-AGI-2**                  | https://arcprize.org/leaderboard#leaderboard-table                                           | See ARC-AGI-2 instructions below  |
| **BFCL**                       | https://gorilla.cs.berkeley.edu/leaderboard.html                                             | Overall Acc column                |
| **TAU-Bench**                  | https://taubench.com/#leaderboard                                                            | "Pass^1" column                   |
| **OSWorld**                    | https://os-world.github.io                                                                   | "Success Rate (Avg±Std)" column   |
| **MATH-500**                   | Search "[model name] MATH-500"                                                               | Provider technical reports        |
| **MathVista**                  | https://mathvista.github.io                                                                  | Leaderboard                       |
| **MMMU**                       | https://mmmu-benchmark.github.io                                                             | Leaderboard                       |
| **MMMLU**                      | https://huggingface.co/datasets/openai/mmmlu (prefer web search since it is a complex table) | Papers, evaluations               |

### LMArena (Chatbot Arena) - Multiple Categories

> [!IMPORTANT]
> **Use the browser tool** (without lock controls) to navigate to each leaderboard URL below. After the page loads, click **"View all"** to display all models before extracting ELO scores. If you face a "Security Verification" just ignore this overlay our focus is the table inside div[data-sentry-component="LeaderboardDataTable"] get the html and outline the table.

| Benchmark ID           | Category              | URL                                                       |
| ---------------------- | --------------------- | --------------------------------------------------------- |
| `lmarena_coding_elo`   | Coding                | https://lmarena.ai/leaderboard/text/coding                |
| `lmarena_hard_elo`     | Hard Prompts          | https://lmarena.ai/leaderboard/text/hard-prompts          |
| `webdev_arena_elo`     | WebDev Arena          | https://lmarena.ai/leaderboard/webdev                     |
| `lmarena_creative_elo` | Creative Writing      | https://lmarena.ai/leaderboard/text/creative-writing      |
| `lmarena_if_elo`       | Instruction Following | https://lmarena.ai/leaderboard/text/instruction-following |
| `lmarena_math_elo`     | Math                  | https://lmarena.ai/leaderboard/text/math                  |
| `lmarena_vision_elo`   | Vision                | https://lmarena.ai/leaderboard/vision                     |
| `lmarena_en_elo`       | English (Overall)     | https://lmarena.ai/leaderboard/text/english               |
| `lmarena_zh_elo`       | Chinese               | https://lmarena.ai/leaderboard/text/chinese               |

### ARC-AGI-2 Scores

> [!IMPORTANT]
> **Use the browser tool** to collect ARC-AGI-2 scores:

1. Navigate to https://arcprize.org/leaderboard#leaderboard-table
2. Locate `div#leaderboard-table`
3. Use values from the **ARC-AGI-2** column (not ARC-AGI-1)
4. **Prioritize** entries where `System Type` == `CoT` (Chain of Thought)
5. Model names may include variants (thinking, context size, etc.) - match to the closest model in `showdown.json`

### Pricing & Performance

| Source                     | URL                             | Data                                 |
| -------------------------- | ------------------------------- | ------------------------------------ |
| **Artificial Analysis**    | https://artificialanalysis.ai   | Speed (TPS), Latency (TTFT), Pricing |
| **Provider Pricing Pages** | -                               | Official input/output token prices   |
| OpenAI                     | https://openai.com/api/pricing  |                                      |
| Anthropic                  | https://anthropic.com/pricing   |                                      |
| Google                     | https://ai.google.dev/pricing   |                                      |
| Together AI                | https://www.together.ai/pricing | (for open-source models)             |

---

## Model Schema

Each model in `data/showdown.json` must follow this structure:

```json
{
	"id": "model-id-lowercase-with-dashes",
	"name": "Model Display Name",
	"aka": ["alternative-name-1", "alternative-name-2"],
	"superior_of": "base-model-id",
	"provider": "Provider Name",
	"type": "proprietary",
	"release_date": "2025-01-15",
	"pricing": {
		"input_per_1m": 5.0,
		"output_per_1m": 15.0,
		"average_per_1m": 10.0
	},
	"performance": {
		"output_speed_tps": 100,
		"latency_ttft_ms": 500,
		"source": "https://artificialanalysis.ai"
	},
	"editor_notes": "Brief description of model strengths and positioning.",
	"benchmark_scores": {
		"swe_bench": 75.5,
		"terminal_bench": 45.0,
		"lmarena_coding_elo": 1350,
		"live_code_bench": 68.0,
		"aider_polyglot": 72.0,
		"gpqa_diamond": 80.0,
		"arc_agi_2": 5.0,
		"livebench": 65.0,
		"humanity_last_exam": 12.5,
		"lmarena_hard_elo": 1320,
		"bfcl": 78.0,
		"tau_bench": 55.0,
		"osworld": 40.0,
		"webdev_arena_elo": 1300,
		"lmarena_creative_elo": 1340,
		"lmarena_if_elo": 1380,
		"ifeval": 78.5,
		"math_500": 75.0,
		"aime": 65.0,
		"lmarena_math_elo": 1310,
		"frontiermath": 5.0,
		"mathvista": 60.0,
		"mmmu": 58.0,
		"mmmu_pro": 45.0,
		"lmarena_vision_elo": 1280,
		"mmlu_pro": 75.0,
		"mmmlu": 78.0,
		"lmarena_en_elo": 1350,
		"lmarena_zh_elo": 1290
	}
}
```

### Field Requirements

| Field                          | Required | Type        | Notes                                    |
| ------------------------------ | -------- | ----------- | ---------------------------------------- |
| `id`                           | Yes      | string      | Lowercase, dashes, unique                |
| `name`                         | Yes      | string      | Display name                             |
| `aka`                          | No       | string[]    | Alternative names for matching           |
| `superior_of`                  | No       | string      | ID of base model (for thinking variants) |
| `provider`                     | Yes      | string      | Anthropic, OpenAI, Google, Meta, etc.    |
| `type`                         | Yes      | string      | `"proprietary"` or `"open-source"`       |
| `release_date`                 | Yes      | string      | ISO date `YYYY-MM-DD`                    |
| `pricing.input_per_1m`         | Yes      | number      | USD per 1M input tokens                  |
| `pricing.output_per_1m`        | Yes      | number      | USD per 1M output tokens                 |
| `pricing.average_per_1m`       | Yes      | number      | `(input + output) / 2`                   |
| `performance.output_speed_tps` | Yes      | number      | Tokens per second                        |
| `performance.latency_ttft_ms`  | Yes      | number      | Time to first token (ms)                 |
| `performance.source`           | Yes      | string      | URL to source                            |
| `editor_notes`                 | Yes      | string      | 1-2 sentence description                 |
| `benchmark_scores.*`           | Partial  | number/null | Use `null` if unavailable                |

### Benchmark Score Ranges

| Benchmark             | Type | Valid Range | Notes             |
| --------------------- | ---- | ----------- | ----------------- |
| Percentage benchmarks | %    | 0-100       | Direct percentage |
| Elo benchmarks        | elo  | 1100-1550   | Higher is better  |

#### All Benchmark IDs

**Coding (25% weight):**

- `swe_bench` - SWE-Bench Verified (%)
- `terminal_bench` - Terminal-Bench (%)
- `lmarena_coding_elo` - LMArena Coding (Elo: 1100-1500)
- `live_code_bench` - LiveCodeBench (%)
- `aider_polyglot` - AIDER Polyglot (%)

**Reasoning (25% weight):**

- `gpqa_diamond` - GPQA Diamond (%)
- `arc_agi_2` - ARC-AGI-2 (%)
- `livebench` - LiveBench (%)
- `humanity_last_exam` - HLE (%)
- `lmarena_hard_elo` - LMArena Hard (Elo: 1100-1550)

**Agents & Tools (18% weight):**

- `bfcl` - Berkeley Function Calling (%)
- `tau_bench` - TAU-Bench (%)
- `osworld` - OSWorld (%)
- `webdev_arena_elo` - WebDev Arena (Elo: 1100-1450)

**Conversation (12% weight):**

- `lmarena_creative_elo` - LMArena Creative (Elo: 1100-1500)
- `lmarena_if_elo` - LMArena Instruction Following (Elo: 1100-1500)
- `ifeval` - IFEval (%)

**Math (10% weight):**

- `math_500` - MATH-500 (%)
- `aime` - AIME 2025 (%)
- `lmarena_math_elo` - LMArena Math (Elo: 1100-1500)
- `frontiermath` - FrontierMath (%)

**Multimodal (7% weight):**

- `mathvista` - MathVista (%)
- `mmmu` - MMMU (%)
- `mmmu_pro` - MMMU-Pro (%)
- `lmarena_vision_elo` - LMArena Vision (Elo: 1100-1450)

**Knowledge (3% weight):**

- `mmlu_pro` - MMLU-Pro (%)
- `mmmlu` - MMMLU (%)
- `lmarena_en_elo` - LMArena English (Elo: 1100-1500)
- `lmarena_zh_elo` - LMArena Chinese (Elo: 1100-1450)

---

## Imputed (Estimated) Values

### What Are Imputed Values?

**Issue #29** identified a fairness problem: models with missing benchmark scores were getting artificially inflated rankings compared to models with complete data. To address this, the system now **automatically estimates missing values** using a conservative methodology.

### How Imputation Works

When a benchmark score is missing (`null`):

1. **Find the category** the missing benchmark belongs to (e.g., Coding, Math)
2. **Calculate the average** of all OTHER benchmarks in that same category for that specific model
3. **Use that average** as an estimated value (normalized to 0-100 scale)
4. **Store metadata** tracking that this value was estimated, not real

**Example:** If Claude Opus 4.5 Thinking is missing AIDER Polyglot (Coding category):

- Other Coding scores: SWE-Bench (80.9), Terminal-Bench (59.3), LMArena Coding (87.4), LiveCodeBench (75.5)
- Average: (80.9 + 59.3 + 87.4 + 75.5) / 4 = **75.8**
- AIDER estimated as 75.8 (or equivalent Elo if applicable)

### Metadata Tracking

All imputed values are tracked in the `imputed_metadata` field:

```json
{
	"benchmark_scores": {
		"aider_polyglot": 75.8, // This was estimated
		"swe_bench": 80.9 // This is real data
	},
	"imputed_metadata": {
		"aider_polyglot": {
			"original_value": null,
			"imputed_value": 75.8,
			"method": "category_average",
			"imputed_date": "2025-12-26",
			"note": "Estimated from 4 other benchmarks in Coding category (avg: 75.80)"
		}
	}
}
```

### Visual Indicators

In the UI:

- **Asterisk (\*)** appears next to category scores with estimated values
- **Yellow highlighting** in tooltips shows which specific benchmarks were estimated
- **Hover text** explains the estimation method

### Important: Replace Estimated Values When Real Data Becomes Available

**⚠️ CRITICAL:** Imputed values are **temporary placeholders** only. When real benchmark data becomes available:

1. **Update** `benchmark_scores` with the actual value
2. **Remove** the entry from `imputed_metadata`
3. **Commit** with message: `"Update [model]: Replace estimated [benchmark] with real data"`

**Example:**

```json
// BEFORE (estimated):
{
  "benchmark_scores": { "aider_polyglot": 75.8 },
  "imputed_metadata": { "aider_polyglot": { ... } }
}

// AFTER (real data available):
{
  "benchmark_scores": { "aider_polyglot": 93.3 },
  "imputed_metadata": {}  // Removed!
}
```

### For AI Assistants

When updating model data:

1. **Check `imputed_metadata`** for any estimated values
2. **Search for real data** for those benchmarks
3. **Replace estimates** with real data when found
4. **Only add to `imputed_metadata`** if you're intentionally marking a value as estimated (rare - the system does this automatically)

---

## Model Name Matching (aka field)

### What is the `aka` Field?

Each model can have an `aka` (also known as) array containing alternative names used in benchmarks, papers, or announcements. This helps AI assistants correctly match benchmark data to the right model.

**Example:**

```json
{
  "id": "gpt-5.2",
  "name": "GPT 5.2",
  "aka": ["gpt-5.2-low", "gpt-5.2-low-effort", "gpt-5.2-medium", "gpt-5.2-medium-effort", "gpt-5-2"],
  ...
}
```

### How to Use aka for Matching

When searching for benchmark data:

1. **Direct Match**: Check if the model name matches `id`, `name`, or any value in `aka`
2. **Fuzzy Match**: For names not in `aka`, apply these transformations:
   - Remove version dates (e.g., `20251101` → ``)
   - Replace `-` with `.` and vice versa
   - Remove spaces and normalize case
   - Strip prefixes like "claude-", "gpt-", "gemini-"
   - Match partial names (e.g., `opus-4.5` matches `claude-opus-4-5`)

### Examples

| Search Term                | Matches Model ID                      |
| -------------------------- | ------------------------------------- |
| `Claude Opus 4.5`          | claude-opus-4-5-20251101              |
| `claude-opus-4-5-thinking` | claude-opus-4-5-20251101-thinking-32k |
| `gpt-5.2-low`              | gpt-5.2                               |
| `GPT-5.2 xhigh`            | gpt-5.2-pro                           |
| `Gemini 3 Flash`           | gemini-3-flash                        |

### Adding New aka Values

When you encounter a new alternative name for a model:

1. Add it to the `aka` array in `data/showdown.json`
2. Keep names lowercase with dashes
3. Include common variations:
   - With/without version numbers
   - With/without thinking/reasoning suffix
   - Official API names vs marketing names

---

## Superior Model Relationships (superior_of field)

### What is the `superior_of` Field?

The `superior_of` field indicates that a model is an enhanced version of another (base) model. This is used for "thinking" or "reasoning" variants that are expected to perform better than their base versions.

**Example:**

```json
{
  "id": "claude-opus-4-5-20251101-thinking-32k",
  "name": "Claude Opus 4.5 Thinking",
  "superior_of": "claude-opus-4-5-20251101",
  ...
}
```

### How Superior Imputation Works

When a superior model has missing benchmark values and its base model has real data:

1. **Calculate superiority ratio**: Average of (superior_score / base_score) across all benchmarks where BOTH have real values
2. **Apply ratio**: Missing value = base_value × superiority_ratio
3. **Limit**: Ratio is clamped between 1.02 (2%) and 1.20 (20%)
4. **Cap**: Result is capped at 100% for percentage benchmarks

**Example:**

```
Claude Opus 4.5:          gpqa=80.7, aime=48.1
Claude Opus 4.5 Thinking: gpqa=86.0, aime=86.1, ifeval=NULL

Superiority ratios:
- gpqa: 86.0/80.7 = 1.066 (6.6%)
- aime: 86.1/48.1 = 1.79 (capped at 1.20)

Average ratio: 1.133 (capped at 1.20)

If Opus 4.5 has ifeval=88.5:
→ Thinking ifeval = 88.5 × 1.20 = 100 (capped at 100%)
```

### Confidence Levels

Each imputed value includes a confidence indicator based on how many benchmarks were used:

| Benchmarks Used | Confidence | Icon | Meaning                                   |
| --------------- | ---------- | ---- | ----------------------------------------- |
| 0-2             | Low        | ⚠    | Few data points, less reliable estimate   |
| 3-5             | Medium     | ◐    | Moderate data points, reasonable estimate |
| 6+              | High       | ✓    | Many data points, reliable estimate       |

### Visual Indicators

In the UI, imputed values are shown with:

- **Green asterisk (\*)** next to the score (superior_of method)
- **Amber asterisk (\*)** for category_average method
- **Confidence icon** (⚠/◐/✓) after the asterisk
- **Green/amber highlighting** in tooltips
- **Distinct notice** explaining the estimation method

### Models with superior_of Relationships

| Superior Model                          | Base Model (superior_of)   |
| --------------------------------------- | -------------------------- |
| claude-opus-4-5-20251101-thinking-32k   | claude-opus-4-5-20251101   |
| claude-sonnet-4-5-20250929-thinking-32k | claude-sonnet-4-5-20250929 |
| gpt-5.1-high                            | gpt-5.1                    |
| gpt-5.2-thinking                        | gpt-5.2                    |
| gpt-5.2-pro                             | gpt-5.2-thinking           |
| gemini-3-flash-thinking                 | gemini-3-flash             |
| grok-4.1-thinking                       | grok-4.1                   |
| kimi-k2-thinking-turbo                  | kimi-k2-0905-preview       |

---

## Step-by-Step Update Process

### Adding a New Model

1. **Research Phase** - Search each benchmark source:

   ```
   Web search: "[Model Name] SWE-Bench"
   Web search: "[Model Name] benchmark results"
   Web search: "[Model Name] GPQA"
   Visit: https://lmarena.ai/leaderboard (find model)
   Visit: https://artificialanalysis.ai (find model)
   Visit: Provider pricing page
   ```

2. **Collect Data** - Create a checklist:

   ```
   [ ] SWE-Bench Verified score
   [ ] Terminal-Bench score
   [ ] LMArena Coding Elo
   [ ] LiveCodeBench score
   [ ] GPQA Diamond score
   [ ] AIME 2025 score
   [ ] ARC-AGI-2 score
   [ ] LMArena Hard Prompts Elo
   [ ] BFCL score
   [ ] TAU-Bench score
   [ ] OSWorld score
   [ ] WebDev Arena Elo
   [ ] LMArena Creative Writing Elo
   [ ] Instruction Following score
   [ ] MATH-500 score
   [ ] GSM8K score
   [ ] LMArena Math Elo
   [ ] MathVista score
   [ ] MMMU score
   [ ] LMArena Vision Elo
   [ ] MMLU score
   [ ] MMMLU score
   [ ] LMArena English Elo
   [ ] LMArena Chinese Elo
   [ ] Input price per 1M tokens
   [ ] Output price per 1M tokens
   [ ] Speed (tokens/second)
   [ ] Latency (TTFT ms)
   [ ] Release date
   ```

3. **Handle Missing Data:**
   - Use `null` for unavailable benchmarks
   - The ranking engine automatically renormalizes weights
   - At minimum, try to get: SWE-Bench, GPQA, LMArena Elo, pricing

4. **Add to JSON:**
   - Open `data/showdown.json`
   - Add model object to `models` array
   - Maintain alphabetical order by provider, then by capability tier

5. **Update Meta:**
   ```json
   "meta": {
     "version": "2025.MM.DD",
     "last_update": "2025-MM-DDTHH:00:00Z",
     "schema_version": "1.0"
   }
   ```
   ⚠️ **Critical:** Always update both `version` and `last_update` timestamp when modifying model data to show data freshness.

### Updating an Existing Model

1. Search for the model by `id` in the JSON
2. Update only the changed fields
3. Update `meta.last_update` timestamp

---

## Validation

### Local Validation (Gatekeeper)

Run **BEFORE** committing - this is your final gatekeeper:

```bash
# Full validation suite (recommended) - MUST RUN
./precommit.sh

# Alternative: run each check individually
npm run lint && npm run check && npm run build

# Quick JSON syntax check
node -e "require('./data/showdown.json')"
```

⚠️ **CRITICAL:** If `./precommit.sh` fails:

- DO NOT commit
- DO NOT push
- FIX all errors first
- Run `./precommit.sh` again
- Only proceed when ALL checks pass ✓

### CI Pipeline Validation

The GitHub Actions workflow validates:

1. **Lint** - Code formatting
2. **Type Check** - TypeScript types
3. **Build** - SSG compilation
4. **JSON Validation:**
   - All models have required fields (id, name, provider, benchmark_scores)
   - Category weights sum to 1.0
   - All benchmark IDs in models exist in categories definition

### Common Validation Errors

| Error                              | Cause                         | Fix                            |
| ---------------------------------- | ----------------------------- | ------------------------------ |
| `Unknown benchmark X in model Y`   | Typo in benchmark ID          | Check benchmark ID spelling    |
| `Model missing required fields`    | Missing id/name/provider      | Add required fields            |
| `JSON parse error`                 | Syntax error                  | Check commas, quotes, brackets |
| `Category weights do not sum to 1` | Don't modify category weights | Leave categories unchanged     |

---

## Example: Adding a New Model

Let's say OpenAI releases "GPT-5.2 High". Here's the process:

### 1. Search for Data

```
Search: "GPT-5.2 High SWE-Bench"
Search: "GPT-5.2 High benchmark"
Search: "GPT-5.2 High pricing"
Visit: https://lmarena.ai/leaderboard
Visit: https://artificialanalysis.ai
Visit: https://openai.com/api/pricing
```

### 2. Create Entry

```json
{
	"id": "gpt-5-2-high",
	"name": "GPT-5.2 High",
	"provider": "OpenAI",
	"type": "proprietary",
	"release_date": "2025-12-15",
	"pricing": {
		"input_per_1m": 10.0,
		"output_per_1m": 30.0,
		"average_per_1m": 20.0
	},
	"performance": {
		"output_speed_tps": 85,
		"latency_ttft_ms": 800,
		"source": "https://artificialanalysis.ai"
	},
	"editor_notes": "OpenAI's latest flagship model with enhanced reasoning capabilities.",
	"benchmark_scores": {
		"swe_bench": 78.5,
		"terminal_bench": null,
		"lmarena_coding_elo": 1375,
		"live_code_bench": 70.0,
		"gpqa_diamond": 82.0,
		"aime": 70.0,
		"arc_agi_2": null,
		"lmarena_hard_elo": 1390,
		"bfcl": 85.0,
		"tau_bench": null,
		"osworld": null,
		"webdev_arena_elo": 1340,
		"lmarena_creative_elo": 1365,
		"lmarena_if_elo": 1395,
		"math_500": 80.0,
		"gsm8k": 95.0,
		"lmarena_math_elo": 1345,
		"mathvista": 65.0,
		"mmmu": 62.0,
		"lmarena_vision_elo": 1310,
		"mmlu": 88.0,
		"mmmlu": 80.0,
		"lmarena_en_elo": 1380,
		"lmarena_zh_elo": 1320
	}
}
```

### 3. Validate & Commit

```bash
# Create feature branch if on main
git checkout -b feature/add-gpt-5-2-high

# Validate changes
./precommit.sh

# Commit and push
git add data/showdown.json
git commit -m "Add GPT-5.2 High model

Sources verified:
- LMArena leaderboard (lmarena.ai)
- OpenAI official announcement
- SWE-Bench verified scores (swebench.com)
- ARC-AGI-2 leaderboard (arcprize.org)"
git push -u origin feature/add-gpt-5-2-high

# Create PR using gh CLI (if available)
gh pr create \
  --title "Add GPT-5.2 High model" \
  --body "Update data/showdown.json with GPT-5.2 High model and latest benchmark scores

## Sources Verified
- LMArena leaderboard (lmarena.ai)
- OpenAI official announcement
- SWE-Bench verified scores (swebench.com)
- ARC-AGI-2 leaderboard (arcprize.org)"
```

---

## Provider Reference

| Provider  | Type        | Models Pattern     |
| --------- | ----------- | ------------------ |
| Anthropic | proprietary | claude-\*          |
| OpenAI    | proprietary | gpt-_, o1-_, o3-\* |
| Google    | proprietary | gemini-\*          |
| xAI       | proprietary | grok-\*            |
| Meta      | open-source | llama-\*           |
| Alibaba   | open-source | qwen-\*            |
| DeepSeek  | open-source | deepseek-\*        |

---

## Notes for AI Assistants

When updating data:

1. **Always search multiple sources** - Don't rely on cached knowledge
2. **Use `null` for missing data** - Never guess benchmark scores
3. **Verify Elo scores are current** - LMArena updates frequently
4. **Check pricing is current** - Providers often adjust prices
5. **Validate before committing** - Run `./precommit.sh` (serves as final gatekeeper)
6. **Update the meta timestamp** - Shows data freshness
7. **Use Web Search frequently** - Find current benchmark scores and announcements
8. **Use r.jina.ai proxy for links** - Prefix URLs with `https://r.jina.ai/` before fetching
9. **Create feature branches** - Never commit directly to main branch
10. **Create PRs using gh CLI** - Use `gh pr create` when available
11. **Gemini 3 Flash Thinking Fallback** - If benchmark scores are missing for `gemini-3-flash-thinking`, use the values from `gemini-3-flash` (which represents the baseline "minimal thinking" score).
12. **Update meta.version and meta.last_update** whenever making data changes

If a benchmark score cannot be found after thorough searching, use `null` and note it in the commit message.
