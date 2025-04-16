# API Reference

- [sql tagged templates](#sql)
- [raw](#raw)
- [sqlBuilder](#sqlbuilder)
- [buildInsert](#buildinsert)
- [buildInsertMany](#buildinsertmany)
- [buildUpdate](#buildupdate)
- [buildWhere](#buildwhere)
- [buildUnnest](#buildunnest)
- [SqlBuilder type](#type-sqlbuilder)
- [SqlQuery type](#type-sqlquery)

## 🧱 Methods

### `sql`

```ts
sql(strings: TemplateStringsArray, ...values: any[]): SqlQuery
```

Tagged template for inline SQL with automatic `$1`, `$2`, … bindings.

- Arrays are expanded into `IN (...)` placeholders.
- Use `raw()` to safely interpolate unparameterized values like sort direction or column names.

```ts
const ids = [1, 2, 3];
const query = sql`
  SELECT * FROM logs
  WHERE id IN (${ids})
  AND level <= ${5}
  ORDER BY created_at ${raw('ASC')}
`;

// query.text:
// SELECT * FROM logs WHERE id IN ($1, $2, $3) AND level <= $4 ORDER BY created_at ASC
// query.values:
// [1, 2, 3, 5]
```

---

### `raw`

```ts
raw(value: string): { text: string, values: [] }
```

Injects a raw SQL string without parameterization. Useful when you need to safely insert known SQL fragments like `ASC`, `DESC`, or `"tableName"`.

⚠️ You **must validate or sanitize** the value yourself to avoid SQL injection.

```ts
const query = sql`
  SELECT * FROM users
  ORDER BY created_at ${raw('DESC')}
`;

// query.text: 'SELECT * FROM users ORDER BY created_at DESC'
// query.values: []
```

---

### `sqlBuilder`

```ts
sqlBuilder(initial: SqlQuery): SqlBuilder
```

See [SqlBuilder](#type-sqlbuilder) for the return type/interface.

Creates a new builder for dynamic queries.

```ts
const builder = sqlBuilder(sql`SELECT * FROM users WHERE 1=1`);
builder.add(sql`AND active = ${true}`);
const query = builder.build();

// query.text:
// SELECT * FROM users WHERE 1=1\nAND active = $1
// query.values:
// [true]
```

---

### `buildInsert`

```ts
buildInsert(
  table: string, 
  data: Record<string, any>, 
  options?: {returning?: boolean|string}
): SqlQuery
```

Builds a safe `INSERT` query from a plain object.

```ts
const query = buildInsert('users', {
  name: 'Alice',
  email: 'alice@example.com',
}, {returning: 'id'});

// query.text:
// INSERT INTO "users" ("name", "email") VALUES ($1, $2) RETURNING id
// query.values:
// ['Alice', 'alice@example.com']
```

Throws if `data` is empty.

---

### `buildInsertMany`

```ts
buildInsertMany(
  table: string,
  rows: Record<string, any>[],
  options?: { returning?: boolean | string }
): SqlQuery
```

Builds a parameterized `INSERT` statement for multiple rows.

```ts
const query = buildInsertMany('users', [
  { name: 'Alice', email: 'a@example.com' },
  { name: 'Bob', email: 'b@example.com' },
]);

// query.text:
// INSERT INTO "users" ("name", "email") VALUES ($1, $2), ($3, $4)
// query.values:
// ['Alice', 'a@example.com', 'Bob', 'b@example.com']
```

#### Options

- `returning: true` → appends `RETURNING *`
- `returning: 'id'` → appends `RETURNING id`

#### Notes

- All rows must have the **same keys**, in the same order.
- Throws if the input array is empty or inconsistent.

### `buildUpdate`

```ts
buildUpdate(
  table: string,
  data: Record<string, any>,
  where: Record<string, any>,
  options?: { returning?: boolean | string }
): SqlQuery
```

Builds a safe `UPDATE` query from plain objects for the `SET` and `WHERE` clauses.

```ts
const query = buildUpdate(
  'users',
  { name: 'Alice', isActive: true },
  { id: 42 },
  { returning: true }
);

// query.text:
// UPDATE "users" SET "name" = $1, "isActive" = $2 WHERE "id" = $3 RETURNING *
// query.values:
// ['Alice', true, 42]
```

Throws if `data` or `where` objects are empty.

### `buildWhere`

```ts
buildWhere(
  where: Record<string, any>, 
  options?: {omitWhere?: boolean}
): SqlQuery
```

Builds a basic `WHERE` clause from a flat object.

- Arrays are automatically converted into `IN (...)` clauses.
- If `options.omitWhere` is `true`, the `WHERE` keyword is excluded from the returned text.

```ts
buildWhere({ id: 1, active: true });
// → { text: 'WHERE "id" = $1 AND "active" = $2', values: [1, true] }

buildWhere({ role: ['admin', 'editor'] });
// → { text: 'WHERE "role" IN ($1, $2)', values: ['admin', 'editor'] }

buildWhere({ id: 42 }, { omitWhere: true });
// → { text: '"id" = $1', values: [42] }
```

> **Note:** `buildWhere()` is intentionally minimal.  
> It supports only flat key-value pairs and `IN (...)` clauses for arrays.  
> It is **not a DSL** — use `sql` or `sqlBuilder()` for anything more advanced (e.g. `>`, `<`, `IS NULL`, `BETWEEN`, etc.).

Throws if the object is empty.

### `buildUnnest`

```ts
buildUnnest<T>(spec: SchemaSpec<T>): (rows: T[]) => UnnestResult
```

A reusable helper to generate SQL-safe `UNNEST(...)` clauses from a list of typed rows — complete with type-safe schema definition, column-aligned parameter arrays, and casted SQL fragments for use with PostgreSQL bulk inserts.

This design allows you to declaratively define column types and logic in one place — with consistent output for UNNEST-based inserts. It generates the necessary SQL fragments and parameter arrays for you, so you can focus on your data and logic.

```ts

import {buildUnnest} from 'pgsmith';

// 1. Define your row type and prepare your data

type User = {
  id: string;
  dateRegistered: number;
  teamId: number;
  name?: string;
};

const users = [
  {id: '1', dateRegistered: 1744741891219, teamId: 1, name: "Craig Johnson"},
  {id: '2', dateRegistered: 1744741890430, teamId: 2},
];

// 2. Create an unnest function using `buildUnnest`

const unnestUsers = buildUnnest<User>({
  id: {type: 'uuid'},
  dateRegistered: {
    type: 'timestamptz',
    transform: (user) => new Date(user.dateRegistered), // optional custom transform
  },
  teamId: {type: 'int'},
});

// 3. Build the query

const {cols, unnest, values} = unnestUsers(users);
const text = `
    INSERT INTO users (${cols})
    SELECT * FROM ${unnest}
    ON CONFLICT (id) DO NOTHING
    `;

// This will generate the following SQL:
// INSERT INTO users ("id", "dateRegistered", "teamId")
// SELECT * FROM UNNEST($1::uuid[], $2::timestamptz[], $3::int4[])
// ON CONFLICT (id) DO NOTHING

await db.query({text, values});
```

#### 🧠 Schema Format

```ts
{
  [columnName]: {
    type: PgType;
    transform?: (row: T) => any;
  }
}
```

- `type` is required and must be a PostgreSQL type. We have built-in support for common Postgres types, but if your type isn't supported, you can use `'blah' as PgType` or use `@ts-ignore` to bypass type checking.
- `transform` is optional — if omitted, the field will be accessed via `row[key]`
- All keys must exist on the row type `T`

#### 🛑 Gotchas

- You should **not include `[]`** in the `type` — this is handled automatically.
  - ✅ Use `'uuid'` → 🔁 generates `$1::uuid[]`
  - ❌ Don't use `'uuid[]'`
- `cols` and `unnest` are **raw SQL fragments** — use them with `raw(...)` or just interpolate them directly into your query.
- The optional `transform` function is called for each row in the array. It should return a value that matches the type you specified in the schema. This is not type-checked (cast as `any`), so you must ensure that the return type matches the expected PostgreSQL type.

## 🧩 Types

### `type SqlBuilder`

The object returned by `sqlBuilder()`:

- `.add(clause: SqlQuery): void`
  - Appends a new SQL clause to the builder using any valid `SqlQuery` object. Each clause is separated by a newline. Valid inputs include `sql` tagged templates, `buildWhere()`, or any function that returns a `SqlQuery`.
- `.build(): SqlQuery`
  - Returns `{ text, values }` for `pg.query()`

---

### `type SqlQuery`

The standard output shape for all builder/tag functions:

```ts
type SqlQuery = {
  text: string;
  values: any[];
};
```

Fully compatible with `pg.query(query)` from [`node-postgres`](https://github.com/brianc/node-postgres).