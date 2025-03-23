import {SqlQuery} from '.';

// eslint-disable-next-line max-lines-per-function
export function buildInsertMany<T extends Record<string, any>>(
    table: string,
    rows: T[],
    options?: { returning?: boolean | string }
): SqlQuery {

    if (!rows.length) throw new Error('Cannot insert empty row set');

    const columns = Object.keys(rows[0]);

    if (!columns.length) throw new Error('Insert row must have at least one column');

    for (const row of rows) {

        const keys = Object.keys(row);

        if (keys.length !== columns.length || !columns.every((col) => keys.includes(col))) {

            throw new Error('All rows must have the same shape and keys');

        }

    }

    const values: any[] = [];
    const valuePlaceholders = rows.map((row, rowIndex) => `(${columns.map((_col, colIndex) => {

        const index = (rowIndex * columns.length) + colIndex + 1;

        values.push(row[columns[colIndex]]);
        return `$${index}`;

    }).join(', ')})`);

    const text = [
        `INSERT INTO "${table}" (${columns.map((col) => `"${col}"`).join(', ')})`,
        `VALUES ${valuePlaceholders.join(', ')}`,
    ].join(' ');

    const finalText = options?.returning
        ? `${text} RETURNING ${options.returning === true ? '*' : options.returning}`
        : text;

    return {
        text: finalText,
        values,
    };

}
