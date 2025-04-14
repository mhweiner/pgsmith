import {test} from 'hoare';
import {raw, sql} from './sql';

test('sql tag interpolates values and arrays into numbered parameters', (assert) => {

    const ids = [1, 2, 3];
    const {text, values} = sql`SELECT * FROM logs WHERE id IN (${ids}) AND level <= ${5}`;

    assert.equal(text, 'SELECT * FROM logs WHERE id IN ($1, $2, $3) AND level <= $4');
    assert.equal(values, [1, 2, 3, 5]);

});

test('throws on empty array', (assert) => {

    assert.throws(
        () => sql`SELECT * FROM logs WHERE id IN (${[]})`, // Empty array
        /Cannot interpolate empty array into SQL/
    );

});

test('sql.raw inserts trusted SQL as-is without binding', (assert) => {

    const sortDir = raw('DESC');
    const {text, values} = sql`SELECT * FROM logs ORDER BY time ${sortDir}`;

    assert.equal(text, 'SELECT * FROM logs ORDER BY time DESC');
    assert.equal(values, []);

});

test('sql.raw and parameters mixed correctly', (assert) => {

    const query = sql`SELECT * FROM ${raw('"logs"')} WHERE level >= ${3} AND status = ${'active'}`;

    assert.equal(query.text, 'SELECT * FROM "logs" WHERE level >= $1 AND status = $2');
    assert.equal(query.values, [3, 'active']);

});

test('sql() trims extra whitespace from final text', (assert) => {

    const query = sql`  SELECT * FROM logs  WHERE id = ${1}  `;

    assert.equal(query.text, 'SELECT * FROM logs  WHERE id = $1');

});

test('sql generates stable query text for identical structure (for prepared statements)', (assert) => {

    const inputA = {
        teamId: 'teamA',
        message: 'hello',
        level: 2,
        compId: 'comp1',
        count: 3,
    };
    const inputB = {
        teamId: 'teamB',
        message: 'world',
        level: 4,
        compId: 'comp2',
        count: 7,
    };

    const {text: textA} = sql`SELECT * FROM issues WHERE teamId = ${inputA.teamId} AND message = ${inputA.message}`;
    const {text: textB} = sql`SELECT * FROM issues WHERE teamId = ${inputB.teamId} AND message = ${inputB.message}`;

    assert.equal(textA, textB);

});
