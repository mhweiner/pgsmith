/* eslint-disable max-lines-per-function */
import {test} from 'hoare';
import {buildUpdate} from './buildUpdate';

test('buildUpdate() generates correct SQL and values', (assert) => {

    const query = buildUpdate(
        'users',
        {name: 'Alice', isActive: true},
        {id: 42}
    );

    assert.equal(
        query.text,
        'UPDATE "users" SET "name" = $1, "isActive" = $2 WHERE "id" = $3'
    );

    assert.equal(query.values, ['Alice', true, 42]);

});

test('buildUpdate() supports RETURNING *', (assert) => {

    const query = buildUpdate(
        'users',
        {email: 'test@example.com'},
        {id: 1},
        {returning: true}
    );

    assert.equal(
        query.text,
        'UPDATE "users" SET "email" = $1 WHERE "id" = $2 RETURNING *'
    );

    assert.equal(query.values, ['test@example.com', 1]);

});

test('buildUpdate() supports RETURNING column', (assert) => {

    const query = buildUpdate(
        'users',
        {name: 'Updated'},
        {id: 99},
        {returning: 'id'}
    );

    assert.equal(
        query.text,
        'UPDATE "users" SET "name" = $1 WHERE "id" = $2 RETURNING id'
    );

    assert.equal(query.values, ['Updated', 99]);

});

test('buildUpdate() throws if update object is empty', (assert) => {

    assert.throws(
        () => buildUpdate('users', {}, {id: 1}),
        /empty/i,
        'Should throw if update data is empty'
    );

});

test('buildUpdate() throws if where object is empty', (assert) => {

    assert.throws(
        () => buildUpdate('users', {name: 'Alice'}, {}),
        /where/i,
        'Should throw if where clause is missing'
    );

});
