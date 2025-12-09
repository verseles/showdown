# Showdown

**Comprehensive LLM Rankings & Comparison**

https://showdown.best

Compare the best AI language models across coding, reasoning, agents, math, multimodal, multilingual, and conversational ability. Transparent rankings aggregating 20+ industry-standard benchmarks.

## Mission

Provide a single, trustworthy source for comparing AI language models across practical categories. Community-maintained through open data (JSON) and GitHub PRs.

## Architecture

- **Frontend:** Svelte 5 + SvelteKit (SSG)
- **Data:** Single JSON file (`data/showdown.json`)
- **Hosting:** Cloudflare Pages
- **Updates:** Community PRs + automated validation

## Rankings Methodology

Scores aggregate 20+ industry-standard benchmarks organized into 7 categories:

| Category | Weight | Benchmarks |
|----------|--------|------------|
| Coding | 25% | SWE-Bench Verified, Terminal-Bench, LMArena Coding, LiveCodeBench |
| Reasoning | 25% | GPQA Diamond, AIME 2024, ARC-AGI, LMArena Hard Prompts |
| Agents & Tools | 18% | BFCL, TAU-Bench, OSWorld, WebDev Arena |
| Conversation | 12% | LMArena Creative Writing, Instruction Following |
| Math | 10% | MATH-500, GSM8K, LMArena Math |
| Multimodal | 7% | MathVista, MMMU, LMArena Vision |
| Multilingual | 3% | MMLU, MMMLU, LMArena English/Chinese |

### Scoring Logic

- **Percentage benchmarks:** Used directly (0-100%)
- **Elo benchmarks:** Normalized to 0-100 scale using min/max ranges
- **Missing data:** Weights renormalized for present benchmarks only
- **Overall score:** Weighted average of category scores

## Features

- **Sortable Rankings Table:** Click any column header to sort
- **Category Tooltips:** Hover for benchmark breakdowns with source links
- **Filters:** Provider, type (proprietary/open-source), favorites
- **Column Visibility:** Toggle columns to customize your view
- **Favorites:** Star models to track them (persisted to localStorage)
- **Mobile Responsive:** Card view for smaller screens
- **Dark Mode:** Toggle light/dark theme
- **Static Site:** Fast loading, works without JavaScript

## Contributing

### Report Outdated Score

[Open an issue](https://github.com/verseles/showdown/issues/new?template=update-score.yml) with:
- Model name
- Benchmark name
- Correct value
- Source URL

### Request New Model

[Open an issue](https://github.com/verseles/showdown/issues/new?template=add-model.yml) with:
- Model name and provider
- Available benchmark scores with sources
- Pricing and performance metrics

### Submit a PR

1. Fork the repository
2. Edit `data/showdown.json`
3. Ensure JSON is valid and scores are within expected ranges
4. Submit PR - automated validation will run
5. Maintainer reviews and merges

### Data Schema

```json
{
  "id": "model-id",
  "name": "Model Name",
  "provider": "Provider",
  "type": "proprietary",
  "release_date": "2025-01-01",
  "pricing": {
    "input_per_1m": 1.00,
    "output_per_1m": 5.00,
    "average_per_1m": 3.00
  },
  "performance": {
    "output_speed_tps": 100,
    "latency_ttft_ms": 500,
    "source": "https://artificialanalysis.ai"
  },
  "editor_notes": "Brief description of strengths and weaknesses",
  "benchmark_scores": {
    "swe_bench": 75.5,
    "gpqa_diamond": 85.0
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type check
npm run check

# Lint
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## Data Sources

- [SWE-Bench](https://swebench.com) - Real-world GitHub issue resolution
- [GPQA Diamond](https://github.com/idavidrein/gpqa) - PhD-level science questions
- [BFCL](https://gorilla.cs.berkeley.edu/leaderboard.html) - Function calling accuracy
- [LMArena](https://lmarena.ai/leaderboard) - Human preference rankings
- [Artificial Analysis](https://artificialanalysis.ai) - Speed and latency metrics

## License

AGPL-3.0 - See [LICENSE](LICENSE)

## Acknowledgments

Built with [Svelte 5](https://svelte.dev) and [SvelteKit](https://kit.svelte.dev). Deployed on [Cloudflare Pages](https://pages.cloudflare.com).

Data aggregated from public benchmark sources. Community contributions welcome.
