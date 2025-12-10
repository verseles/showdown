# Data Update Guide

This document provides detailed instructions for updating `data/showdown.json` with new models or updated benchmark scores.

## Quick Reference for AI Assistants

When asked to update data (e.g., "Add GPT-5.2 to the rankings"), follow this process:

1. **Search for official benchmark data** using the sources listed below
2. **Collect all available scores** from each benchmark source
3. **Get pricing and performance metrics** from provider pages and Artificial Analysis
4. **Create/update the model entry** following the schema
5. **Validate locally** with `npm run build`
6. **Commit and push**

---

## Data Sources (Search These First!)

### Primary Benchmark Sources

| Benchmark              | URL                                                                                              | What to Search                          |
| ---------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------- |
| **SWE-Bench Verified** | https://swebench.com                                                                             | Leaderboard, look for "verified" scores |
| **Terminal-Bench**     | https://www.tbench.ai/leaderboard/terminal-bench/2.0                                             | Check the Accuracy column               |
| **LiveCodeBench**      | https://gso-bench.github.io/leaderboard.html or if not found Search "LiveCodeBench [model name]" | Look for the Opt@1 Score column         |
| **GPQA Diamond**       | Search "GPQA Diamond [model name]"                                                               | Papers, announcements                   |
| **AIME 2024**          | Search "AIME 2024 [model name]"                                                                  | Provider announcements                  |
| **ARC-AGI-2**          | https://arcprize.org/leaderboard#leaderboard-table                                               | See ARC-AGI-2 instructions below        |
| **BFCL**               | https://gorilla.cs.berkeley.edu/leaderboard.html                                                 | Overall Acc column                      |
| **TAU-Bench**          | https://taubench.com/#leaderboard                                                                | "Pass^1" column                         |
| **OSWorld**            | https://os-world.github.io                                                                       | "Success Rate (Avg±Std)" column         |
| **MATH-500**           | Search "[model name] MATH-500"                                                                   | Provider technical reports              |
| **GSM8K**              | Search "[model name] GSM8K"                                                                      | Provider technical reports              |
| **MathVista**          | https://mathvista.github.io                                                                      | Leaderboard                             |
| **MMMU**               | https://mmmu-benchmark.github.io                                                                 | Leaderboard                             |
| **MMLU**               | Search "[model name] MMLU"                                                                       | Provider technical reports              |
| **MMMLU**              | https://huggingface.co/datasets/openai/mmmlu (prefer web search since it is a complex table)     | Papers, evaluations                     |

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
		"gpqa_diamond": 80.0,
		"aime_2024": 65.0,
		"arc_agi_2": 5.0,
		"lmarena_hard_elo": 1320,
		"bfcl": 78.0,
		"tau_bench": 55.0,
		"osworld": 40.0,
		"webdev_arena_elo": 1300,
		"lmarena_creative_elo": 1340,
		"lmarena_if_elo": 1380,
		"math_500": 75.0,
		"gsm8k": 92.0,
		"lmarena_math_elo": 1310,
		"mathvista": 60.0,
		"mmmu": 58.0,
		"lmarena_vision_elo": 1280,
		"mmlu": 85.0,
		"mmmlu": 78.0,
		"lmarena_en_elo": 1350,
		"lmarena_zh_elo": 1290
	}
}
```

### Field Requirements

| Field                          | Required | Type        | Notes                                 |
| ------------------------------ | -------- | ----------- | ------------------------------------- |
| `id`                           | Yes      | string      | Lowercase, dashes, unique             |
| `name`                         | Yes      | string      | Display name                          |
| `provider`                     | Yes      | string      | Anthropic, OpenAI, Google, Meta, etc. |
| `type`                         | Yes      | string      | `"proprietary"` or `"open-source"`    |
| `release_date`                 | Yes      | string      | ISO date `YYYY-MM-DD`                 |
| `pricing.input_per_1m`         | Yes      | number      | USD per 1M input tokens               |
| `pricing.output_per_1m`        | Yes      | number      | USD per 1M output tokens              |
| `pricing.average_per_1m`       | Yes      | number      | `(input + output) / 2`                |
| `performance.output_speed_tps` | Yes      | number      | Tokens per second                     |
| `performance.latency_ttft_ms`  | Yes      | number      | Time to first token (ms)              |
| `performance.source`           | Yes      | string      | URL to source                         |
| `editor_notes`                 | Yes      | string      | 1-2 sentence description              |
| `benchmark_scores.*`           | Partial  | number/null | Use `null` if unavailable             |

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

**Reasoning (25% weight):**

- `gpqa_diamond` - GPQA Diamond (%)
- `aime_2024` - AIME 2024 (%)
- `arc_agi_2` - ARC-AGI-2 (%)
- `lmarena_hard_elo` - LMArena Hard (Elo: 1100-1550)

**Agents & Tools (18% weight):**

- `bfcl` - Berkeley Function Calling (%)
- `tau_bench` - TAU-Bench (%)
- `osworld` - OSWorld (%)
- `webdev_arena_elo` - WebDev Arena (Elo: 1100-1450)

**Conversation (12% weight):**

- `lmarena_creative_elo` - LMArena Creative (Elo: 1100-1500)
- `lmarena_if_elo` - LMArena Instruction Following (Elo: 1100-1500)

**Math (10% weight):**

- `math_500` - MATH-500 (%)
- `gsm8k` - GSM8K (%)
- `lmarena_math_elo` - LMArena Math (Elo: 1100-1500)

**Multimodal (7% weight):**

- `mathvista` - MathVista (%)
- `mmmu` - MMMU (%)
- `lmarena_vision_elo` - LMArena Vision (Elo: 1100-1450)

**Multilingual (3% weight):**

- `mmlu` - MMLU (%)
- `mmmlu` - MMMLU (%)
- `lmarena_en_elo` - LMArena English (Elo: 1100-1500)
- `lmarena_zh_elo` - LMArena Chinese (Elo: 1100-1450)

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
   [ ] AIME 2024 score
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

### Updating an Existing Model

1. Search for the model by `id` in the JSON
2. Update only the changed fields
3. Update `meta.last_update` timestamp

---

## Validation

### Local Validation

Run before committing:

```bash
# Full validation suite
npm run lint && npm run check && npm run build

# Quick JSON syntax check
node -e "require('./data/showdown.json')"
```

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
		"aime_2024": 70.0,
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
npm run build
git add data/showdown.json
git commit -m "Add GPT-5.2 High model"
git push
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
5. **Validate before committing** - Run `npm run build`
6. **Update the meta timestamp** - Shows data freshness

If a benchmark score cannot be found after thorough searching, use `null` and note it in the commit message.
