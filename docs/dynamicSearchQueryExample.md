# Dynamic Search Query Example

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

const query = buildUserQuery({
  name: 'alice',
  active: true,
  roles: ['admin', 'editor'],
});

// query.text   → 'SELECT * FROM users WHERE 1=1\nAND name ILIKE $1\nAND active = $2\nAND role IN ($3, $4)'
// query.values → ['%alice%', true, 'admin', 'editor']

const result = await pg.query({text, values});
```