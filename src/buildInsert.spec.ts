/* eslint-disable max-lines-per-function */
import {test} from 'hoare';
import {buildInsert} from './buildInsert';

test('buildInsert() builds a valid INSERT query with multiple fields', (assert) => {

    const query = buildInsert('users', {
        firstName: 'Alice',
        lastName: 'Smith',
        age: 30,
    });

    assert.equal(
        query.text,
        'INSERT INTO "users" ("firstName", "lastName", "age") VALUES ($1, $2, $3)'
    );

    assert.equal(query.values, ['Alice', 'Smith', 30]);

});

test('buildInsert() throws for empty data object', (assert) => {

    assert.throws(
        () => buildInsert('users', {}),
        /empty/i,
        'Should throw if insert object is empty'
    );

});

test('buildInsert() includes RETURNING * when specified', (assert) => {

    const query = buildInsert('users', {
        email: 'test@example.com',
    }, {returning: true});

    assert.equal(
        query.text,
        'INSERT INTO "users" ("email") VALUES ($1) RETURNING *'
    );

    assert.equal(query.values, ['test@example.com']);

});

test('buildInsert() includes RETURNING column when specified', (assert) => {

    const query = buildInsert('users', {
        email: 'test@example.com',
    }, {returning: 'id'});

    assert.equal(
        query.text,
        'INSERT INTO "users" ("email") VALUES ($1) RETURNING id'
    );

    assert.equal(query.values, ['test@example.com']);

});
