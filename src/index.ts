export type SqlQuery = {
    text: string
    values: any[]
};

export * from './sql';
export * from './sqlBuilder';
export * from './buildInsert';
export * from './buildInsertMany';
export * from './buildUpdate';
export * from './buildWhere';
