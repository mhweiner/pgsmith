import {test} from 'hoare';
import {sqlBuilder} from './sqlBuilder';
import {sql} from './sql';

test('sqlBuilder builds a basic composed query', (assert) => {

    const builder = sqlBuilder(sql`SELECT * FROM users WHERE 1=1`);

    builder.add(sql`AND active = ${true}`);
    builder.add(sql`AND role IN (${['admin', 'editor']})`);

    const result = builder.build();

    assert.equal(
        result.text,
        'SELECT * FROM users WHERE 1=1\nAND active = $1\nAND role IN ($2, $3)'
    );

    assert.equal(
        result.values,
        [true, 'admin', 'editor']
    );

});

test('sqlBuilder with no adds returns original query', (assert) => {

    const initial = sql`SELECT * FROM logs WHERE level <= ${3}`;
    const builder = sqlBuilder(initial);
    const result = builder.build();

    assert.equal(result.text, 'SELECT * FROM logs WHERE level <= $1');
    assert.equal(result.values, [3]);

});

test('sqlBuilder preserves order and parameter numbering', (assert) => {

    const builder = sqlBuilder(sql`SELECT * FROM logs WHERE 1=1`);

    builder.add(sql`AND comp_id IN (${[1, 2]})`);
    builder.add(sql`AND level <= ${5}`);
    builder.add(sql`AND message ILIKE ${'%error%'}`);

    const result = builder.build();

    assert.equal(
        result.text,
        'SELECT * FROM logs WHERE 1=1\nAND comp_id IN ($1, $2)\nAND level <= $3\nAND message ILIKE $4'
    );

    assert.equal(result.values, [1, 2, 5, '%error%']);

});

test('sqlBuilder generates stable query text for identical structure (for prepared statements)', (assert) => {

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

    const builderA = sqlBuilder(sql`SELECT * FROM logs WHERE 1=1`);

    builderA.add(sql`AND team_id = ${inputA.teamId}`);
    builderA.add(sql`AND message ILIKE ${inputA.message}`);
    builderA.add(sql`AND level <= ${inputA.level}`);

    const builderB = sqlBuilder(sql`SELECT * FROM logs WHERE 1=1`);

    builderB.add(sql`AND team_id = ${inputB.teamId}`);
    builderB.add(sql`AND message ILIKE ${inputB.message}`);
    builderB.add(sql`AND level <= ${inputB.level}`);

    const resultA = builderA.build();
    const resultB = builderB.build();

    assert.equal(resultA.text, resultB.text);

});
