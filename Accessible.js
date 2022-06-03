//function init()
//function continueInit()
//function deleteWebhooks(boardID) 
//function doGetting(e) 
//function doPosting(notifText) 
//function showFailure(msg)
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
  
  flushInfoBuffer();
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
    if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
    {
        var deleteCount = 0;
        
        new Trellinator().boards().find(function(board)
        {
            if(!boardID || (boardID && (boardID == board.id())))
                return board;
            else
                return false;
        }).each(function(board)
        {
            new IterableCollection(WekanApi.get("boards/"+board.id()+"/integrations")).each(function(integration)
            {
                WekanApi.del("boards/"+board.id()+"/integrations/"+integration["_id"]);
                deleteCount++;
            });
        });

        writeInfo_(deleteCount + " WeKan integrations successfully deleted.");  
    }

    else
    {
        var trelloData = getTrelloKeys_();
        
        var webhooks = getWebhooksForToken_(trelloData);
        if (webhooks.length == 0)
        {
          writeInfo_("No webhooks found registered against token " + trelloData.token);  
          flushInfoBuffer();
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
    }
    
    flushInfoBuffer();
    return true;
  }
  catch(error)
  {
    writeInfo_("Webhook deletion " + error);
    flushInfoBuffer();
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

function thisIsMyToken(id)
{
    creds = TrelloApi.checkControlValues();
    //Only operate if the member removed was the same member that owns our token
    return (TrelloApi.get("tokens/"+creds.token+"/member").id == id);
}
////////////////////////////////////////////////////////////////////////////////////  
// This POST is what does all the hard work
function doPosting(notifText) 
{
  try
  {
    //var notifText = e.postData.contents;    
    var notifData = JSON.parse(notifText);
  }
  
  catch(e)
  {
    var postOut = HtmlService.createHtmlOutput("<p>Processed Notification</p>")
    return postOut;
  }
  
  if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
  {
    //currently we ignore any member level notifications, we can't do 
    //much with them until WeKan supports REST API for non-author
    //of the board
    var process_member_events = false;
    writeInfo_("Not processing member event for WeKan API");
  }
  else
  {
    var actionData = notifData.action;
  //----------------------------------------------
    //var parseFlag = false;
    var actionType = actionData.type;
    var actionID = actionData.id;
    var process_member_events = true;
    //var successFlag = false;
    writeInfo_("Examining Notification: [" + actionID + "-" + actionType + "]");
  }


  //"addMemberToBoard"
  if(process_member_events && (actionType == ADD_MEM_TO_BRD_) && (notifData.model.id == actionData.member.id))
  {
    writeInfo_("Calling add member to board...process");
    createNewBoardSheet_(actionData);
    writeInfo_("Execute notification command for Trellinator user added to board as a member");
    executeNotificationCommand_(notifData);
    flushInfoBuffer();
  }
  //"removeMemberFromBoard"
  //Only operate if the member removed was the same member that owns our token
  if(process_member_events && (actionType == REMOV_MEM_FROM_BRD_) && (notifData.model.id == actionData.data.board.id) && thisIsMyToken(actionData.data.idMember))
  {
      removeBoardSheet_(actionData);
  }

  //"createBoard"
  else if(process_member_events && ((actionType == CRET_BRD_)||(actionType == COPY_BRD_)) && notifData.model.id == actionData.idMemberCreator)
  {
    writeInfo_("Calling board creation...process");
    createNewBoardSheet_(actionData);
  }
  //"updateBoard" with "action_update_board_name"
  else if(process_member_events && actionType == UPDT_BRD && actionData.display.translationKey == RENAME_BRD && notifData.model.id == actionData.data.board.id)
  {
    //writeInfo_(notifText);
    renameBoardSheet_(actionData);    
  }

  //all others board level notification
  else if(!process_member_events || ((notifData.model && actionData.data.board) && (notifData.model.id == actionData.data.board.id)))
  {
    writeInfo_("Yes, this is a board level notification...");
    executeNotificationCommand_(notifData);
    flushInfoBuffer();
  }
  else
  {
    //ignore    
    writeInfo_("Notification: [" + actionType + "-" + actionID + "] ignored (being not at the board level).");
  }
  
  var postOut = HtmlService.createHtmlOutput("<p>Processed Notification</p>")
  return postOut;
}
////////////////////////////////////////////////////////////////////
function showFailure(msg)
{
  SpreadsheetApp.getUi().alert(msg);
}
