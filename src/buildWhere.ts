import {SqlQuery} from '.';

export type BuildWhereOptions = {
    omitWhere?: boolean
};

export function buildWhere<T extends Record<string, any>>(
    where: T,
    options: BuildWhereOptions = {}
): SqlQuery {

    const keys = Object.keys(where);

    if (!keys.length) throw new Error('WHERE clause cannot be empty');

    const values: any[] = [];
    const clauses: string[] = [];

    for (const key of keys) {

        const value = where[key];

        if (Array.isArray(value)) {

            if (value.length === 0) {

                throw new Error(`Cannot use empty array in WHERE clause for "${key}"`);

            }

            const placeholders = value.map((_, i) => `$${values.length + i + 1}`);

            values.push(...value);
            clauses.push(`"${key}" IN (${placeholders.join(', ')})`);

        } else {

            values.push(value);
            clauses.push(`"${key}" = $${values.length}`);

        }

    }

    return {
        text: `${options.omitWhere ? '' : 'WHERE '}${clauses.join(' AND ')}`,
        values,
    };

}
