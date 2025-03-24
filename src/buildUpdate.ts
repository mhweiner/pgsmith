import {buildWhere, SqlQuery} from '.';

export function buildUpdate<
    Data extends Record<string, any>,
    Where extends Record<string, any>
>(
    table: string,
    data: Data,
    where: Where,
    options?: { returning?: boolean | string }
): SqlQuery {

    const setKeys = Object.keys(data);
    const whereKeys = Object.keys(where);

    if (!setKeys.length) throw new Error('Cannot build update with empty data');
    if (!whereKeys.length) throw new Error('Missing WHERE clause');

    const values: any[] = [];

    const setClause = setKeys.map((key) => {

        values.push(data[key]);
        return `"${key}" = $${values.length}`;

    }).join(', ');

    // Generate the WHERE clause without `WHERE` keyword
    const whereClause = buildWhere(where, {omitWhere: true});
    const offset = values.length;

    // Renumber placeholders in WHERE clause to continue from SET clause
    const adjustedWhere = whereClause.text.replace(/\$(\d+)/g, (_, n) => `$${Number(n) + offset}`);

    values.push(...whereClause.values);

    let text = `UPDATE "${table}" SET ${setClause} WHERE ${adjustedWhere}`;

    if (options?.returning) {

        const returning = options.returning === true ? '*' : options.returning;

        text += ` RETURNING ${returning}`;

    }

    return {text, values};

}
