import {SqlQuery} from '.';

export function buildInsert<T extends Record<string, any>>(
    table: string,
    data: T,
    options?: { returning?: string | boolean }
): SqlQuery {

    const columns = Object.keys(data);
    const values = Object.values(data);

    if (!columns.length) throw new Error('Empty insert data.');

    const columnNames = columns.map((col) => `"${col}"`).join(', ');
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

    let text = `INSERT INTO "${table}" (${columnNames}) VALUES (${placeholders})`;

    if (options?.returning) {

        text += ` RETURNING ${options.returning === true ? '*' : options.returning}`;

    }

    return {text, values};

}
