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
        'WHERE "id" = $1 AND "isActive" = $2 AND "role" = $3',
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

    assert.equal(query.text, 'WHERE "id" = $1');
    assert.equal(query.values, [42]);

});

test('buildWhere() throws for empty object', (assert) => {

    assert.throws(
        () => buildWhere({}),
        /where/i,
        'Should throw if WHERE object is empty'
    );

});

test('buildWhere() supports arrays with IN clause', (assert) => {

    const query = buildWhere({
        status: ['active', 'pending'],
        role: 'admin',
    });

    assert.equal(
        query.text,
        'WHERE "status" IN ($1, $2) AND "role" = $3',
        'Should generate IN clause for array values'
    );

    assert.equal(
        query.values,
        ['active', 'pending', 'admin'],
        'Should match parameter values for IN and scalar'
    );

});

test('buildWhere() supports omitting WHERE keyword when omitWhere option is true', (assert) => {

    const query = buildWhere(
        {id: 99, active: true},
        {omitWhere: true}
    );

    assert.equal(
        query.text,
        '"id" = $1 AND "active" = $2',
        'Should generate clause without WHERE keyword'
    );

    assert.equal(
        query.values,
        [99, true],
        'Should return correct values in order'
    );

});
