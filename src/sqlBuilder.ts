import type {PgQuery} from '.';

export function sqlBuilder(clause: string, params: any[] = []): {
    add: (clause: string, params?: any[]) => void
    build: () => PgQuery
} {

    const {clause: renderedClause, params: newParams} = transformClause(clause, params, 0);

    const sqlParts: string[] = [renderedClause];
    const allParams: any[] = newParams;
    let isBuilt = false;

    const add = (clause: string, params: any[] = []): void => {

        if (isBuilt) throw new Error('Cannot add to SQL after build() has been called');
        const {clause: renderedClause, params: newParams} = transformClause(clause, params, allParams.length);

        sqlParts.push(renderedClause);
        allParams.push(...newParams);

    };

    const build = (): PgQuery => {

        isBuilt = true;
        return {
            text: sqlParts.join('\n'),
            values: allParams,
        };

    };

    return {add, build};

}

function transformClause(
    clause: string,
    inputParams: any[],
    startIndex: number
): { clause: string, params: any[] } {

    let paramIndex = 0;
    let paramCounter = startIndex;
    const outputParams: any[] = [];

    const transformed = clause.replace(/\?\??/g, (match) => {

        const param = inputParams[paramIndex++];

        if (match === '??') {

            if (!Array.isArray(param)) {

                throw new Error(`Expected array for "??" placeholder in clause "${clause}"`);

            }

            if (param.length === 0) {

                throw new Error(`Cannot use empty array with "??" placeholder in clause "${clause}"`);

            }

            const placeholders = param.map(() => `$${++paramCounter}`);

            outputParams.push(...param);
            return placeholders.join(', ');

        }

        outputParams.push(param);
        return `$${++paramCounter}`;

    });

    if (paramIndex !== inputParams.length) {

        throw new Error(`Mismatch between placeholders and parameters for clause "${clause}"`);

    }

    return {clause: transformed.trim(), params: outputParams};

}
