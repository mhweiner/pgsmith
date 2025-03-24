# API Reference

- [sql tagged templates](#sql)
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

Tagged template for inline SQL with automatic `$1` bindings.

```ts
const ids = [1, 2, 3];
const query = sql`SELECT * FROM logs WHERE id IN (${ids}) AND level <= ${5}`;
pg.query(query);

// query.text:
// SELECT * FROM logs WHERE id IN ($1, $2, $3) AND level <= $4
// query.values:
// [1, 2, 3, 5]
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
pg.query(query);

// query.text:
// SELECT * FROM users WHERE 1=1\nAND active = $1
// query.values:
// [true]
```

---

### `buildInsert`

```ts
buildInsert(table: string, data: Record<string, any>, options?: { returning?: boolean | string }): SqlQuery
```

Builds a safe `INSERT` query from a plain object.

```ts
const query = buildInsert('users', {
  name: 'Alice',
  email: 'alice@example.com',
}, { returning: 'id' });
pg.query(query);

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
pg.query(query)

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
pg.query(query);

// query.text:
// UPDATE "users" SET "name" = $1, "isActive" = $2 WHERE "id" = $3 RETURNING *
// query.values:
// ['Alice', true, 42]
```

Throws if `data` or `where` objects are empty.

### `buildWhere`

```ts
buildWhere(where: Record<string, any>): SqlQuery
```

Generates a parameterized SQL `WHERE` clause from a plain object. Column names are safely quoted, and values are parameterized using `$1`, `$2`, etc.

```ts
const query = buildWhere({
  id: 1,
  isActive: true,
  role: 'admin',
});

// query.text:
// '"id" = $1 AND "isActive" = $2 AND "role" = $3'

// query.values:
// [1, true, 'admin']
```

This is useful for composing custom queries, or plugging into `sqlBuilder()` or `pg.query()`.

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