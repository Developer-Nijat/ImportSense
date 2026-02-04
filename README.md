# ImportSense

**Semantically sort import statements** in JavaScript/TypeScript projects (React, Next.js, Node.js).

ImportSense is NOT a regex-based sorter — it's **project-aware and semantic**.

## Features

- 🎯 **Semantic import grouping** — understands your project structure
- 🔍 **Project-aware detection** — auto-detects framework and aliases
- ⚡ **Zero configuration** — works out of the box
- 🧩 **Smart classification** — distinguishes between core, third-party, internal modules

## Import Order

Imports are organized into these groups (in order):

1. **Core** — `react`, `react-dom`, `next`, `node:*`
2. **Third-party** — npm packages (`@mui/*`, `axios`, `lodash`, etc.)
3. **Internal** — project aliases (`@/services`, `@/api`, `@/lib`)
4. **Components** — `@/components`
5. **Utils** — `@/utils`, `helpers`
6. **Constants/Types** — `@/constants`, `@/types`
7. **Assets/Styles** — images, CSS, SCSS, SVG
8. **Side Effects** — `import './polyfills'`

## Usage

### Command Palette

1. Open a `.js`, `.ts`, `.jsx`, or `.tsx` file
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Type **"ImportSense: Fix Import Order"**
4. Press Enter

### Quick Fix

1. Place your cursor anywhere in the import block
2. Click the lightbulb icon or press `Cmd+.` / `Ctrl+.`
3. Select **"Sort imports with ImportSense"**

## Example

**Before:**
```typescript
import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import './styles.css';
import { formatDate } from '@/utils/date';
import type { User } from '@/types/user';
import React from 'react';
```

**After:**
```typescript
import React from 'react';
import { useState } from 'react';

import axios from 'axios';

import { Button } from '@/components/Button';

import { formatDate } from '@/utils/date';

import type { User } from '@/types/user';

import './styles.css';
```

## Supported Files

- `.js`
- `.ts`
- `.jsx`
- `.tsx`

## Project Detection

ImportSense automatically detects:

- **Framework** via `package.json` (React, Next.js, Node.js)
- **Path aliases** via `tsconfig.json` or `jsconfig.json`

## Requirements

- VS Code 1.85.0 or higher

## License

MIT
