// Base PostgreSQL types
export type PgBaseType =
  // numeric
  | 'smallint' | 'int2'
  | 'integer' | 'int' | 'int4'
  | 'bigint' | 'int8'
  | 'decimal' | 'numeric'
  | 'real' | 'float4'
  | 'double precision' | 'float8'
  | 'serial' | 'serial4'
  | 'bigserial' | 'serial8'

  // boolean
  | 'boolean' | 'bool'

  // text
  | 'text'
  | 'varchar' | 'character varying'
  | 'char' | 'character'

  // time-related
  | 'timestamp'
  | 'timestamp without time zone'
  | 'timestamp with time zone' | 'timestamptz'
  | 'date'
  | 'time'
  | 'interval'

  // binary / data
  | 'bytea'

  // network
  | 'inet' | 'cidr' | 'macaddr'

  // json
  | 'json' | 'jsonb'

  // uuid
  | 'uuid'

  // misc
  | 'money'
  | 'oid'
  | 'xml'
  | 'tsvector' | 'tsquery';

// A PostgreSQL type can be either a base type or an array of any base type
export type PgType = PgBaseType | `${PgBaseType}[]`;
