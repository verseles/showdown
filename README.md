# Showdown.Best - LLM Comparison Platform

[![Validate PR](https://github.com/showdown-best/showdown/actions/workflows/validate.yml/badge.svg)](https://github.com/showdown-best/showdown/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Svelte](https://img.shields.io/badge/Svelte-FF3E00?logo=svelte&logoColor=white)](https://svelte.dev/)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?logo=svelte&logoColor=white)](https://kit.svelte.dev/)

Showdown.Best is a comprehensive, production-grade platform for comparing top AI language models (LLMs) across multiple benchmarks including coding, reasoning, math, and more. Built with Svelte 5 and SvelteKit with full internationalization support.

## ✨ Features

### 📊 Comprehensive Comparison
- **12+ Flagship Models**: Compare Claude Opus 4.5, Sonnet 4.5, GPT-4.1/4o, Gemini 3/2.5 Pro, DeepSeek V3/R1, Llama 4.1 405B/70B, Qwen 3 72B, and more
- **7 Performance Categories**: Coding, Reasoning, Agents, Conversation, Math, Multimodal, Multilingual
- **Real Benchmark Data**: SWE-Bench, GPQA, LMArena, BFCL, and other standardized benchmarks
- **Weighted Scoring**: Category-based scoring with customizable weights
- **Overall Rankings**: Elo-based normalization for fair comparisons

### 🎯 Interactive Features
- **Sortable Columns**: Click any column header to sort models
- **Advanced Filtering**: Filter by provider, type, price range, speed, and favorites
- **Column Visibility**: Show/hide columns based on your preferences
- **Favorites System**: Mark models as favorites for quick access
- **Interactive Tooltips**: Hover over models, categories, and scores for detailed information
- **Mobile Responsive**: Fully optimized for desktop, tablet, and mobile devices

### 🌐 Internationalization
- **10 Languages**: English, Spanish, French, German, Chinese, Japanese, Korean, Arabic, Portuguese, Russian
- **RTL Support**: Full right-to-left language support for Arabic
- **Dynamic Loading**: Translation files load on-demand
- **Persistent Language**: Remembers your language preference

### 🎨 User Experience
- **Dark Mode**: System preference detection with manual toggle
- **Performance Optimized**: Virtual scrolling, debounced filters, memoized calculations
- **Accessible**: WCAG 2.1 AA compliant with proper ARIA labels
- **Fast Loading**: Static site generation (SSG) for optimal performance

### ✏️ Data Management
- **Built-in Editor**: Visual interface for editing model data
- **Models Editor**: Add, edit, or delete models with comprehensive forms
- **Categories Editor**: Adjust category weights and manage benchmarks
- **Git Integration**: Commit and push changes directly from the UI
- **Validation**: Data validation with error handling

### 🔧 Developer Friendly
- **TypeScript**: Full type safety throughout the application
- **Testing**: Unit tests with Vitest and Playwright
- **Linting**: ESLint and Prettier configuration
- **GitHub Actions**: Automated CI/CD pipeline
- **Conventional Commits**: Standardized commit messages

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/showdown-best/showdown.git
   cd showdown
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
# Build the project
npm run build

# Preview the production build
npm run preview
```

## 📁 Project Structure

```
showdown/
├── data/
│   └── showdown.json              # Model and benchmark data
├── src/
│   ├── lib/
│   │   ├── components/            # Reusable Svelte components
│   │   │   ├── ModelCard.svelte
│   │   │   ├── Filters.svelte
│   │   │   ├── ColumnSettings.svelte
│   │   │   ├── LanguageSelector.svelte
│   │   │   ├── ThemeToggle.svelte
│   │   │   ├── ModelsEditor.svelte
│   │   │   ├── CategoriesEditor.svelte
│   │   │   ├── GitIntegration.svelte
│   │   │   └── VirtualScroller.svelte
│   │   ├── i18n/                  # Internationalization
│   │   │   ├── locales/           # Translation files
│   │   │   ├── store.ts           # Language state management
│   │   │   └── index.ts           # Translation utilities
│   │   ├── stores/                # Svelte stores
│   │   │   ├── theme.ts           # Theme management
│   │   │   └── favorites.ts       # Favorites management
│   │   ├── utils/                 # Utility functions
│   │   │   ├── debounce.ts        # Debounce/throttle utilities
│   │   │   └── memoize.ts         # Memoization utilities
│   │   └── ranking.js             # Ranking calculation engine
│   ├── routes/
│   │   ├── +page.svelte           # Main comparison page
│   │   ├── +page.ts               # Data loading
│   │   ├── +layout.svelte         # Root layout
│   │   ├── editor/                # Data editor
│   │   ├── sitemap.xml/           # SEO sitemap
│   │   └── robots.txt/            # Search engine directives
│   └── app.html                   # HTML template
├── static/                        # Static assets
├── .github/
│   └── workflows/
│       └── validate.yml           # CI/CD pipeline
├── tests/
│   └── ranking.test.js            # Unit tests
├── package.json
├── svelte.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run check            # Type checking
npm run lint             # Lint code
npm run format           # Format code

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
```

### Technology Stack

- **Framework**: [Svelte 5](https://svelte.dev/) with [SvelteKit](https://kit.svelte.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: Native CSS with CSS custom properties
- **Testing**: [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Deployment**: Static site generation with [@sveltejs/adapter-static](https://github.com/sveltejs/kit/tree/main/packages/adapter-static)

### Data Schema

Models are defined in `data/showdown.json` with the following structure:

```typescript
interface Model {
  id: string;
  name: string;
  provider: string;
  type: 'open-source' | 'proprietary';
  release_date: string;
  pricing: {
    input_per_1m: number;
    output_per_1m: number;
    average_per_1m: number;
  };
  performance: {
    output_speed_tps: number;
    latency_ttft_ms: number;
  };
  category_scores: {
    [categoryId: string]: number; // 0-100 percentage
  };
  benchmark_scores: {
    [benchmarkId: string]: number; // Raw benchmark score
  };
  overall_score?: number; // Calculated weighted average
  rank?: number; // Calculated rank
  editor_notes?: string; // Internal notes
}
```

### Adding New Models

1. Edit `data/showdown.json`
2. Add your model with all required fields
3. Update `src/lib/ranking.js` if needed for new benchmarks
4. Test your changes: `npm run test && npm run build`
5. Commit using conventional commit format: `git commit -m "feat: add new model XYZ"`

## 🌍 Internationalization

### Adding a New Language

1. Create a new file in `src/lib/i18n/locales/` (e.g., `it.ts`)
2. Copy the structure from `en.ts` and translate all strings
3. Add the language to `SUPPORTED_LANGUAGES` in `src/lib/i18n/store.ts`
4. Update the language selector component if needed

### Translation Keys

Common translation keys:
- Navigation and UI elements
- Model categories and descriptions
- Filter options
- Error messages
- Loading states

## 🎨 Customization

### Theming

The application uses CSS custom properties for theming. You can customize colors by modifying the CSS variables in `src/routes/+page.svelte`:

```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #212529;
  --primary-color: #1971c2;
  /* ... more variables */
}

.dark {
  --bg-primary: #1a1a1a;
  --text-primary: #ffffff;
  --primary-color: #4dabf7;
  /* ... dark mode variables */
}
```

### Adding New Categories

1. Add the category to `data/showdown.json` under the `categories` array
2. Update the `columns` array in `src/routes/+page.svelte`
3. Add translations for the category name and description
4. Recalculate rankings if needed

## 🚢 Deployment

### Static Site Hosting

Showdown.Best is a static site and can be deployed to any static hosting service:

- **Netlify**: Connect your GitHub repo for automatic deployments
- **Vercel**: Zero-config deployment with GitHub integration
- **GitHub Pages**: Free hosting for public repositories
- **Cloudflare Pages**: Fast global CDN
- **AWS S3 + CloudFront**: Scalable AWS solution

### Build Command
```bash
npm run build
```

### Output Directory
```
build/
```

### Environment Variables

No environment variables are required for the basic application. The site is fully static and works out of the box.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Check types: `npm run check`
6. Build the project: `npm run build`
7. Commit your changes: `git commit -m "feat: add amazing feature"`
8. Push to the branch: `git push origin feature/amazing-feature`
9. Open a Pull Request

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` A new feature
- `fix:` A bug fix
- `perf:` A performance improvement
- `refactor:` Code refactoring
- `docs:` Documentation changes
- `test:` Adding or updating tests
- `build:` Build system changes
- `ci:` CI/CD changes
- `chore:` Other changes

### Pull Request Process

1. Ensure all tests pass and the build succeeds
2. Update documentation if needed
3. Add tests for new features
4. Request review from maintainers
5. Address feedback and iterate

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Benchmark Sources**: SWE-Bench, GPQA, LMArena, BFCL
- **Model Providers**: Anthropic, OpenAI, Google, DeepSeek, Meta, Alibaba
- **Svelte Team**: For the amazing Svelte framework
- **SvelteKit Team**: For the powerful meta-framework
- **Contributors**: All developers who have contributed to this project

## 📊 Performance

### Lighthouse Scores

- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 95+
- **SEO**: 100

### Bundle Size

- Initial JS: ~250KB gzipped
- CSS: ~30KB gzipped
- Total: <300KB for complete application

## 🐛 Known Issues

- None at this time. Please [report issues](https://github.com/showdown-best/showdown/issues) if you find any.

## 📅 Roadmap

- [ ] Add more models and benchmarks
- [ ] Implement model comparison charts
- [ ] Add benchmark result history/timeline
- [ ] Create API for third-party integrations
- [ ] Add model pricing calculator
- [ ] Implement advanced search functionality

## 📞 Support

- **GitHub Issues**: [Report bugs and request features](https://github.com/showdown-best/showdown/issues)
- **Discussions**: [Join the community](https://github.com/showdown-best/showdown/discussions)
- **Security**: See [SECURITY.md](SECURITY.md) for vulnerability reporting

## ⭐ Show Your Support

If you find this project helpful:

- ⭐ Star the repository
- 🐛 Report bugs and issues
- 💡 Suggest new features
- 🤝 Contribute to the codebase
- 📢 Share with others

---

**Built with ❤️ by the Showdown.Best team**
