export enum ErrorMessage {
  GMAIL_ALREADY_EXITS = 'Gmail already exits',
  GMAIL_INCORRECT = 'error.USER_NAME_INCORRECT',
  PASSWORD_INCORRECT = 'error.PASSWORD_INCORRECT',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  ACCOUNT_NOT_EXISTS = 'error.ACCOUNT_NOT_EXISTS',
  IDEA_NOT_EXIST = 'error.IDEA_DOES_NOT_EXIST',
  MIN_LENGTH_1 = 'error.MIN_LENGTH_1',
  YOU_DO_NOT_HAVE_PERMISSION_TO_POST_IDEA = 'error.YOU_DO_NOT_HAVE_PERMISSION_TO_POST_IDEA',
  FILE_PDF_MAX = 'error.FILE_PDF_MAX',
  YOU_DO_NOT_HAVE_RIGHTS_TO_REGISTER_USER_ACCOUNTS = 'error.YOU_DO_NOT_HAVE_RIGHTS_TO_REGISTER_USER_ACCOUNTS',
  IDEA_REACTION_PERMISSION = 'error.YOU_DO_NOT_HAVE_PERMISSION_TO_REACT_IDEA',
  REACTION_TYPE_NOT_EXISTS = 'error.REACTION_TYPE_NOT_EXISTS',
  REACTION_NOT_EXISTS = 'error.REACTION_NOT_EXISTS',
  REACTION_ALREADY_EXISTS = 'error.YOU_CAN_NOT_GIVE_THE_SAME_REACTION',
  YOU_DO_NOT_HAVE_PERMISSION_EDIT_ACCOUNT = 'error.YOU_DO_NOT_HAVE_PERMISSION_EDIT_ACCOUNT',
  INVALID_PARAM = 'INVALID_PARAM',
  USER_NOT_EXISTS = 'error.USER_NOT_EXISTS',
  MANAGER_NOT_EXISTS = 'error.MANAGER_NOT_EXISTS',
  EVENT_NOT_EXIST = 'error.EVENT_NOT_EXIST',
  EVENT_PERMISSION = 'error.YOU_DO_NOT_HAVE_PERMISSION_TO_EVENT',
  EVENT_NOT_EMPTY = 'error.EVENT_IS_NOT_EMPTY',
  INVALID_CLOSURE_DATES = 'error.FIRST_CLOSURE_DATE_NEEDS_TO_BE_LESS_THAN_FINAL_CLOSURE_DATE',
  INVALID_FIRST_CLOSURE_DATE = 'error.FIRST_CLOSURE_DATE_MUST_BE_GREATER_THAN_OR_EQUAL_TO_CURRENT_DATE',
  CREATE_DATE_NEEDS_TO_BE_LESS_THAN_THE_START_DATE = 'error.CREATE_DATE_NEEDS_TO_BE_LESS_THAN_THE_START_DATE',
  CREATE_DATE_NEEDS_TO_BE_LESS_THAN_FINAL_CLOSURE_DATE = 'error.CREATE_DATE_NEEDS_TO_BE_LESS_THAN_FINAL_CLOSURE_DATE',
  CATEGORY_NOT_EMPTY = 'error.CATEGORY_IS_NOT_EMPTY',
  CATEGORY_PERMISSION = 'error.YOU_DO_NOT_HAVE_PERMISSION_TO_CATEGORY',
  CATEGORY_NOT_EXISTS = 'error.CATEGORY_NOT_EXISTS',
  ALREADY_DELETED = 'error.ACCOUNT_ALREADY_DELETED',
  YOU_DO_NOT_HAVE_PERMISSION_TO_UPDATE_IDEA = 'error.YOU_DO_NOT_HAVE_PERMISSION_TO_UPDATE_IDEA',
  YOU_DO_NOT_HAVE_PERMISSION_TO_DELETE_IDEA = 'error.YOU_DO_NOT_HAVE_PERMISSION_TO_DELETE_IDEA',
  UPDATE_POST_PERMISSION_DENIED = 'error.UPDATE_POST_PERMISSION_DENIED',
  YOU_DO_NOT_HAVE_PERMISSION_TO_MANAGE_ACCOUNT = 'error.YOU_DO_NOT_HAVE_PERMISSION_TO_MANAGE_ACCOUNT',
  ACCOUNT_ALREADY_DELETED = 'error.ACCOUNT_ALREADY_DELETED',
  YOU_DO_NOT_HAVE_RIGHTS_TO_MANAGE_USER_ACCOUNTS = 'error.YOU_DO_NOT_HAVE_RIGHTS_TO_MANAGE_USER_ACCOUNTS',
  DATA_DOWNLOAD_PERMISSION = 'error.YOU_DO_NOT_HAVE_PERMISSION_TO_DOWNLOAD_DATA',
  DATA_DOWNLOAD_DATE_TIME = 'error.FINAL_CLOSURE_DATE_STILL_AVAILABLE',
  DATA_DOWNLOAD_FAILED = 'error.FINAL_CLOSURE_DATE_STILL_AVAILABLE',
  CREATE_COMMENT_PERMISSION = 'error.YOU_DO_NOT_HAVE_PERMISSION_TO_COMMENT',
  FINAL_CLOSURE_DATE_UNAVAILABLE = 'error.EVENT_FINAL_CLOSURE_DATE_IS_LESS_THAN_CURRENT_DATE',
  FIRST_CLOSURE_DATE_UNAVAILABLE = 'error.EVENT_FIST_CLOSURE_DATE_IS_LESS_THAN_CURRENT_DATE',
  COMMENT_DELETE_PERMISSION = 'error.YOU_DO_NOT_HAVE_PERMISSION_TO_DELETE_COMMENT',
  COMMENT_UPDATE_PERMISSION = 'error.YOU_DO_NOT_HAVE_PERMISSION_TO_UPDATE_COMMENT',
  COMMENT_NOT_EXIST = 'error.COMMENT_NOT_EXIST',
  DEPARTMENT_NOT_EXISTS = 'error.DEPARTMENT_DOES_NOT_EXISTS',
  DEPARTMENT_PERMISSION = 'error.YOU_DO_NOT_HAVE_PERMISSION_TO_DEPARTMENT',
  DEPARTMENT_MANAGER_EXISTS = 'error.MANAGER_IS_ALREADY_ASSIGNED_ANOTHER_DEPARTMENT',
  DEPARTMENT_NOT_EMPTY = 'error.DEPARTMENT_IS_NOT_EMPTY',
  EVENT_HAS_EXPIRED = 'error.EVENT_HAS_EXPIRED ',
  ADMIN_CAN_NOT_UPDATE_PROFILE = 'error.ADMIN_CAN_NOT_UPDATE_PROFILE',
  PLEASE_ENTER_YOUR_NEW_PASSWORD = 'error.PLEASE_ENTER_YOUR_NEW_PASSWORD',
}
