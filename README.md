# pg-sql-builder

[![build status](https://github.com/mhweiner/pg-sql-builder/actions/workflows/release.yml/badge.svg)](https://github.com/mhweiner/pg-sql-builder/actions)
[![SemVer](https://img.shields.io/badge/SemVer-2.0.0-blue)]()
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![AutoRel](https://img.shields.io/badge/v2-AutoRel?label=AutoRel&labelColor=0ab5fc&color=grey&link=https%3A%2F%2Fgithub.com%2Fmhweiner%2Fautorel)](https://github.com/mhweiner/autorel)

**pg-sql-builder** is a tiny utility for safely building parameterized SQL queries for use with [`pg`](https://github.com/brianc/node-postgres).

It’s designed to help you write dynamic SQL without string concatenation or the complexity of an ORM.

- 💡 **Small, easy-to-learn API**
- 🔒 **Safe and parameterized** — supports `$1`, `$2`, etc.
- 🧩 **Compositional** — great for conditional logic
- 🧵 **Tagged template support** for static queries
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

**💬 Optional Template Literal Support**
- Use tagged templates for simple static queries.
- Interpolates arrays into `IN ($1, $2, ...)` automatically.

**📦 Zero Dependencies**
- Fully TypeScript-native, no config required.

## 🧪 Example: Builder API

```ts
import { sqlBuilder } from 'pg-sql-builder';

const builder = sqlBuilder('SELECT * FROM logs WHERE 1=1');

builder.add('AND team_id = ?', [123]);
builder.add('AND level <= ?', [3]);

// Use `??` to expand an array into multiple parameters
builder.add('AND component_id IN (??)', [[1, 2, 3]]);

const query = builder.build();
// query.text → 'SELECT * FROM logs WHERE 1=1\nAND team_id = $1\nAND level <= $2\nAND component_id IN ($3, $4, $5)'
// query.values → [123, 3, 1, 2, 3]
```

## 🧪 Example: Tagged Template

```ts
import { sql } from 'pg-sql-builder';

const ids = [1, 2, 3];
const query = sql`SELECT * FROM logs WHERE id IN (${ids}) AND level <= ${5}`;

// query.text → 'SELECT * FROM logs WHERE id IN ($1, $2, $3) AND level <= $4'
// query.values → [1, 2, 3, 5]
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
npm i pg-sql-builder
```

Then use `sqlBuilder()` for dynamic queries, or `sql` tagged templates for simple inline queries.

## Philosophy

Most SQL query helpers are either:
- Too verbose (string concatenation, manual `$1`)
- Too magical (ORMs, query builders, AST-based tools)

`pg-sql-builder` gives you just enough tooling to avoid repetition — without hiding your SQL behind a DSL. You stay in control of the query, and the parameters stay safe.

## Contributing

- Star this repo if you like it ⭐️
- Open an [issue](https://github.com/mhweiner/pg-sql-builder/issues) for bugs or ideas
- Submit a PR against `main` and request a review

## Related Projects

- [hoare](https://github.com/mhweiner/hoare): A minimalist test runner for TypeScript and JavaScript
- [autorel](https://github.com/mhweiner/autorel): Automated semantic release from conventional commits
- [brek](https://github.com/mhweiner/brek): A dynamic config loader with structured types and secret support