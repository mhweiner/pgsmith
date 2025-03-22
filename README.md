# tiny-pg-builder

[![build status](https://github.com/mhweiner/tiny-pg-builder/actions/workflows/release.yml/badge.svg)](https://github.com/mhweiner/tiny-pg-builder/actions)
[![SemVer](https://img.shields.io/badge/SemVer-2.0.0-blue)]()
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![AutoRel](https://img.shields.io/badge/v2-AutoRel?label=AutoRel&labelColor=0ab5fc&color=grey&link=https%3A%2F%2Fgithub.com%2Fmhweiner%2Fautorel)](https://github.com/mhweiner/autorel)

**tiny-pg-builder** is a tiny utility for safely building parameterized SQL queries for use with [`pg`](https://github.com/brianc/node-postgres).

It’s designed to help you write dynamic SQL without string concatenation or the complexity of an ORM.

- 💡 **Small, easy-to-learn API**
- 🔒 **Safe and parameterized** — supports `$1`, `$2`, etc.
- 🧩 **Compositional** — great for conditional logic
- 🧵 **Tagged template support** for easy inline, static queries
- 🧼 **No magic, no globals, no bloat**

> Write SQL the way you want — clearly and safely.

## ✨ Features

**🔐 Safe by Default**
- Automatically numbers placeholders (`$1`, `$2`, …) to prevent SQL injection.
- Handles arrays via `??` for `IN (...)` clauses.

**🧰 Flexible Builder API**
- Dynamically construct queries with conditionals or loops.
- Easily compose from multiple pieces.

**🎯 Works with `pg`**
- Returns `{ text, values }` objects — drop-in compatible with `pg.query()`.

**💬 Template Literal Support**
- Use [tagged templates](#-example-tagged-template) for simple static queries.
- Interpolates arrays into `IN ($1, $2, ...)` automatically.

**📦 Tiny, Zero Dependencies, Stable**
- Fully TypeScript-native
- Tiny footprint (~0.02 KB gzipped) with no dependencies

## 🧪 Builder API Basic Example

```ts
import {sqlBuilder} from 'tiny-pg-builder';
import {Client} from 'pg';

const pg = new Client(); // or use pg.Pool if that's what you're using
await pg.connect();

const builder = sqlBuilder('SELECT * FROM users WHERE 1=1');

builder.add('AND id = ?', [42]);
builder.add('AND status = ?', ['active']);
builder.add('AND role IN (??)', [['admin', 'editor']]);

const {text, values} = builder.build();
// text   → 'SELECT * FROM users WHERE 1=1\nAND id = $1\nAND status = $2\nAND role IN ($3, $4)'
// values → [42, 'active', 'admin', 'editor']

const result = await pg.query({text, values});
```

## 🧪 Builder API Advanced Example

```ts
import {sqlBuilder} from 'tiny-pg-builder';
import {Client} from 'pg';

const pg = new Client(); // or use pg.Pool if that's what you're using
await pg.connect();

type UserFilters = {
  name?: string;
  active?: boolean;
  roles?: string[];
  ageBetween?: {
    from: number;
    to: number;
  };
};

function buildUserQuery(filters: UserFilters) {
  const builder = sqlBuilder('SELECT * FROM users WHERE 1=1');

  if (filters.name) {
    builder.add('AND name ILIKE ?', [`%${filters.name}%`]);
  }

  if (filters.active !== undefined) {
    builder.add('AND active = ?', [filters.active]);
  }

  if (filters.roles?.length) {
    builder.add('AND role IN (??)', [filters.roles]);
  }

  if (filters.ageBetween) {
    builder.add('AND age BETWEEN ? AND ?', [
      filters.ageBetween.from,
      filters.ageBetween.to,
    ]);
  }

  return builder.build();
}

const {text, values} = buildUserQuery({
  name: 'alice',
  active: true,
  roles: ['admin', 'editor'],
});

// query.text   → 'SELECT * FROM users WHERE 1=1\nAND name ILIKE $1\nAND active = $2\nAND role IN ($3, $4)'
// query.values → ['%alice%', true, 'admin', 'editor']

const result = await pg.query({text, values});
```

## 🧪 Example: Tagged Template

```ts
import {sql} from 'tiny-pg-builder';
import {Client} from 'pg';

const pg = new Client(); // or use pg.Pool if that's what you're using
await pg.connect();

const ids = [1, 2, 3];
const {text, values} = sql`SELECT * FROM logs WHERE id IN (${ids}) AND level <= ${5}`;

// query.text → 'SELECT * FROM logs WHERE id IN ($1, $2, $3) AND level <= $4'
// query.values → [1, 2, 3, 5]

const result = await pg.query({text, values});
```

## Table of Contents

- [Getting Started](#getting-started)
- [Examples](#examples)
- [API Reference](docs/api.md)
- [Philosophy](#philosophy)
- [Contributing](#contributing)
- [License](LICENSE)

## Getting Started

Install with npm:

```bash
npm i tiny-pg-builder
```

Then use `sqlBuilder()` for dynamic queries, or `sql` tagged templates for simple inline queries.

## Philosophy 

Most SQL query helpers are either:
- Too verbose (string concatenation, manual `$1`)
- Too magical (ORMs, query builders, AST-based tools)

`tiny-pg-builder` gives you just enough tooling to avoid repetition — without hiding your SQL behind a DSL. You stay in control of the query, and the parameters stay safe.

## Contributing

- Star this repo if you like it ⭐️
- Open an [issue](https://github.com/mhweiner/tiny-pg-builder/issues) for bugs or ideas
- Submit a PR against `main` and request a review

## Related Projects

- [hoare](https://github.com/mhweiner/hoare): A minimalist test runner for TypeScript and JavaScript
- [autorel](https://github.com/mhweiner/autorel): Automated semantic release from conventional commits
- [brek](https://github.com/mhweiner/brek): A dynamic config loader with structured types and secret support