/* eslint-disable max-lines-per-function */
import {test} from 'hoare';
import {buildWhere} from './buildWhere';

test('buildWhere() builds WHERE clause with multiple fields', (assert) => {

    const query = buildWhere({
        id: 1,
        isActive: true,
        role: 'admin',
    });

    assert.equal(
        query.text,
        '"id" = $1 AND "isActive" = $2 AND "role" = $3',
        'Should generate correct WHERE clause'
    );

    assert.equal(
        query.values,
        [1, true, 'admin'],
        'Should match parameter values in order'
    );

});

test('buildWhere() works with single field', (assert) => {

    const query = buildWhere({id: 42});

    assert.equal(query.text, '"id" = $1');
    assert.equal(query.values, [42]);

});

test('buildWhere() throws for empty object', (assert) => {

    assert.throws(
        () => buildWhere({}),
        /where/i,
        'Should throw if WHERE object is empty'
    );

});
