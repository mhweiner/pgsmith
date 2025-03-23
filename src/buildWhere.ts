import {SqlQuery} from '.';

export function buildWhere<T extends Record<string, any>>(where: T): SqlQuery {

    const keys = Object.keys(where);

    if (!keys.length) throw new Error('WHERE clause cannot be empty');

    const values: any[] = [];

    const clauses = keys.map((key) => {

        values.push(where[key]);
        return `"${key}" = $${values.length}`;

    });

    return {
        text: clauses.join(' AND '),
        values,
    };

}
