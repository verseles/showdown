# Roadmap

This document tracks the development progress of Showdown. Features are organized by phase, not timeline.

## Phase 1: Foundation

- [x] Data architecture with JSON schema for models and categories
- [x] TypeScript type definitions
- [x] Ranking calculation engine with Elo normalization
- [x] Weighted average scoring across categories
- [x] Missing data handling with weight renormalization
- [x] Unit tests for ranking calculations

## Phase 2: Core UI

- [x] Sortable rankings table with all columns
- [x] Click-to-sort on any column header
- [x] Rank display with overall score
- [x] Category score columns with emoji headers
- [x] Price, speed, and latency columns
- [x] Type badges (Proprietary / Open Source)
- [x] Alternating row colors for readability

## Phase 3: Interactivity

- [x] Category tooltips with benchmark breakdowns
- [x] Model tooltips with editor notes
- [x] Score tooltips showing individual benchmark scores
- [x] Price tooltips with input/output breakdown
- [x] External links to benchmark sources
- [x] Favorites system (star models)
- [x] localStorage persistence for favorites

## Phase 4: Customization

- [x] Column visibility toggle
- [x] localStorage persistence for column preferences
- [x] Filter by provider (dropdown)
- [x] Filter by type (proprietary/open-source)
- [x] Filter favorites only
- [x] Reset filters button
- [ ] Filter by price range (slider)
- [ ] Filter by speed range (slider)
- [ ] Filter by release date

## Phase 5: Mobile & Accessibility

- [x] Responsive card view for mobile
- [x] Touch-friendly favorites button
- [x] Keyboard navigation for sort headers
- [x] ARIA labels for interactive elements
- [x] Screen reader support
- [ ] Swipe gestures for mobile cards
- [ ] Improved touch targets

## Phase 6: Theming & Branding

- [x] Dark mode with system preference detection
- [x] Theme toggle button
- [x] localStorage persistence for theme
- [x] CSS custom properties for theming
- [x] GitHub star button in header
- [ ] Custom color themes
- [ ] Logo and favicon

## Phase 7: SEO & Performance

- [x] Static site generation (SSG)
- [x] Meta tags for social sharing
- [x] Open Graph tags
- [x] Twitter card tags
- [x] Sitemap.xml generation
- [x] Robots.txt
- [x] Cloudflare Pages deployment
- [ ] Structured data (JSON-LD)
- [ ] Performance monitoring

## Phase 8: DevOps & Quality

- [x] GitHub Actions CI/CD pipeline
- [x] Automated lint checks
- [x] TypeScript type checking
- [x] JSON schema validation
- [x] Build verification on PR
- [x] Issue templates for contributions
- [ ] Automated benchmark data fetching
- [ ] Data freshness monitoring

## Phase 9: Internationalization

- [x] Language selector UI (placeholder)
- [ ] Translation system setup

// Top 10 Global (250M+)

- [ ] English (en) - default
- [ ] Mandarin Chinese (zh)
- [ ] Hindi (hi)
- [ ] Spanish (es)
- [ ] French (fr)
- [ ] Standard Arabic (ar) - RTL
- [ ] Bengali (bn)
- [ ] Portuguese (pt)
- [ ] Russian (ru)
- [ ] Urdu (ur) - RTL

// 100M+ speakers

- [ ] Indonesian (id)
- [ ] German (de)
- [ ] Japanese (ja)
- [ ] Egyptian Arabic (arz) - RTL

// Strategic Tech markets (80M-100M)

- [ ] Vietnamese (vi)
- [ ] Turkish (tr)
- [ ] Italian (it)
- [ ] Korean (ko)

// High-value Tech markets (50M-80M)

- [ ] Polish (pl)
- [ ] Thai (th)
- [ ] Dutch (nl)
- [ ] Swedish (sv)

## Phase 10: Advanced Features

- [ ] Model comparison tool (side-by-side)
- [ ] Benchmark detail pages
- [ ] Model detail pages with full history
- [ ] Search functionality
- [ ] URL-based filter state (shareable links)
- [ ] Export data (CSV, JSON)
- [ ] API access for developers
- [ ] Historical score tracking
- [ ] Score change notifications

## Phase 11: Editor Tools

- [ ] Web-based data editor
- [ ] Authentication for editors
- [ ] PR generation from editor
- [ ] Bulk import tool
- [ ] Data validation preview
- [ ] Changelog generation

## Phase 12: Community

- [ ] User accounts (optional)
- [ ] Personal model lists
- [ ] Community ratings/comments
- [ ] Model request voting
- [ ] Contributor leaderboard
- [ ] Newsletter for updates

---

## How to Contribute

Pick any unchecked item and submit a PR! See [README.md](README.md) for contribution guidelines.

## Suggesting Features

Have an idea not on this list? [Open an issue](https://github.com/verseles/showdown/issues/new) to discuss it.
