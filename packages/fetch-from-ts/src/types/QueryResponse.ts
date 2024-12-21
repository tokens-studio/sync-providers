export type QueryResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};
