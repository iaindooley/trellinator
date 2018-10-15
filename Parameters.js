/*
*************************************************************************
Developed by: Sohail
Email: fazlrabbitech@gmail.com
Upwork: https://www.upwork.com/freelancers/~01708a206e84641c49
*************************************************************************
*/

//////////////////////////////////////////////////////////////////////////
var INFO_TAB_NAME_ = "InfoLog";
var TIME_OUT_LIMIT_ = 180;//seconds
var PROXY_URL_ = "https://www.theprocedurepeople.com/forward-gas-service/{script-id}";
var CONFIG_NAME_ = "Configuration";
var BOARD_DB_NAME_ = "BoardsDB";
var GLOBAL_COMMANDS_NAME_ = "Global Commands";
var GLOBAL_GROUP_NAME_ = "Global Command Groups";
var GLOBAL_GROUP_SEPARATOR_ = ";;;";
var GLOBAL_TIME_TRIGGER_PREFIX = "GlobalTimeTrigger_";
var MY_ID_KEY_ = "MY_ID";
var MY_USERNAME_KEY_ = "MY_USERNAME";
var FUNCTION_CONTINUE_INIT_ = "continueInitialization";
var FUNCTION_EDIT_DETECTION = "onEditDetected";
var ADD_MEM_TO_BRD_ = "addMemberToBoard";
var ADD_MEM_TO_ORG_BRD_ = "addToOrganizationBoard";
var REMOV_MEM_FROM_BRD_ = "removeMemberFromBoard";
var CRET_BRD_ = "createBoard";
var UPDT_BRD = "updateBoard";
var COPY_BRD_ = "copyBoard";
var RENAME_BRD = "action_update_board_name";
//-------------------------------------------------------------------
//TriggerLib Params
//////////////////////////////////////////////////////////////////////////
var QUEUE_TAB_NAME2_ = "ExecutionQueue";
var QUEUE_DATE_FORMAT = "yyyy-MM-dd HH:mm";
var PROCESS_QUEUE_FUNC_NAME_ = "processQueue";
var PROCESS_QUEUE_INTERVAL = 10;
//var INFO_TAB_NAME_ = "InfoLog";
var FUNC_DONE_STATUS_ = "DONE";
var FUNC_LOCK_STATUS_ = "LOCK";
var FUNCTION_NAME_IN_JSON_ = "functionName";
var PARAMETER_NAME_IN_JSON_ = "parameters";
var KEY_RUNNING_FUNCTION = "RUNNING_FUNCTION";//document properties, may have issues if made private
var KEY_SAFETY_STATUS = "SAFETY_STATUS";//
var KEY_ACTION_TIME = "ACTION_TIME";//
var SAFE_STATUS_ = "SAFE";
var UNSAFE_STATUS_ = "UNSAFE";
var TIME_OUT_LIMIT_TRIG_ = 120;//seconds
var LAST_QUEUE_COLUMN = "D";
var QUEUE_STATUS_COLUMN = 3;
var QUEUE_SIGNATURE_COLUMN = 4;
var TIME_FORMAT_ = "HH:mm";
//////////////////////////////////////////////////////////////////////////
//-------------------------------------------------------------------
var EXCLUDED_SHEET_NAMES = [INFO_TAB_NAME_ ,
                            CONFIG_NAME_ ,
                            BOARD_DB_NAME_ ,
                            QUEUE_TAB_NAME2_                            
                           ];
var CLEAR_TRIG_ACTION_LIST = ["Clear Triggers"];
var UPDATE_TRIG_ACTION_LIST = ["Update Triggers"];
var ACTION_LIST = [ "Time Trigger"];
//////////////////////////////////////////////////////////////////////////
