export interface ApiResult<T> {
  code: number;
  msg: string;
  data: T;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  pageNo: number;
  pageSize: number;
}

export type DateTimeString = string;
export type DecimalValue = string | number;
export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue>;
