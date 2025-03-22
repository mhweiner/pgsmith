import {test} from 'hoare';
import {sqlBuilder} from './sqlBuilder';

test('sqlBuilder handles ? and ?? placeholders correctly', (assert) => {

    const builder = sqlBuilder('SELECT * FROM logs WHERE teamId = ?', ['teamId']);

    builder.add('AND level <= ?', [3]);
    builder.add('AND compId IN (??)', [[1, 2, 3]]);
    const result = builder.build();

    assert.equal(result.text, 'SELECT * FROM logs WHERE teamId = $1\nAND level <= $2\nAND compId IN ($3, $4, $5)');
    assert.equal(result.values, ['teamId', 3, 1, 2, 3]);

});

test('throws if parameter count mismatches placeholders', (assert) => {

    const builder = sqlBuilder('SELECT * FROM logs');

    assert.throws(
        () => builder.add('WHERE id = ? AND name = ?', [1]), // Missing parameter for name
        /mismatch/i
    );

});

test('throws if ?? is used with empty array', (assert) => {

    const builder = sqlBuilder('SELECT * FROM logs');

    assert.throws(
        () => builder.add('WHERE id IN (??)', [[]]), // Empty array for ??
        /Cannot use empty array with "??"/i
    );

});
