export type PgQuery = {
    text: string
    values: any[]
};

export {sql} from './sql';
export {sqlBuilder} from './sqlBuilder';
