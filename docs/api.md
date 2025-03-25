# API Reference

- [sql tagged templates](#sql)
- [raw](#raw)
- [sqlBuilder](#sqlbuilder)
- [buildInsert](#buildinsert)
- [buildInsertMany](#buildinsertmany)
- [buildUpdate](#buildupdate)
- [buildWhere](#buildwhere)
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