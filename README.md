<div align="center">

# 🔍 SplunkLint

<img src="https://img.shields.io/badge/Splunk-XML%20Validator-00A98F?style=for-the-badge&logo=splunk&logoColor=white" alt="SplunkLint"/>

**Advanced Dashboard XML Validator & SPL Analyzer for Splunk**

*Validate, analyze, and optimize your Splunk dashboards—entirely in your browser*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-zero-blue.svg?style=flat-square)](/)
[![Offline Ready](https://img.shields.io/badge/offline-ready-purple.svg?style=flat-square)](/)

[**Access Here**](https://splunklint.netlify.app) · [Report Bug](https://github.com/sarat1kyan/splunklint/issues) · [Request Feature](https://github.com/sarat1kyan/splunklint/issues)

**Note:** This is a community-maintained, non-official tool. It is not affiliated with Splunk.

---
![icon](https://github.com/user-attachments/assets/22bd768a-fe5f-4bd5-b576-dba395826fb8)

</div>

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Usage Guide](#-usage-guide)
- [Validation Rules](#-validation-rules)
- [SPL Analysis](#-spl-analysis)
- [Export Options](#-export-options)
- [Architecture](#-architecture)
- [Contributing](#-contributing)
- [Roadmap](#-roadmap)
- [FAQ](#-faq)
- [License](#-license)

---

## 🎯 Overview

**SplunkLint** is a comprehensive, browser-based tool for validating and analyzing Splunk Dashboard XML. It provides real-time feedback, actionable recommendations, and deep SPL query analysis - all without sending your data anywhere.

### Why SplunkLint?

| Challenge | Solution |
|-----------|----------|
| 🐛 **Catching XML errors** | Validate syntax before deploying to production |
| 🐌 **Slow dashboards** | Identify performance bottlenecks in SPL queries |
| 📚 **Learning best practices** | Get contextual suggestions based on Splunk patterns |
| ⏱️ **Deployment delays** | Validate locally without Splunk access |
| 🔒 **Data privacy concerns** | Everything runs in your browser—zero data transmission |

---

## ✨ Features

### Core Validation Engine

| Feature | Description |
|---------|-------------|
| **XML Syntax Validation** | Detects parsing errors with precise line numbers |
| **Structure Validation** | Ensures proper `<dashboard>` and `<form>` structure |
| **Element Validation** | Validates panels, searches, visualizations, and drilldowns |
| **Deprecation Warnings** | Identifies outdated elements like `<searchName>`, `<searchString>` |
| **Security Checks** | Detects hardcoded credentials, API keys, and tokens |

### SPL Query Analysis

| Check | Severity | Impact |
|-------|----------|--------|
| Leading wildcard (`*term`) | 🔴 High | Very slow searches across all data |
| No index specified | 🟡 Medium | Searches all indexes by default |
| `transaction` command | 🔴 High | Resource-intensive; prefer `stats` |
| `join` command | 🟡 Medium | Performance impact; consider alternatives |
| Subsearch usage | 🟡 Medium | Limited to 50,000 results |
| Multiple OR clauses | 🟡 Medium | Use `IN` operator or regex |
| `regex` without index | 🔴 High | Must specify index first |
| Complex `eval` with `case()` | 🔵 Low | Consider lookup tables |

### Developer Experience

- ✨ **XML Formatter** — Auto-format and beautify XML with proper indentation
- 📋 **Example Templates** — Pre-loaded dashboard examples to learn from
- 📝 **Line Numbers** — Synchronized line numbers in the editor
- ⬇️ **Export Options** — Download reports in JSON, TXT, or HTML formats
- ⌨️ **Keyboard Shortcuts** — `Ctrl/Cmd + Enter` for instant validation
- 📊 **Statistics Dashboard** — Real-time metrics on panels, searches, tokens

---

## 🚀 Quick Start

**No installation required!** SplunkLint runs entirely in your browser.

1. **Open** → Visit [splunklint.netlify.app](https://splunklint.netlify.app) or open `index.html` locally
2. **Paste** → Copy your Splunk dashboard XML into the editor
3. **Validate** → Press `Ctrl/Cmd + Enter` or click "Validate XML"
4. **Review** → Check errors, warnings, and suggestions
5. **Analyze** → Click "Analyze SPL" for deep query insights

---

## 📥 Installation

### Option 1: Use Online (Recommended)

Visit **[splunklint.netlify.app](https://splunklint.netlify.app)** — no download needed.

### Option 2: Download & Run Locally

```bash
# Clone the repository
git clone https://github.com/sarat1kyan/splunklint.git
cd splunklint

# Open in your default browser
# macOS
open index.html

# Windows
start index.html

# Linux
xdg-open index.html
```

---

## 📖 Usage Guide

### Basic Validation Workflow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Paste/Load XML │ ──▶ │  Validate XML   │ ──▶ │  Review Results │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │  Export Report  │ ◀── │   Analyze SPL   │
                        └─────────────────┘     └─────────────────┘
```

### Loading Example Dashboards

Click **📋 Load Example** dropdown to choose from:

| Example | Description |
|---------|-------------|
| Simple Dashboard | Basic dashboard with single value and table |
| Advanced Dashboard | Dashboard with charts, tokens, and drilldowns |
| Form Dashboard | Interactive form with multiple input types |
| Common Errors | Dashboard with intentional errors for testing |

### Formatting XML

Click **✨ Format XML** to automatically:
- Add proper indentation
- Normalize whitespace
- Structure nested elements

### Exporting Reports

Click **📊 Export Report** and choose your format:

| Format | Use Case |
|--------|----------|
| **JSON** | CI/CD integration, automated processing |
| **Text** | Documentation, code reviews |
| **HTML** | Sharing with stakeholders, visual reports |

---

## 🔍 Validation Rules

### Critical Errors (Must Fix)

These issues will prevent your dashboard from working correctly:

| Rule | Example | Fix |
|------|---------|-----|
| Invalid XML syntax | Unclosed tags, invalid characters | Check XML structure |
| Missing root element | No `<dashboard>` or `<form>` | Add proper root element |
| Empty panel | Panel without visualization | Add `<chart>`, `<table>`, etc. |
| Empty query | `<query></query>` | Add SPL query content |
| Security issues | Hardcoded `password="secret"` | Remove credentials |

### Warnings (Should Fix)

These won't break your dashboard but may cause issues:

| Rule | Impact | Recommendation |
|------|--------|----------------|
| Missing `<label>` | Dashboard has no title in UI | Add descriptive label |
| Missing `<description>` | No context for users | Add description |
| No time bounds | Uses default time range | Specify `<earliest>` and `<latest>` |
| Deprecated elements | May break in future versions | Use modern alternatives |
| Missing panel titles | Poor user experience | Add `<title>` to panels |
| Aggressive refresh | High server load | Use 30s+ refresh intervals |

### Info (Consider)

Suggestions for improvement:

| Suggestion | Benefit |
|------------|---------|
| Add panel IDs | Enable drilldown capabilities |
| Use submit button | Better form control |
| Limit panel count | Improved load performance |

---

## 🔬 SPL Analysis

SplunkLint performs deep analysis of your Search Processing Language queries to identify performance issues and suggest optimizations.

### Performance Scoring

Each query receives a performance rating:

| Rating | Indicator | Meaning |
|--------|-----------|---------|
| 🟢 **GOOD** | Green badge | Optimized query following best practices |
| 🟡 **FAIR** | Yellow badge | Minor issues that could be improved |
| 🔴 **POOR** | Red badge | Significant performance problems |

### Common SPL Anti-Patterns

```spl
# ❌ AVOID: Leading wildcard
* error | stats count

# ✅ BETTER: Specify index and be specific
index=main error | stats count
```

```spl
# ❌ AVOID: transaction (resource intensive)
index=main | transaction sessionId

# ✅ BETTER: Use stats with by clause
index=main | stats values(*) by sessionId
```

```spl
# ❌ AVOID: Multiple OR clauses
index=main (host=web01 OR host=web02 OR host=web03 ...)

# ✅ BETTER: Use IN operator
index=main host IN (web01, web02, web03)
```

---

## 📤 Export Options

### JSON Export

Perfect for CI/CD pipelines and automated validation:

```json
{
  "valid": true,
  "errors": [],
  "warnings": [
    {
      "type": "warning",
      "title": "Missing Description",
      "message": "Consider adding a <description> element",
      "suggestion": "Add <description>Dashboard purpose and context</description>"
    }
  ],
  "stats": {
    "panels": 4,
    "searches": 4,
    "rows": 2,
    "tokens": 2,
    "drilldowns": 1
  }
}
```

### Text Export

Human-readable format for documentation:

```
========================================
SPLUNKLINT VALIDATION REPORT
========================================

Date: 1/8/2026, 10:30:00 AM
Status: VALID

STATISTICS:
- Panels: 4
- Searches: 4
- Rows: 2
- Errors: 0
- Warnings: 1

WARNINGS:
1. Missing Description
   Consider adding a <description> element
```

### HTML Export

Styled report with colors for sharing with stakeholders.

---

## 🏗️ Architecture

SplunkLint is designed with simplicity and privacy in mind:

```
┌──────────────────────────────────────────────────────────┐
│                     index.html                           │
├──────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐                  │
│  │   HTML/CSS     │  │   JavaScript   │                  │
│  │   UI Layer     │  │   Validation   │                  │
│  └────────────────┘  └────────────────┘                  │
│           │                   │                          │
│           ▼                   ▼                          │
│  ┌─────────────────────────────────────┐                 │
│  │        Browser DOMParser API        │                 │
│  │        (XML Parsing Engine)         │                 │
│  └─────────────────────────────────────┘                 │
└──────────────────────────────────────────────────────────┘
         │
         ▼
    📦 Zero network requests
    🔒 All data stays local
```

### Technology Stack

| Component | Technology |
|-----------|------------|
| Markup | HTML5 |
| Styling | CSS3 with CSS Variables |
| Logic | Vanilla JavaScript (ES6+) |
| XML Parsing | Browser DOMParser API |
| Layout | CSS Grid & Flexbox |
| Fonts | JetBrains Mono, IBM Plex Sans |

### File Structure

```
splunklint/
├── index.html      # Complete application (single file)
├── README.md       # This documentation
└── LICENSE         # MIT License
```

### Design Principles

- **Zero Dependencies** — No npm, no build step, no frameworks
- **Offline-First** — Works without internet connection
- **Privacy-Focused** — No analytics, no data transmission
- **Portable** — Single HTML file, works anywhere

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Ways to Contribute

| Type | Description |
|------|-------------|
| 🐛 **Bug Reports** | Open an issue with reproduction steps |
| 💡 **Feature Ideas** | Share suggestions in discussions |
| 🔧 **Pull Requests** | Fork, branch, code, test, PR! |
| 📖 **Documentation** | Improve guides and examples |
| 🗣️ **Feedback** | Share how you use SplunkLint |

### Development Setup

```bash
# Clone the repo
git clone https://github.com/sarat1kyan/splunklint.git
cd splunklint

# Open in your editor
code index.html

# Test in browser (with live reload if using VS Code Live Server)
open index.html
```

### Adding New Validation Rules

Find the `performValidation()` function in `index.html`:

```javascript
// Example: Add a check for deprecated attribute
if (rootElement.hasAttribute('version')) {
    result.warnings.push({
        type: 'warning',
        title: 'Deprecated Attribute',
        message: 'The "version" attribute on dashboard element is deprecated',
        suggestion: 'Remove the version attribute'
    });
}
```

### Adding SPL Analysis Rules

Find the `analyzeSPL()` function:

```javascript
// Example: Check for inefficient command
if (query.toLowerCase().includes('| transaction')) {
    queryAnalysis.issues.push({
        severity: 'high',
        message: 'transaction command can be resource-intensive',
        suggestion: 'Consider using stats with by clause instead'
    });
    queryAnalysis.performance = 'poor';
}
```

### Pull Request Guidelines

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

---

## 🗺️ Roadmap

### Planned Features

| Feature | Status | Description |
|---------|--------|-------------|
| Dark/Light Theme Toggle | 🔜 Planned | Switch between color themes |
| Syntax Highlighting | 🔜 Planned | Colorize XML in the editor |
| Dashboard Comparison | 🔜 Planned | Diff two XML files side-by-side |
| Visual Preview | 🔜 Planned | Render dashboard structure visually |
| VS Code Extension | 🔜 Planned | Validate directly in your editor |
| GitHub Actions | 🔜 Planned | CI/CD integration for pipelines |
| Custom Rules | 🔜 Planned | User-defined validation rules |
| Dashboard Converter | 🔜 Planned | Convert between Simple and Advanced XML |
| REST API Mode | 🔜 Planned | Programmatic access for automation |

### Suggesting Features

Have an idea? [Open an issue](https://github.com/sarat1kyan/splunklint/issues) with the `enhancement` label!

---

## ❓ FAQ

<details>
<summary><strong>Does SplunkLint send my XML anywhere?</strong></summary>

**No!** Everything runs entirely in your browser. Your XML never leaves your computer. There are no network requests, no analytics, no tracking.
</details>

<details>
<summary><strong>Can I use this offline?</strong></summary>

**Yes!** Download the `index.html` file and open it locally. It works without any internet connection.
</details>

<details>
<summary><strong>Does it work with Splunk Cloud?</strong></summary>

**Yes!** SplunkLint validates standard Splunk Dashboard XML regardless of your deployment type (Splunk Cloud, Splunk Enterprise, or standalone).
</details>

<details>
<summary><strong>Can I validate .spl files?</strong></summary>

Currently, SplunkLint focuses on dashboard XML validation. SPL-only file validation is on the roadmap.
</details>

<details>
<summary><strong>Is this an official Splunk tool?</strong></summary>

**No.** SplunkLint is an independent, open-source project not affiliated with Splunk Inc.
</details>

<details>
<summary><strong>What browsers are supported?</strong></summary>

SplunkLint works best in modern browsers:
- ✅ Chrome/Chromium (recommended)
- ✅ Firefox
- ✅ Edge
- ✅ Safari
- ⚠️ Internet Explorer (not supported)
</details>

<details>
<summary><strong>Can I embed SplunkLint in my application?</strong></summary>

Yes! Since it's a single HTML file with MIT license, you can embed or adapt it. Consider linking back to the project.
</details>

<details>
<summary><strong>How do I report a bug?</strong></summary>

Open an issue on [GitHub](https://github.com/sarat1kyan/splunklint/issues) with:
- Steps to reproduce
- Expected vs actual behavior
- Sample XML (sanitized of sensitive data)
- Browser and OS information
</details>

---

## ⚠️ Known Limitations

| Limitation | Workaround |
|------------|------------|
| Large XML files (>10MB) may be slow | Split into smaller files for validation |
| Complex regex patterns in SPL | Some patterns may not be analyzed correctly |
| Token replacement | Dynamic token values aren't evaluated |
| Advanced XML features | Focus is on Simple XML; some Advanced XML may need manual review |

---

## 🔒 Security & Privacy

SplunkLint is designed with security and privacy as core principles:

- **🌐 No Network Requests** — All processing happens locally
- **📦 No External Dependencies** — Single self-contained HTML file
- **🔍 No Tracking** — No analytics, cookies, or telemetry
- **💾 No Storage** — Nothing saved to disk or local storage
- **🛡️ Security Detection** — Warns about hardcoded credentials in XML

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Mher Saratikyan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 🙏 Acknowledgments

- Inspired by the incredible Splunk community
- Built with insights from [Splunk Documentation](https://docs.splunk.com/Documentation/Splunk/latest/Viz/PanelreferenceforSimplifiedXML)
- Typography by [JetBrains Mono](https://www.jetbrains.com/lp/mono/) and [IBM Plex](https://www.ibm.com/plex/)

---

## 👨‍💻 Author

**Mher Saratikyan**

[![GitHub](https://img.shields.io/badge/GitHub-@sarat1kyan-181717?style=flat-square&logo=github)](https://github.com/sarat1kyan)

---

## ⭐ Show Your Support

If SplunkLint helped you, please consider:

| Action | How It Helps |
|--------|--------------|
| ⭐ **Star this repo** | Increases visibility |
| 🐛 **Report bugs** | Improves quality |
| 💡 **Suggest features** | Shapes the roadmap |
| 🔀 **Contribute code** | Adds new capabilities |
| 📢 **Share with others** | Grows the community |

---

<div align="center">

**Made with ❤️ by [@sarat1kyan](https://github.com/sarat1kyan)**

*Validate your Splunk dashboards with confidence*

## 🙏 Acknowledgments

**⭐ Star this repo if you found it helpful!**
[![BuyMeACoffee](https://raw.githubusercontent.com/pachadotdev/buymeacoffee-badges/main/bmc-donate-yellow.svg)](https://www.buymeacoffee.com/saratikyan)

[⬆ Back to Top](#-splunklint)

</div>

