# Dynamic Search Query Example

```ts
import {sqlBuilder, sql, raw} from 'pgsmith';
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
  sort?: 'ASC' | 'DESC';
};

function buildUserQuery(filters: UserFilters) {
  const builder = sqlBuilder(sql`SELECT * FROM users WHERE 1=1`);

  if (filters.name) {
    builder.add(sql`AND name ILIKE ${`%${filters.name}%`}`);
  }

  if (filters.active !== undefined) {
    builder.add(sql`AND active = ${filters.active}`);
  }

  if (filters.roles?.length) {
    builder.add(sql`AND role IN (${filters.roles})`);
  }

  if (filters.ageBetween) {
    builder.add(
      sql`AND age BETWEEN ${filters.ageBetween.from} AND ${filters.ageBetween.to}`
    );
  }

  if (filters.sort) {
    // Sort order cannot be parameterized directly, so we use raw() to safely inject it
    // you must validate the sort order to prevent SQL injection!
    const safeSort = filters.sort.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    builder.add(sql`ORDER BY age ${raw(safeSort)}`);
  }

  return builder.build();
}

const query = buildUserQuery({
  name: 'alice',
  active: true,
  roles: ['admin', 'editor'],
  sort: 'DESC',
});

// query.text:
// SELECT * FROM users WHERE 1=1
// AND name ILIKE $1
// AND active = $2
// AND role IN ($3, $4)
// ORDER BY age DESC

// query.values:
// ['%alice%', true, 'admin', 'editor']

const result = await pg.query(query);
```