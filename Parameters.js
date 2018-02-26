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
var MY_ID_KEY_ = "MY_ID";
var MY_USERNAME_KEY_ = "MY_USERNAME";
var FUNCTION_CONTINUE_INIT_ = "continueInitialization";
var ADD_MEM_TO_BRD_ = "addMemberToBoard";
//-------------------------------------------------------------------
//TriggerLib Params
//////////////////////////////////////////////////////////////////////////
var QUEUE_TAB_NAME_ = "ExecutionQueue";
var PROCESS_QUEUE_FUNC_NAME_ = "processQueue";
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
var DATE_FORMAT_ = "dd/MM/yyyy hh:mm";
//////////////////////////////////////////////////////////////////////////
//-------------------------------------------------------------------
var ACTION_LIST = ["addAdminToBoard",
"addAdminToOrganization",
"addAttachmentToCard",
"addBoardsPinnedToMember",
"addChecklistToCard",
"addLabelToCard",
"addMemberToBoard",
"addMemberToCard",
"addMemberToOrganization",
"addToOrganizationBoard",
"commentCard",
"convertToCardFromCheckItem",
"copyBoard",
"copyCard",
"copyChecklist",
"createLabel",
"copyCommentCard",
"createBoard",
"createBoardInvitation",
"createBoardPreference",
"createCard",
"createChecklist",
"createList",
"createOrganization",
"createOrganizationInvitation",
"deleteAttachmentFromCard",
"deleteBoardInvitation",
"deleteCard",
"deleteCheckItem",
"deleteLabel",
"deleteOrganizationInvitation",
"disablePlugin",
"disablePowerUp",
"emailCard",
"enablePlugin",
"enablePowerUp",
"makeAdminOfBoard",
"makeAdminOfOrganization",
"makeNormalMemberOfBoard",
"makeNormalMemberOfOrganization",
"makeObserverOfBoard",
"memberJoinedTrello",
"moveCardFromBoard",
"moveCardToBoard",
"moveListFromBoard",
"moveListToBoard",
"removeAdminFromBoard",
"removeAdminFromOrganization",
"removeBoardsPinnedFromMember",
"removeChecklistFromCard",
"removeFromOrganizationBoard",
"removeLabelFromCard",
"removeMemberFromBoard",
"removeMemberFromCard",
"removeMemberFromOrganization",
"unconfirmedBoardInvitation",
"unconfirmedOrganizationInvitation",
"updateBoard",
"updateCard",
"updateCheckItem",
"updateCheckItemStateOnCard",
"updateChecklist",
"updateLabel",
"updateList",
"updateMember",
"updateOrganization",
"voteOnCard"
];
//////////////////////////////////////////////////////////////////////////