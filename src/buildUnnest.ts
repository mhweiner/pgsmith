import {PgType} from './pgTypes';

/* eslint-disable max-lines-per-function */
type ColumnTransform<T> = (row: T) => any;
type SchemaEntry<T> = {
    type: PgType
    transform?: ColumnTransform<T>
};
type SchemaSpec<T> = Record<keyof T, SchemaEntry<T>>;
type UnnestResult = {
    cols: string // e.g. "id", "time", "level"
    unnest: string // e.g. UNNEST($1::uuid[], ...) AS t("id", "time", ...)
    values: any[][] // column-aligned arrays
};

/**
 * Defines a reusable schema for bulk inserts using PostgreSQL UNNEST().
 *
 * - Accepts a row type and schema mapping of column names to PG types and optional transforms
 * - Returns a function that takes an array of rows and returns:
 *   - `cols`: column list as a SQL fragment
 *   - `unnest`: UNNEST(...) clause with AS t(...) alias block
 *   - `values`: column-aligned arrays suitable for binding to a parameterized query
 */
export function buildUnnest<T>(spec: SchemaSpec<T>): (rows: T[]) => UnnestResult {

    const keys = Object.keys(spec) as (keyof T & string)[];

    const types: Record<string, PgType> = {};
    const transforms: Record<string, ColumnTransform<T>> = {};

    for (const key of keys) {

        const {type, transform} = spec[key];

        types[key] = type;
        transforms[key] = transform ?? ((row: T): any => (row as any)[key]);

    }

    return function build(rows: T[]): UnnestResult {

        const cols: Record<string, any[]> = {};

        for (const key of keys) {

            cols[key] = [];

        }

        for (const row of rows) {

            for (const key of keys) {

                cols[key].push(transforms[key](row));

            }

        }

        const values: any[][] = keys.map((key) => cols[key]);
        const colList = `${keys.map((k) => `"${k}"`).join(', ')}`;
        const unnestList = keys
            .map((key, i) => `$${i + 1}::${types[key]}[]`)
            .join(', ');
        const unnest = `UNNEST(${unnestList}) AS t(${colList})`;

        return {
            cols: colList,
            unnest,
            values,
        };

    };

}
