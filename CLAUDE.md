> You are a **Senior VS Code Extension Engineer** and **DX-focused architect**.
> Your task is to build a **production-ready MVP VS Code extension** called **ImportSense**.

### 🎯 Goal

Create a VS Code extension that **semantically sorts import statements** in JavaScript/TypeScript projects (React, Next.js, Node.js).

This is **NOT** a regex-based sorter.
It must be **project-aware and semantic**.

---

## 🧩 Functional Requirements (MVP – MUST HAVE)

### 1. Supported files

* `.js`, `.ts`, `.jsx`, `.tsx`

### 2. Import grouping (fixed for MVP)

Sort imports into these groups **in this exact order**:

1. **CORE**

   * `react`, `react-dom`, `next`, `node:*`
2. **THIRD_PARTY**

   * any npm package (e.g. `@mui/*`, `antd`, `axios`, `lodash`)
3. **INTERNAL**

   * project aliases like `@/services`, `@/api`, `@/lib`
4. **COMPONENTS**

   * `@/components`
5. **UTILS**

   * `@/utils`, `helpers`
6. **CONSTANTS / TYPES**

   * `@/constants`, `@/types`
7. **ASSETS / STYLES**

   * images, css, scss, svg
8. **SIDE_EFFECTS**

   * `import './polyfills'`

---

### 3. Project-aware detection

* Detect framework via `package.json`
* Detect aliases via `tsconfig.json`
* Do NOT require user configuration for MVP

---

### 4. VS Code integration

* Command: **ImportSense: Fix Import Order**
* Code Action (Quick Fix)
* Preserve comments and blank lines
* Insert blank line between import groups

---

### 5. Sorting rules

* Group order > alphabetical order inside group
* Named imports order should be preserved
* Side-effect imports must always be last

---

## 🧱 Technical Requirements

### Tech stack

* TypeScript
* VS Code Extension API
* `@babel/parser` for AST parsing

### Architecture

Use clean separation of concerns:

```txt
src/
 ├─ extension.ts
 ├─ commands/fixImportOrder.ts
 ├─ parser/importParser.ts
 ├─ sorter/importSorter.ts
 ├─ detector/frameworkDetector.ts
 ├─ detector/aliasDetector.ts
 └─ utils/
```

---

## 🧪 Edge Cases (DO NOT IGNORE)

* Mixed default + named imports
* Type-only imports (`import type { X } from`)
* Multiline imports
* Existing comments above imports
* Files with no imports

---

## 📦 Output Expectations

* Fully working extension
* Clean, readable, commented code
* Ready to run with `F5`
* Include basic README.md
* No placeholders, no TODOs

---

## 🚫 Explicitly Forbidden

* Regex-only parsing
* ESLint dependency
* Prettier dependency
* Any AI explanations inside code

---

## ✅ Final Check

Before finishing, verify:

* Extension activates correctly
* Command works
* Import order is correct
* No imports lost or duplicated

---

🔥 **IMPORTANT**
Think like a **DX-focused senior engineer**, not a demo builder.
This extension must be something **developers would actually install**.

---

## Növbəti səviyyə (sonra)

* `.importsense.json`
* Team presets
* Import order score
* ESLint sync

---

### 💡 Pro tip

> “If anything is ambiguous, make the most reasonable senior-level decision and continue.”
