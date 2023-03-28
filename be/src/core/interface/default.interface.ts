export interface IUserData {
  user_id: string;
  role_id: number;
  [key: string]: any;
}

export interface IPaginationQuery {
  page: number;
  limit: number;
  skip?: number;
  [key: string]: any;
}
