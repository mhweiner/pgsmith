import {test} from 'hoare';
import {buildUnnest} from './buildUnnest';

test('buildUnnest returns correct cols, unnest, and values', async (assert) => {

  type Log = {
      id: string
      time: number
      level: number
  };

  const logs: Log[] = [
      {id: 'a', time: 1700000000000, level: 1},
      {id: 'b', time: 1700000005000, level: 2},
  ];

  const build = buildUnnest<Log>({
      id: {type: 'uuid'},
      time: {type: 'timestamptz', transform: (log): Date => new Date(log.time)},
      level: {type: 'int'},
  });

  const {cols, unnest, values} = build(logs);

  return assert.equal(
      JSON.stringify({cols, unnest, values}),
      JSON.stringify({
          cols: '"id", "time", "level"',
          unnest: 'UNNEST($1::uuid[], $2::timestamptz[], $3::int[]) AS t("id", "time", "level")',
          values: [
              ['a', 'b'],
              [new Date(1700000000000), new Date(1700000005000)],
              [1, 2],
          ],
      })
  );

});

test('buildUnnest works with default accessors', async (assert) => {

  type Row = {a: number, b: string};

  const unnestRows = buildUnnest<Row>({
      a: {type: 'int'},
      b: {type: 'text'},
  });

  const {cols, unnest, values} = unnestRows([
      {a: 1, b: 'one'},
      {a: 2, b: 'two'},
  ]);

  return assert.equal(
      JSON.stringify({cols, unnest, values}),
      JSON.stringify({
          cols: '"a", "b"',
          unnest: 'UNNEST($1::int[], $2::text[]) AS t("a", "b")',
          values: [[1, 2], ['one', 'two']],
      })
  );

});

test('buildUnnest handles nulls and missing values safely', async (assert) => {

  type Row = { name: string, note?: string };

  const unnestRows = buildUnnest<Row>({
      name: {type: 'text'},
      note: {type: 'text'},
  });

  const {cols, unnest, values} = unnestRows([
      {name: 'Alice'},
      {name: 'Bob', note: 'hi'},
  ]);

  return assert.equal(
      JSON.stringify({cols, unnest, values}),
      JSON.stringify({
          cols: '"name", "note"',
          unnest: 'UNNEST($1::text[], $2::text[]) AS t("name", "note")',
          values: [['Alice', 'Bob'], [null, 'hi']],
      })
  );

});
