export type SqlQuery = {
    text: string
    values: any[]
};

export {sql} from './sql';
export {sqlBuilder} from './sqlBuilder';
export {buildInsert} from './buildInsert';
export {buildInsertMany} from './buildInsertMany';
export {buildUpdate} from './buildUpdate';
export {buildWhere} from './buildWhere';
