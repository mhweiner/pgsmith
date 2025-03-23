export type SqlQuery = {
    text: string
    values: any[]
};

export {sql} from './sql';
export {sqlBuilder} from './sqlBuilder';
export {buildInsert} from './buildInsert';
