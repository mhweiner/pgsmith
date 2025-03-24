# tiny-pg-builder

[![build status](https://github.com/mhweiner/tiny-pg-builder/actions/workflows/release.yml/badge.svg)](https://github.com/mhweiner/tiny-pg-builder/actions)
[![SemVer](https://img.shields.io/badge/SemVer-2.0.0-blue)]()
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![AutoRel](https://img.shields.io/badge/v2-AutoRel?label=AutoRel&labelColor=0ab5fc&color=grey&link=https%3A%2F%2Fgithub.com%2Fmhweiner%2Fautorel)](https://github.com/mhweiner/autorel)

**tiny-pg-builder** is a utility for safely building parameterized SQL queries for use with [`pg`](https://github.com/brianc/node-postgres).

```ts
// tagged template
sql`SELECT * FROM logs WHERE id IN (${[8, 9]}) AND level <= ${5}`;
// {text: 'SELECT * FROM logs WHERE id IN ($1, $2) AND level <= $3', values: [8, 9, 5]}
// Pass this right into pg.query()

// Conditional query building
const builder = sqlBuilder(sql`SELECT * FROM users WHERE 1=1`);
status && builder.add(sql`AND status = ${'active'}`);
role && builder.add(sql`AND role IN (${['admin', 'editor']})`);
pg.query(builder.build());

// object-based helpers
const query = buildInsert('users', { name: 'Alice' });
pg.query(query);
```

It’s designed to help you write dynamic SQL without string concatenation or the complexity of an ORM.

_Write SQL the way you want — clearly and safely._

**🔐 Safe and Convenient**
- Automatically numbers placeholders (`$1`, `$2`, …) to prevent SQL injection.
- Easily Take advantage of parameterized queries and prepared statements for better performance.

**🧰 Flexible Builder API**
- Dynamically construct queries with conditionals or loops.
- Easily compose from multiple pieces.

**🛠️ Object-based helpers**
- Generate `INSERT`, `UPDATE`, and `WHERE` clauses [from objects](docs/api.md).

**🎯 Works with `pg`**
- Returns `{ text, values }` objects — drop-in compatible with `pg.query()`.

**💬 Template Literal Support**
- Use [tagged templates](#-example-tagged-template) for simple static queries.
- Interpolates arrays into `IN ($1, $2, ...)` automatically.

**📦 Zero Dependencies, Reliable & Stable**
- Fully TypeScript-native
- No dependencies, no bloat
- 100% unit test coverage

## Table of Contents

- [Installation](#installation)
- [Examples](#examples)
- [API Reference](docs/api.md)
- [Philosophy](#philosophy)
- [Contributing](#contributing)
- [Related Projects](#related-projects)
- [License](#license)

## Examples

### Builder API Quick Example

```ts
import {sqlBuilder} from 'tiny-pg-builder';

const builder = sqlBuilder('SELECT * FROM users WHERE 1=1');

builder.add('AND id = ?', [42]);
builder.add('AND status = ?', ['active']);
builder.add('AND role IN (??)', [['admin', 'editor']]);

const query = builder.build();

// pg.query(query)

// query.text: 
// 'SELECT * FROM users WHERE 1=1\nAND id = $1\nAND status = $2\nAND role IN ($3, $4)'
// query.values: 
// [42, 'active', 'admin', 'editor']
```

See how we can use this to build a [real-world dynamic search query](docs/dynamicSearchQueryExample.md).

### Tagged Template Example

```ts
import {sql} from 'tiny-pg-builder';

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

### 📝 Insert From Object Example

```ts
import {buildInsert} from 'tiny-pg-builder';

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

## Installation

```bash
npm i tiny-pg-builder
```

## API Reference

- [sqlBuilder](docs/api.md#sqlbuilder)
- [sql tagged templates](docs/api.md#sql)
- [buildInsert](docs/api.md#buildinsert)
- [buildInsertMany](docs/api.md#buildinsertmany)
- [buildUpdate](docs/api.md#buildupdate)
- [buildWhere](docs/api.md#buildwhere)
- [SqlBuilder type](docs/api.md#type-sqlbuilder)
- [SqlQuery type](docs/api.md#type-sqlquery)

## Philosophy

Many SQL libraries either go too far or not far enough.

- Some are **too low-level**, forcing you to manually manage strings, whitespace, and `$1` placeholders.
- Others are **too abstract**, hiding your SQL behind DSLs, query builders, or full ORMs.

`tiny-pg-builder` doesn't try to replace SQL — it just gives you a minimal toolset to work with it safely and dynamically, without repetition or risk.

The goal is to make SQL composable, readable, and easy to maintain&mdash;while keeping you in full control with minimal abstraction, overhead, or magic.

## Contributing

- Star this repo if you like it ⭐️
- Open an [issue](https://github.com/mhweiner/tiny-pg-builder/issues) for bugs or ideas
- Submit a PR against `main` and request a review

## Related Projects

- [hoare](https://github.com/mhweiner/hoare): A minimalist test runner for TypeScript and JavaScript
- [autorel](https://github.com/mhweiner/autorel): Automated semantic release from conventional commits
- [brek](https://github.com/mhweiner/brek): A dynamic config loader with structured types and secret support