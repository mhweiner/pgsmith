# tiny-pg-builder

[![build status](https://github.com/mhweiner/tiny-pg-builder/actions/workflows/release.yml/badge.svg)](https://github.com/mhweiner/tiny-pg-builder/actions)
[![SemVer](https://img.shields.io/badge/SemVer-2.0.0-blue)]()
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![AutoRel](https://img.shields.io/badge/v2-AutoRel?label=AutoRel&labelColor=0ab5fc&color=grey&link=https%3A%2F%2Fgithub.com%2Fmhweiner%2Fautorel)](https://github.com/mhweiner/autorel)

**tiny-pg-builder** is a utility for safely building parameterized SQL queries for use with [`pg`](https://github.com/brianc/node-postgres).

```ts
// Tagged template
sql`SELECT * FROM logs WHERE id IN (${[8, 9]}) AND level <= ${5}`;
// → { text: 'SELECT * FROM logs WHERE id IN ($1, $2) AND level <= $3', values: [8, 9, 5] }

// Conditional query building
const builder = sqlBuilder(sql`SELECT * FROM users WHERE 1=1`);
status && builder.add(sql`AND status = ${'active'}`);
role && builder.add(sql`AND role IN (${['admin', 'editor']})`);
const query = builder.build();
// → { text: 'SELECT * FROM users WHERE 1=1\nAND status = $1\nAND role IN ($2, $3)', values: ['active', 'admin', 'editor'] }

// Object-based helpers
buildInsert('users', { id: 1, name: 'Alice' });
// → { text: 'INSERT INTO users (id, name) VALUES ($1, $2)', values: [1, 'Alice'] }
```

It’s designed to help you write dynamic SQL without string concatenation or the complexity of an ORM.

_Write SQL the way you want — clearly and safely._

---

**🔐 Safe and Convenient**  
- Automatically numbers placeholders (`$1`, `$2`, …) to prevent SQL injection.  
- Plays nicely with parameterized queries and prepared statements.

**🧰 Flexible Builder API**  
- Dynamically build queries with conditionals or loops.  
- Easily compose from reusable parts.

**🛠️ Object Helpers**  
- Generate `INSERT`, `UPDATE`, and `WHERE` clauses [from objects](docs/api.md).

**🎯 Works with `pg`**  
- Returns `{ text, values }` — drop-in compatible with `pg.query()`.

**💬 Template Literal Support**  
- Use [tagged templates](#tagged-template-example) for inline queries.  
- Automatically expands arrays into `IN ($1, $2, ...)` style.

**📦 Zero Dependencies, TypeScript Native**  
- Fully typed, 100% test coverage  
- No runtime dependencies or bloat

---

## Table of Contents

- [Installation](#installation)
- [Examples](#examples)
- [API Reference](docs/api.md)
- [Philosophy](#philosophy)
- [Contributing](#contributing)
- [Related Projects](#related-projects)
- [License](#license)

---

## Installation

```bash
npm i tiny-pg-builder
```

---

## Examples

### Tagged Template Example

```ts
import { sql } from 'tiny-pg-builder';

const ids = [33, 22, 11];

const query = sql`
  SELECT * FROM logs
  WHERE id IN (${ids})
  AND level <= ${5}
`;

// pg.query(query)

// query.text:
// SELECT * FROM logs WHERE id IN ($1, $2, $3) AND level <= $4
// query.values:
// [33, 22, 11, 5]
```

---

### Builder API Quick Example

```ts
import { sql, sqlBuilder } from 'tiny-pg-builder';

const builder = sqlBuilder(sql`SELECT * FROM users WHERE 1=1`);

builder.add(sql`AND id = ${42}`);
builder.add(sql`AND status = ${'active'}`);
builder.add(sql`AND role IN (${['admin', 'editor']})`);

const query = builder.build();

// pg.query(query)

// query.text:
// SELECT * FROM users WHERE 1=1
// AND id = $1
// AND status = $2
// AND role IN ($3, $4)

// query.values:
// [42, 'active', 'admin', 'editor']
```

See [this guide](docs/dynamicSearchQueryExample.md) for building dynamic search queries.

---

### 📝 Insert From Object Example

```ts
import { buildInsert } from 'tiny-pg-builder';

const user = {
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@example.com',
  isActive: true,
};

const query = buildInsert('users', user, { returning: true });

// pg.query(query)

// query.text:
// INSERT INTO "users" ("firstName", "lastName", "email", "isActive")
// VALUES ($1, $2, $3, $4) RETURNING *
// query.values:
// ['Alice', 'Smith', 'alice@example.com', true]
```

---

### 🧩 Complex Composition Example

```ts
import { sql, sqlBuilder, buildWhere } from 'tiny-pg-builder';

const query = sqlBuilder(sql`SELECT * FROM users`)
  .add(buildWhere({ id: 1, status: 'active', role: ['admin', 'editor'] }))
  .add(sql`ORDER BY created_at DESC`)
  .build();

// query.text:
// SELECT * FROM users
// WHERE "id" = $1 AND "status" = $2 AND "role" IN ($3, $4)
// ORDER BY created_at DESC

// query.values:
// [1, 'active', 'admin', 'editor']
```

---

## Using with `pg`

`tiny-pg-builder` works seamlessly with [`pg`](https://github.com/brianc/node-postgres), the most popular PostgreSQL client for Node.js.

Just pass the `{ text, values }` object directly to `pg.query()`:

```ts
import { sql } from 'tiny-pg-builder';
import { Client } from 'pg';

const client = new Client();
await client.connect();

const query = sql`SELECT * FROM users WHERE id = ${42}`;
const result = await client.query(query);

await client.end();

console.log(result.rows);
// → [{ id: 42, name: 'Alice', ... }]
```

---

## Philosophy

Most SQL libraries either go too far or not far enough.

- Some are **too low-level**, forcing you to manually manage strings and `$1` bindings.
- Others are **too high-level**, hiding SQL behind complex DSLs or ORMs.

`tiny-pg-builder` doesn’t try to replace SQL. It gives you a tiny, composable toolset that lets you work *with* SQL — clearly, safely, and without repetition or risk.

> Write SQL the way you want — clearly and safely.

---

## API Reference

- [`sqlBuilder`](docs/api.md#sqlbuilder)
- [`sql` tagged templates](docs/api.md#sql)
- [`buildInsert`](docs/api.md#buildinsert)
- [`buildInsertMany`](docs/api.md#buildinsertmany)
- [`buildUpdate`](docs/api.md#buildupdate)
- [`buildWhere`](docs/api.md#buildwhere)
- [`SqlBuilder` type](docs/api.md#type-sqlbuilder)
- [`SqlQuery` type](docs/api.md#type-sqlquery)

---

## Contributing

- ⭐ Star this repo if you like it!
- 🐛 Open an [issue](https://github.com/mhweiner/tiny-pg-builder/issues) for bugs or suggestions.
- 🤝 Submit a PR to `main` — all tests must pass.

---

## Related Projects

- [**hoare**](https://github.com/mhweiner/hoare) – A minimalist test runner for TypeScript and JavaScript.
- [**autorel**](https://github.com/mhweiner/autorel) – Automated semantic release from conventional commits.
- [**brek**](https://github.com/mhweiner/brek) – A dynamic config loader with structured types and secret support.