import {test} from 'hoare';
import {sql} from './sql';

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
