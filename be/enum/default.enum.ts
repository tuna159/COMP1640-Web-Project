export enum EUserRole {
  ADMIN = 1,
  QA_MANAGER = 2,
  QA_COORDINATOR = 3,
  STAFF = 4,
}

export enum EGender {
  PREFER_NOT_TO_SAY = 0,
  MALE = 1,
  FEMALE = 2,
}

export const REGEX_CONSTANT = {
  PASSWORD: /^[!@#\$%\^&\*\(\)_\-\+=\[\]\{\}\|\\;:'",\.<>\/\?a-zA-Z0-9]*$/,
};
