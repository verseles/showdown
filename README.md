# Showdown

> **Which AI model is actually the best?** We aggregate 20+ benchmarks so you don't have to.

[![Live Site](https://img.shields.io/badge/Live-showdown.best-blue)](https://showdown.best)
[![License](https://img.shields.io/badge/License-AGPL--3.0-green)](LICENSE)

## What is Showdown?

Tired of cherry-picked benchmarks and marketing hype? **Showdown** provides transparent, community-maintained rankings of AI language models across real-world categories:

- **Coding** - Can it actually write working code?
- **Reasoning** - PhD-level science, complex logic
- **Agents & Tools** - Function calling, browser automation
- **Math** - From algebra to competition problems
- **Multimodal** - Vision understanding
- **Multilingual** - Beyond English
- **Conversation** - Creative writing, instruction following

All data is open. All methodology is transparent. All contributions are welcome.

## Quick Start

Visit **[showdown.best](https://showdown.best)** to explore the rankings.

Want to run it locally?

```bash
git clone https://github.com/verseles/showdown.git
cd showdown
npm install
npm run dev
```

## How Rankings Work

We aggregate scores from 20+ industry benchmarks, weighted by practical importance:

| Category       | Weight | What it measures                                 |
| -------------- | ------ | ------------------------------------------------ |
| Coding         | 25%    | Real GitHub issues, live coding challenges       |
| Reasoning      | 25%    | PhD science questions, novel problem solving     |
| Agents & Tools | 18%    | API usage, multi-step tasks, browser automation  |
| Conversation   | 12%    | Creative writing, following complex instructions |
| Math           | 10%    | Competition math, word problems                  |
| Multimodal     | 7%     | Understanding images, charts, diagrams           |
| Multilingual   | 3%     | Performance across languages                     |

**Scoring:**

- Percentage benchmarks used directly
- Elo scores normalized to 0-100
- Missing data? We **estimate** using category averages (marked with \* in UI)
- Final score = weighted average across categories

> **Note:** To ensure fair comparisons, missing benchmark scores are automatically estimated using the average of other benchmarks in the same category for that model. Estimated values are clearly marked with an asterisk (\*) and should be replaced with real data when available. See [UPDATE.md](UPDATE.md#imputed-estimated-values) for details.

## Contributing

### Found an outdated score?

[Open an issue](https://github.com/verseles/showdown/issues/new?template=update-score.yml) with the correct value and source.

### Want to add a model?

[Open an issue](https://github.com/verseles/showdown/issues/new?template=add-model.yml) with available benchmark scores.

### Ready to submit a PR?

1. Fork this repo
2. Edit `data/showdown.json`
3. Run `./precommit.sh` to validate your changes
4. Submit PR - our CI validates the data automatically
5. Get merged!

## Tech Stack

- **Frontend:** Svelte 5 + SvelteKit (static site generation)
- **Data:** Single JSON file - easy to edit, easy to validate
- **Hosting:** Cloudflare Pages - fast worldwide
- **CI/CD:** GitHub Actions - automated validation on every PR

## Data Sources

Rankings aggregate data from trusted sources:

- [SWE-Bench](https://swebench.com) - Real GitHub issue resolution
- [GPQA](https://github.com/idavidrein/gpqa) - PhD-level questions
- [BFCL](https://gorilla.cs.berkeley.edu/leaderboard.html) - Function calling
- [LMArena](https://lmarena.ai/leaderboard) - Human preferences
- [Artificial Analysis](https://artificialanalysis.ai) - Speed metrics

## License

AGPL-3.0 - Keep it open!

---

**Built with [Svelte](https://svelte.dev). Hosted on [Cloudflare](https://pages.cloudflare.com). Made for the community.**
