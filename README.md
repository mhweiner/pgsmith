<picture>
    <source srcset="docs/pgsmith-white.svg" media="(prefers-color-scheme: dark)">
    <source srcset="docs/pgsmith-black.svg" media="(prefers-color-scheme: light)">
    <img src="docs/pgsmith-black.svg" alt="Logo" style="margin: 0 0 10px" size="250">
</picture>

[![build status](https://github.com/mhweiner/pgsmith/actions/workflows/release.yml/badge.svg)](https://github.com/mhweiner/pgsmith/actions)
[![SemVer](https://img.shields.io/badge/SemVer-2.0.0-blue)]()
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![AutoRel](https://img.shields.io/badge/v2-AutoRel?label=AutoRel&labelColor=0ab5fc&color=grey&link=https%3A%2F%2Fgithub.com%2Fmhweiner%2Fautorel)](https://github.com/mhweiner/autorel)

**pgsmith** is a utility for safely building parameterized SQL queries for use with [`pg`](https://github.com/brianc/node-postgres).

This is **not** an ORM or DSL. It’s a simple, composable SQL builder that lets you write SQL the way you want — clearly and safely.

```ts
/*** Tagged template ***/

const emails = ['alice@example.com', 'bob@example.com'];
const query = sql`SELECT * FROM users WHERE email IN (${emails}) AND is_active = ${true}`;

// query.text:
// SELECT * FROM users WHERE email IN ($1, $2) AND is_active <= $3
// query.values:
// ['alice@example.com', 'bob@example.com', true]

/*** Conditional query building ***/

const data = {
  id: 42,
  role: ['admin', 'editor'],
  order: 'created_at DESC',
}

const builder = sqlBuilder(sql`SELECT * FROM users WHERE 1=1`);

builder.add(sql`AND id = ${data.id}`);
builder.add(sql`AND role IN (${data.role})`);
builder.add(sql`ORDER BY ${raw('data.order')}`);

const query = builder.build();

await pg.query(query);

// query.text:
// SELECT * FROM users WHERE 1=1 AND id = $1 AND role IN ($3, $4) ORDER BY created_at DESC
// query.values:
// [42, 'admin', 'editor']
```

**🔐 Safe and Convenient**  
- Automatically numbers placeholders (`$1`, `$2`, …) to prevent SQL injection.  
- Plays nicely with parameterized queries and prepared statements.

**🧰 Flexible Builder API**  
- Dynamically build queries with conditionals or loops.  
- Easily compose from reusable parts.

**🛠️ Object Helpers**  
- Generate `INSERT`, `UPDATE`, and `WHERE` clauses [from objects](docs/api.md).

**🎯 Works with `pg`**  
- Returns `{text, values}` — drop-in compatible with `pg.query()`.

**💬 Template Literal Support**  
- Use [tagged templates](#tagged-template-example) for inline queries.  
- Automatically expands arrays into `IN ($1, $2, ...)` style.

**📦 Zero Dependencies, TypeScript Native**  
- Fully typed, 100% test coverage  
- No runtime dependencies or bloat

## Table of Contents

- [Installation](#installation)
- [Examples](#examples)
- [Using with `pg`](#using-with-pg)
- [API Reference](docs/api.md)
- [Philosophy](#philosophy)
- [Contributing](#contributing)
- [Related Projects](#related-projects)
- [License](#license)

## Installation

```bash
npm i pgsmith
```

## Examples

### 💬 Tagged Template Example

```ts
import {sql} from 'pgsmith';

const ids = [33, 22, 11];

const query = sql`
  SELECT * FROM logs
  WHERE id IN (${ids})
  AND level <= ${5}
  ORDER BY created_at DESC
`;

// pg.query(query)

// query.text:
// SELECT * FROM logs WHERE id IN ($1, $2, $3) AND level <= $4 ORDER BY created_at DESC
// query.values:
// [33, 22, 11, 5]
```

### 🛠️ Builder API Example

```ts
import {sql, sqlBuilder, raw} from 'pgsmith';

// example data, could be anything
const data = {
  id: 42,
  status: 'active',
  role: ['admin', 'editor'],
  order: 'created_at DESC',
}

const builder = sqlBuilder(sql`SELECT * FROM users WHERE 1=1`);

data.id && builder.add(sql`AND id = ${data.id}`);
data.status && builder.add(sql`AND status = ${data.status}`);
data.role && builder.add(sql`AND role IN (${data.role})`);
data.order && builder.add(sql`ORDER BY ${raw('data.order')}`);

const query = builder.build();

// query.text:
// SELECT * FROM users WHERE 1=1 AND id = $1 AND status = $2 AND role IN ($3, $4) ORDER BY created_at DESC
// query.values:
// [42, 'active', 'admin', 'editor']
```

See a more real-world example of dynamic query building [here](docs/dynamicSearchQueryExample.md).

### 📝 Insert From Object Example

```ts
import { buildInsert } from 'pgsmith';

const user = {
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@example.com',
  isActive: true,
};

const query = buildInsert('users', user, { returning: true });

// query.text:
// INSERT INTO "users" ("firstName", "lastName", "email", "isActive")
// VALUES ($1, $2, $3, $4) RETURNING *
// query.values:
// ['Alice', 'Smith', 'alice@example.com', true]
```

### 🧩 Composition Example

```ts
import { sql, sqlBuilder, buildWhere } from 'pgsmith';

const query = sqlBuilder(sql`SELECT * FROM users`)
  .add(buildWhere({id: 1, status: 'active', role: ['admin', 'editor']}))
  .add(sql`ORDER BY created_at ${raw('DESC')}`)
  .build();

// query.text:
// SELECT * FROM users WHERE "id" = $1 AND "status" = $2 AND "role" IN ($3, $4) ORDER BY created_at DESC
// query.values:
// [1, 'active', 'admin', 'editor']
```

## Using with `pg`

`pgsmith` works seamlessly with [`pg`](https://github.com/brianc/node-postgres), the most popular PostgreSQL client for Node.js.

Just pass the `{ text, values }` object directly to `pg.query()`:

```ts
import { sql } from 'pgsmith';
import { Client } from 'pg';

const client = new Client();
await client.connect();

const query = sql`SELECT * FROM users WHERE id = ${42}`;
const result = await client.query(query);

await client.end();

console.log(result.rows);
// → [{ id: 42, name: 'Alice', ... }]
```

## Philosophy

Most SQL libraries either go too far or not far enough.

- Some are **too low-level**, forcing you to manually manage strings and `$1` bindings.
- Others are **too high-level**, hiding SQL behind complex DSLs or ORMs.

`pgsmith` doesn’t try to replace SQL. It gives you a tiny, composable toolset that lets you work *with* SQL — clearly, safely, and without repetition or risk.

> Write SQL the way you want — clearly and safely.

## Contributing

- ⭐ Star this repo if you like it!
- 🐛 Open an [issue](https://github.com/mhweiner/pgsmith/issues) for bugs or suggestions.
- 🤝 Submit a PR to `main` — all tests must pass.

## Related Projects

- [autorel](https://github.com/mhweiner/autorel): Automate semantic releases based on conventional commits. Similar to semantic-release but much simpler.
- [hoare](https://github.com/mhweiner/hoare): An easy-to-use, fast, and defensive JS/TS test runner designed to help you to write simple, readable, and maintainable tests.
- [jsout](https://github.com/mhweiner/jsout): A Syslog-compatible, small, and simple logger for Typescript/Javascript projects.
- [cjs-mock](https://github.com/mhweiner/cjs-mock): NodeJS module mocking for CJS (CommonJS) modules for unit testing purposes.
- [brek](https://github.com/mhweiner/brek): powerful yet simple configuration library for Node.js. It’s structured, typed, and designed for dynamic configuration loading, making it perfect for securely managing secrets (e.g., AWS Secrets Manager).