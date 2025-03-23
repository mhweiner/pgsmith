/* eslint-disable max-lines-per-function */
import {test} from 'hoare';
import {buildInsertMany} from './buildInsertMany';

test('buildInsertMany() builds multi-row insert with correct SQL and values', (assert) => {

    const query = buildInsertMany('users', [
        {name: 'Alice', email: 'a@example.com'},
        {name: 'Bob', email: 'b@example.com'},
    ]);

    assert.equal(
        query.text,
        'INSERT INTO "users" ("name", "email") VALUES ($1, $2), ($3, $4)'
    );

    assert.equal(
        query.values,
        ['Alice', 'a@example.com', 'Bob', 'b@example.com']
    );

});

test('buildInsertMany() supports RETURNING *', (assert) => {

    const query = buildInsertMany(
        'users',
        [{name: 'Charlie', email: 'c@example.com'}],
        {returning: true}
    );

    assert.equal(
        query.text,
        'INSERT INTO "users" ("name", "email") VALUES ($1, $2) RETURNING *'
    );

    assert.equal(query.values, ['Charlie', 'c@example.com']);

});

test('buildInsertMany() supports RETURNING column name', (assert) => {

    const query = buildInsertMany(
        'users',
        [{name: 'Dana', email: 'd@example.com'}],
        {returning: 'id'}
    );

    assert.equal(
        query.text,
        'INSERT INTO "users" ("name", "email") VALUES ($1, $2) RETURNING id'
    );

    assert.equal(query.values, ['Dana', 'd@example.com']);

});

test('buildInsertMany() throws if rows array is empty', (assert) => {

    assert.throws(
        () => buildInsertMany('users', []),
        /empty row set/,
        'Should throw if rows is empty'
    );

});

test('buildInsertMany() throws if a row has different keys', (assert) => {

    assert.throws(
        () => buildInsertMany('users', [
            {name: 'Alice', email: 'a@example.com'},
            {name: 'Bob'}, // missing email
        ]),
        /same shape/,
        'Should throw if rows have mismatched keys'
    );

});
