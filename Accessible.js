//function init()
//function continueInit()
//function deleteWebhooks(boardID) 
//function doGetting(e) 
//function doPosting(notifText) 
////////////////////////////////////////////////////////////////////
function init()
{
  try
  {
    var tStart = (new Date()).valueOf();
    createEditDetector_();
    registerWebhook_();//for member
    createBoardDBSheet_();
    storeCurrentUserBoards_();
    var completeFlag = registerAllBoards_(tStart);    
    if(completeFlag)
    {
      writeInfo_("Trellinator Initialization complete");
    }
  }
  catch(error)
  {
    writeInfo_("Trellinator Initialization " + error);
  }
}
////////////////////////////////////////////////////////////////////
function continueInit()
{
  try
  {
    var tStart = (new Date()).valueOf();
    writeInfo_("Trellinator Initialization continued...");
    var completeFlag = registerAllBoards_(tStart);    
    if(completeFlag)
    {
      writeInfo_("Trellinator Remaining Initialization complete");
      removeSchedule_(FUNCTION_CONTINUE_INIT_);
    }
  }
  catch(error)
  {
    writeInfo_("Trellinator Remaining Initialization " + error);
  }
}
////////////////////////////////////////////////////////////////////
function deleteWebhooks(boardID) 
{  
  try
  {
    var trelloData = getTrelloKeys_();
    
    var webhooks = getWebhooksForToken_(trelloData);
    if (webhooks.length == 0)
    {
      writeInfo_("No webhooks found registered against token " + trelloData.token);  
      return true;
    }  
    
    var deleteCount = 0;
    var params = getFetchParameters_("delete");
    
    for (var i =0; i < webhooks.length;i++) 
    {    
      var url = "https://api.trello.com/1/token/" + trelloData.token + "/webhooks/" + webhooks[i].id + "?key=" + trelloData.key;
      if(!boardID)//delete all
      {     
        Utilities.sleep(5);
        var resp = UrlFetchApp.fetch(url, params);      
        if (resp.getResponseCode() == 200) 
        {        
          deleteCount++;
        }  
      }//condition for all deletion ends
      
      else if(boardID == webhooks[i].idModel)//delete only one with matching board criteria
      {      
        Utilities.sleep(5);
        var resp = UrlFetchApp.fetch(url, params);      
        if (resp.getResponseCode() == 200) 
        {
          deleteCount++;
        }        
        writeInfo_("Board webhook successfully removed.");  
        return true;//no more matching required 
      }//condition for given card id ends
    }//parsing loop ends
    
    writeInfo_("Out of total: " + webhooks.length + " webhook(s), " + deleteCount + " successfully deleted.");  
    return true;
  }
  catch(error)
  {
    writeInfo_("Webhook deletion " + error);
    return false;
  }
}  
////////////////////////////////////////////////////////////////////
// -----------------------------------------------------------------
// Functions to process Webapp requests:
// -----------------------------------------------------------------


////////////////////////////////////////////////////////////////////////////////////
// This GET is needed for Trello to make sure that the Web-app exists:
function doGetting(e) 
{
  var out = HtmlService.createHtmlOutput("<p>Yes, it is Trellinator world!</p>");
  //writeInfo_("doGet running....");                          
  return out;
}  
////////////////////////////////////////////////////////////////////////////////////  
// This POST is what does all the hard work
function doPosting(notifText) 
{   
  //var notifText = e.postData.contents;    
  var notifData = JSON.parse(notifText);
  var actionData = notifData.action;
//----------------------------------------------
  //var parseFlag = false;
  var actionType = actionData.type;
  var actionID = actionData.id;
  //var successFlag = false;
  writeInfo_("Examining Notification: [" + actionID + "-" + actionType + "]");
  
  //"addMemberToBoard"
  if( actionType == ADD_MEM_TO_BRD_ && notifData.model.id == actionData.member.id)
  {
    //writeInfo_("Calling add member to board...process");
    createNewBoardSheet_(actionData);
  }
  //"createBoard"
  else if(actionType == CRET_BRD_ && notifData.model.id == actionData.idMemberCreator)
  {
    //writeInfo_("Calling board creation...process");
    createNewBoardSheet_(actionData);
  }
  //"updateBoard" with "action_update_board_name"
  else if(actionType == UPDT_BRD && actionData.display.translationKey == RENAME_BRD && notifData.model.id == actionData.data.board.id)
  {
    //writeInfo_(notifText);
    renameBoardSheet_(actionData);    
  }

  //all others board level notification
  else if(notifData.model.id == actionData.data.board.id)
  {
    writeInfo_("Yes, this is a board level notification...");
    executeNotificationCommand_(notifData);
  }
  else
  {
    //ignore    
    writeInfo_("Notification: [" + actionType + "-" + actionID + "] ignored (being not at the board level).");
  }
  var postOut = HtmlService.createHtmlOutput("<p>Processed Notification</p>")
  flushInfoBuffer();
  return postOut;
}
////////////////////////////////////////////////////////////////////