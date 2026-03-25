# Contributing to ytdl-lite

First off, thanks for taking the time to contribute! 🎉  
This project is maintained by **@DanuZz** — contributions are welcome as long as you follow the rules below.

---

## Table of Contents

- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Pull Request Rules](#pull-request-rules)
- [Code Style](#code-style)
- [What NOT to Do](#what-not-to-do)

---

## Getting Started

1. **Fork** this repository
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/dnuzi/ytdl-lite.git
   cd ytdl-lite
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Create a new branch** for your changes:
   ```bash
   git checkout -b fix/your-fix-name
   # or
   git checkout -b feat/your-feature-name
   ```

---

## How to Contribute

### 🐛 Reporting Bugs

- Open an **Issue** on GitHub
- Include the YouTube URL you tested with
- Paste the full error message / stack trace
- Mention your Node.js version: `node -v`

### 💡 Suggesting Features

- Open an **Issue** with the tag `enhancement`
- Describe what you want and why it's useful
- Don't open a PR for a feature without discussing it first

### 🔧 Submitting Fixes / Features

1. Make your changes on your branch
2. Test it manually with `node test.js`
3. Commit with a clear message:
   ```bash
   git commit -m "fix: handle null thumbnail from API"
   git commit -m "feat: add playlist support"
   ```
4. Push and open a **Pull Request** to the `main` branch

---

## Pull Request Rules

- ✅ One PR per fix/feature — don't bundle unrelated changes
- ✅ Write a clear description of what you changed and why
- ✅ Keep the `@DanuZz` author credit intact in all files
- ✅ Don't change `package.json` name, version, or author field
- ❌ Don't submit PRs that expose internal API keys or endpoints
- ❌ Don't submit PRs that remove or bypass error handling

---

## Code Style

- Use `'use strict';` at the top of every file
- Use `const` / `let` — never `var`
- Use `async/await` — no raw `.then()` chains
- Keep functions small and focused
- Add a comment if something isn't obvious

---

## What NOT to Do

- ❌ Don't copy this code into your own npm package
- ❌ Don't remove the `creator: '@DanuZz'` field from responses
- ❌ Don't submit PRs just to change formatting or whitespace
- ❌ Don't open duplicate issues

---

## Need Help?

Open an issue or check [SUPPORT.md](./SUPPORT.md).

---

**Thank you for contributing! 🙏**  
_— @DanuZz_
