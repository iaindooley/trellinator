//function registerWebhook_(boardID) 
//function getMyMemberID_()
//function getTrelloKeys_()
//function constructTrelloURL_(parameterURL)
//function getFetchParameters_(methodType)
//function writeInfo_(msg)
//function getWebhooksForToken_(trelloData) 
//function createBoardDBSheet_()
//function listCurrentUserBoards_() 
//function storeCurrentUserBoards_()
//function registerAllBoards_(tStart)
//function createSheetByName_(shName)
//function createGlobalSheet_()
//function createDropDown_(currSheet, cellA1Notation, dropdownData)
//function isTimeLimitApproaching_(tStart)
//function createSchedule_(funcName, minutes, oneTimeFlag)
//function removeSchedule_(funcName)
//function createNewBoardSheet_(actionData)
//function executeNotificationCommand_(notifData)
//function getAlphabeticalOrder_(currSheet)
//function renameBoardSheet_(actionData)
//function createGlobalGroupSheet_()
//function checkExecutionCriteria_(includeList, excludeList, boardName)
//function getBoardNames4mGroup_(groupName)
//function cleanList_(strList)
//function createEditDetector_()
//function getAllBoards4Execution_(includeList, excludeList)
//function getBoardData_(sheetList)
///////////////////////////////////////////////////////////////////////////////////
function registerWebhook_(boardID) 
{
  try
  {
    //boardID is optional here
    var url = ScriptApp.getService().getUrl();             

    if (url == null || url == "") 
    {    
      Browser.msgBox("Please follow instructions on how to publish the script as a web-app");
      return false;    
    }   
    //web app url pattern
    //https://script.google.com/a/macros/workingsoftware.com.au/s/AKfycbxJAzKDhm2EJbtqigVHt7SJfdVTxa2F3h82Wl8MRdPT3IzoyLI/exec
    var urlParts = url.split("/");
    var scriptID = urlParts[urlParts.length - 2];
    var proxyURL = PROXY_URL_.replace("{script-id}", scriptID);
    var modelID = (!boardID) ? getMyMemberID_() : boardID;//either member id or board id
    //var error = getTrelloKeys_();
    var trelloUrl = constructTrelloURL_("webhooks/?callbackURL=" + encodeURIComponent(proxyURL) + "&idModel=" + modelID);
    var params = getFetchParameters_("post");
    Utilities.sleep(5);
    var resp = UrlFetchApp.fetch(trelloUrl, params);
    //writeInfo_(resp.getResponseCode() + ":" + resp.getContentText());
    var respText = resp.getContentText();
    var respCode = resp.getResponseCode();
    var entityMsg = (!boardID) ? " for member." : " for board.";
    if (respCode == 200) 
    {
      writeInfo_("Webhook successfully registered" + entityMsg);// + "\n" + respText);
      if(boardID)//don't write member id
      {        
        //appendToModelDB_(modelSheet, modelID);
        //modelSheet.getRange(modelSheet.getLastRow() + 1, 1).setValue(modelID);//there are multiple columns now
      }
      return true;
    }  
    else if(respText.indexOf("did not return 200 status code, got 403") > 0) 
    {
      writeInfo_("Webhook registration failed - HTTP:" + respCode + ":"
      + " It looks like you need to republish your script with the correct authorities. Please refer to the section in the spreadsheet about generation webhooks. Response from Trello was: "
      + respText);
      return false;
    }  
    else if(respText.indexOf("A webhook with that callback, model, and token already exists") > -1)
    {
      writeInfo_("Webhook already exists" + entityMsg);
      return true;
    }
    else 
    {
      writeInfo_("Webhook registration failed - HTTP:" + respCode + ":" + respText);      
      return false;
    }
  }
  catch(e)
  {
    writeInfo_("Webhook registration..." + e);
    return false;
  }
}
///////////////////////////////////////////////////////////////////////////////////
function getMyMemberID_()
{
  try
  {
    
    //https://api.trello.com/1/members/bobtester?fields=id
    var trelloURL = constructTrelloURL_("members/me?fields=id,username");
    var params = getFetchParameters_("get");
    Utilities.sleep(5);
    var resp = UrlFetchApp.fetch(trelloURL, params);
    if(resp.getResponseCode() != 200)
    {
      throw resp.getContentText();
    }
    //else continue
    var value = JSON.parse(resp.getContentText());
    Utilities.sleep(5);
    PropertiesService.getUserProperties().setProperty(MY_ID_KEY_, value.id);
    Utilities.sleep(5);
    PropertiesService.getUserProperties().setProperty(MY_USERNAME_KEY_, value.username);
    
    writeInfo_(value.id + ": " + value.username);
    return value.id;
  }
  catch(error)
  {
    writeInfo_("Getting Trello member ID " + error);
    return null;
  }
}
///////////////////////////////////////////////////////////////////////////////////
function getTrelloKeys_()
{  
  var trelloData = Trellinator.fastGetSheetByName(CONFIG_NAME_).getRange("B2:B3").getValues();
  
  var appKey = (trelloData[0][0] + "").trim();
  
  if(appKey == "") 
  {
    throw "Trello Key not found in " + CONFIG_NAME_ + " tab.";
  }  
    
  var token = (trelloData[1][0] + "").trim();
  if(token == "") 
  {
    throw "Trello Token not found in " + CONFIG_NAME_ + " tab.";
  }  
  //both found
  return {key: appKey,
          token: token,
          err:""};  
} 
///////////////////////////////////////////////////////////////////////////////////
function constructTrelloURL_(parameterURL)
{
    return TrelloApi.constructTrelloURL(parameterURL);
}
///////////////////////////////////////////////////////////////////////////////////
function getFetchParameters_(methodType)
{
   return {"method": methodType,
           "muteHttpExceptions":true}
}
///////////////////////////////////////////////////////////////////////////////////
var write_info_buffer = new Array();
function flushInfoBuffer()
{
    try
    {
      var flush_lock  = LockService.getScriptLock();
      flush_lock.tryLock(1000);

      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var infoSheet = Trellinator.fastGetSheetByName(INFO_TAB_NAME_);
      
      if(!infoSheet)
      {
        infoSheet = ss.insertSheet(INFO_TAB_NAME_);
        Trellinator.fastGetSheetByName.sheets = null;
        infoSheet.appendRow(["Date" , "Description"]).setColumnWidth(2, 600).setFrozenRows(1);
        infoSheet.appendRow([ new Date(), INFO_TAB_NAME_ + " Created"]);
      }
      
      if(write_info_buffer.length)
      {
        infoSheet.appendRow([new Date(), JSON.stringify(write_info_buffer)]);
        var maxRow = infoSheet.getMaxRows();
        
        infoSheet.sort(1,false);
        
        if(maxRow > 500)
          infoSheet.deleteRows(501,maxRow-500);
      }

      flush_lock.releaseLock();
    }

    catch(e)
    {
      flush_lock.releaseLock();
    }
  
}
///////////////////////////////////////////////////////////////////////////////////
function sampleNotification(notification)
{
  writeInfo_(JSON.stringify(notification));
}
///////////////////////////////////////////////////////////////////////////////////
function writeInfo_(msg)
{
    write_info_buffer.push(msg);
}
///////////////////////////////////////////////////////////////////////////////////
function getWebhooksForToken_(trelloData) 
{  
  //https://api.trello.com/1/token/token-id/webhooks?key=key-string    
  var trelloURL = "https://api.trello.com/1/token/" + trelloData.token + "/webhooks?key=" + trelloData.key;
  var params = getFetchParameters_("get");
  Utilities.sleep(5);
  var resp = UrlFetchApp.fetch(trelloURL, params);
  var webhooks = JSON.parse(resp.getContentText());
  return webhooks;
}  
///////////////////////////////////////////////////////////////////////////////////
function createBoardDBSheet_()
{
  var brdSheet = createSheetByName_(BOARD_DB_NAME_);
  brdSheet.getRange("A1:B1").setValues([["Board Name", "Board ID"]])
  .setFontWeight("bold");
}
///////////////////////////////////////////////////////////////////////////////////
function listCurrentUserBoards_() 
{    
  //var tStart = new Date().valueOf();
  //var sheet = SpreadsheetApp.getActiveSheet();
  
//  var error = checkControlValues_(false,false);
//  if (error.err != "") {
//    writeInfo_(error.err);
//    return [];
//  }
  
  //tStart = showUpdateProgress_(tStart, sheet, msgList);
  
  var url = constructTrelloURL_("members/me/boards?filter=open");
  var params = getFetchParameters_("get");
  Utilities.sleep(5);
  var resp = UrlFetchApp.fetch(url, params);
  var values = JSON.parse(resp.getContentText())
  writeInfo_("No of Boards retrieved: " + values.length);
  //tStart = showUpdateProgress_(tStart, sheet, msgList);
  return values;
}
///////////////////////////////////////////////////////////////////////////////////
function storeCurrentUserBoards_()
{
  var boards = listCurrentUserBoards_();
  var boardData = [];
  for(var i = 0; i < boards.length; i++)
  {
    boardData.push([boards[i].name, boards[i].id])
  }//loop ends  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var brdSheet = Trellinator.fastGetSheetByName(BOARD_DB_NAME_);
  brdSheet.getRange(2, 1, boardData.length, 2)
  .setValues(boardData)
  .sort({column: 1, ascending: false});
}
///////////////////////////////////////////////////////////////////////////////////
function registerAllBoards_(tStart)
{
  try
  {    
    var completeFlag = false;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var brdSheet = Trellinator.fastGetSheetByName(BOARD_DB_NAME_); 
    var boardList = brdSheet.getDataRange().getValues();
    //var singleList = getSingleColumn_(modelList, 1);
    if(boardList.length < 2)
    {
      writeInfo_("No more boards remaining to register");
      ss.deleteSheet(brdSheet);
      Trellinator.fastGetSheetByName.sheets = null;
      return;
    }
    //continue
    var totalBoards = boardList.length - 1;//take care of headings
    for(var i = totalBoards; i > 0; i--)//skip headings, go reverse so that deletion of rows don't make effect
    {
      //Utilities.sleep(5000);//dummy for testing
      if(isTimeLimitApproaching_(tStart))
      {
        createSchedule_(FUNCTION_CONTINUE_INIT_, 1, true);     
        return completeFlag;
      }
      var success = registerWebhook_(boardList[i][1]);    
      if(success)
      {
        var boardSheetName = boardList[i][0] + " [" + boardList[i][1] + "]";
        var currBSheet = createSheetByName_(boardSheetName);      
        currBSheet.getRange("A1:C1").setValues([["Function Call", "Time Trigger", "Clear Triggers"]])
        .setFontWeight("bold");
        currBSheet.setColumnWidth(1, 250)
        .setColumnWidth(2, 200); 
        createDropDown_(currBSheet, "B2", ACTION_LIST);
        createDropDown_(currBSheet, "C2", CLEAR_TRIG_ACTION_LIST);
        brdSheet.deleteRow(i+1);
      }
      //tStart = showUpdateProgress_(tStart, sheet, msgList);
    }//loop ends  
    //create global sheet
    createGlobalSheet_();
    createGlobalGroupSheet_();
    //remove board sheet
    ss.deleteSheet(brdSheet);
    Trellinator.fastGetSheetByName.sheets = null;
    completeFlag = true;
    return completeFlag;
  }
  catch(error)
  {
    writeInfo_("Registering all boards webhooks " + error);
    return completeFlag;
  }
}
///////////////////////////////////////////////////////////////////////////////////
function createSheetByName_(shName)
{
  var shName = truncateBoardNameTo100Characters(shName);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var nuSheet = Trellinator.fastGetSheetByName(shName);
  //remove existing or clear data
  if(nuSheet)
  {
//If the board already exists just leave it alone, useful for reinit
//    nuSheet.clear();        
  }
  else
  {//create fresh
    var totalSheets = ss.getSheets().length;
    
    nuSheet = ss.insertSheet(shName, totalSheets);
    Trellinator.fastGetSheetByName.sheets = null;
    //remove extra default columns and rows
    nuSheet.deleteColumns(6, 21);
    nuSheet.deleteRows(101, 900);
  }
  
  return nuSheet;  
}

function truncateBoardNameTo100Characters(name)
{
    var ret = name;
    var SHEET_NAME_MAX = 100;

    if(name.length > SHEET_NAME_MAX)
    {
        if(parts = new RegExp("(.+) \\[(.+)\\]").exec(name))
        {
            var allowed_length = SHEET_NAME_MAX - (parts[2].length+3);//the length of the board ID, one space and 2 square brackets
            ret = parts[1].substring(0,allowed_length)+" ["+parts[2]+"]";
        }

        else
            ret = name.substring(0,SHEET_NAME_MAX);
    }

    return ret;
}

///////////////////////////////////////////////////////////////////////////////////
function createGlobalSheet_()
{
  var globalSheet = createSheetByName_(GLOBAL_COMMANDS_NAME_);
  globalSheet.getRange("A1:E1").setValues([["Include", "Exclude", "Function Call", "Time Trigger", CLEAR_TRIG_ACTION_LIST[0] ]])
  .setFontWeight("bold");
  //globalSheet = SpreadsheetApp.getActiveSheet();
  globalSheet.setColumnWidth(1, 200)
  .setColumnWidth(2, 200)
  .setColumnWidth(3, 150)
  .setColumnWidth(4, 150)
  .getRange("A:B").setWrap(true);
  
  createDropDown_(globalSheet, "D2", ACTION_LIST);
  createDropDown_(globalSheet, "E2", CLEAR_TRIG_ACTION_LIST);
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var configSheet = Trellinator.fastGetSheetByName(CONFIG_NAME_);  
  globalSheet.activate();
  ss.moveActiveSheet(configSheet.getIndex() + 1);
  configSheet.activate();
}
///////////////////////////////////////////////////////////////////////////////////
function createDropDown_(currSheet, cellA1Notation, dropdownData)
{
    var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(dropdownData, true)
    .setAllowInvalid(false)
    .build();
    currSheet.getRange(cellA1Notation).setDataValidation(rule);
}
//////////////////////////////////////////////////////////////////////////////
function isTimeLimitApproaching_(tStart)
{
  var tEnd = new Date().valueOf();
  var diff = (tEnd - tStart)/1000;
  //writeInfo("exec-time:" + diff);
  if(diff > TIME_OUT_LIMIT_)
  {
    return true;
  }
 return false; 
}
//////////////////////////////////////////////////////////////////////////////
function createSchedule_(funcName, minutes, oneTimeFlag)
{
  removeSchedule_(funcName);
  
  var ssTimeZone = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  if(!oneTimeFlag)
  {
    ScriptApp.newTrigger(funcName)
    .timeBased()
    .inTimezone(ssTimeZone)
    .everyMinutes(minutes)
    .create();
  }
  else
  {
    ScriptApp.newTrigger(funcName)
    .timeBased()
    .inTimezone(ssTimeZone)
    .after(minutes)
    .create();
  }
}
//////////////////////////////////////////////////////////////////////////////
function removeSchedule_(funcName)
{
  var trigList = ScriptApp.getProjectTriggers();
  for(var i = 0; i < trigList.length; i++)
  {
    if(trigList[i].getHandlerFunction() == funcName)
    {
      ScriptApp.deleteTrigger(trigList[i]);
    }
  }//search for existing triggers ends

}
//////////////////////////////////////////////////////////////////////////////
function createNewBoardSheet_(actionData)
{
  try
  {
    var boardID = actionData.data.board.id;
    var success = registerWebhook_(boardID);    
    if(success)
    {
      success = false;
      var boardSheetName = actionData.data.board.name + " [" + boardID + "]";
      var currBSheet = createSheetByName_(boardSheetName);      
      currBSheet.getRange("A1:B1").setValues([["Function Call","Time Trigger"]])
      .setFontWeight("bold");
      currBSheet.setColumnWidth(1, 250)
      .setColumnWidth(2, 200); 
      createDropDown_(currBSheet, "A2", ACTION_LIST);    
      timeTrigger4NewBoard_(boardID)
      getAlphabeticalOrder_(currBSheet);
      success = true;
    }
    return success;
  }
  catch(error)
  {
    writeInfo_("Board webhook, time trigger and sheet creation " + error);
    return success;
  }
  
}
//////////////////////////////////////////////////////////////////////////////
function addBoardToGlobalCommandGroup(board,group_name)
{  
    return Trellinator.addBoardToGlobalCommandGroup(board,group_name);
}

//////////////////////////////////////////////////////////////////////////////
function timeTrigger4NewBoard_(boardID)
{  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var globSheet = Trellinator.fastGetSheetByName(GLOBAL_COMMANDS_NAME_);  
  var globData = globSheet.getDataRange().getValues();
  var globTrigCount = 0;
  for(var row = 1; row < globData.length; row++)
  {
    var funcName = globData[row][2] + "";
    var includeStr = (globData[row][0] + "").trim();
    var excludeStr = (globData[row][1] + "").trim();
    var boardList = getAllBoards4Execution_(includeStr, excludeStr);
    
    if(globData[row][3] != ACTION_LIST[0])
    {
      continue;
    }
    
    var incflag = false;
    
    for(var i = 0;i < boardList.length;i++)
    {
      if(boardList[i].id == boardID)
        incflag = true;
    }
        
    if(!incflag)
      continue;
    
    //now processing those Time trigger rows that have no include/exclude groups
    var currStr = [GLOBAL_COMMANDS_NAME_ , ACTION_LIST[0], funcName].join(",");
    var globSignat = createMd5String_(currStr);
    var globTimeStamp = findTimeStamp_(globSignat);

    var signatList = [];    
    var funcObj = {functionName : funcName, parameters : {id : boardID} };
    var signat =  globSignat + "/" + boardID;     
    signatList.push(signat);
    var signatFlag = checkFullSignature_(signat);
    if(!signatFlag)
    {
      push(globTimeStamp, funcObj, signat);       
      globTrigCount++;
    }
  }//loop for all global commmands ends
  writeInfo_("Total " + globTrigCount + " time-trigger(s) added for new board.");
}
//////////////////////////////////////////////////////////////////////////////
function executeNotificationCommand_(notifData)
{
  try
  {
    var execution_lock  = LockService.getScriptLock();
    execution_lock.tryLock(1000);
    var successFlag = false;
    var quFlag = false;
    var tStart = (new Date()).valueOf();
    var boardSheetName = notifData.action.data.board.name + " [" + notifData.action.data.board.id + "]";
    writeInfo_("Processing notification for board: " + boardSheetName);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if((typeof SKIP_BOARD_LEVEL_COMMANDS === 'undefined') || (typeof SKIP_BOARD_LEVEL_COMMANDS !== 'undefined') && !SKIP_BOARD_LEVEL_COMMANDS)
    {
        var brdSheet = Trellinator.fastGetSheetByName(boardSheetName);
        if(!brdSheet)
        {
          throw "Board sheet named [" + boardSheetName + "] not found";
        }
        var boardMap = brdSheet.getDataRange().getValues();
        execution_lock.releaseLock();
        
        for(var i = 1; i < boardMap.length; i++)
        {
          var mapRow = boardMap[i];
    
          var functionName = mapRow[0] + "";        
          var timeTrigger  = mapRow[1] + "";        
          try
          {
              if(functionName == "")
              {
                  continue;
              }
              
              if(timeTrigger != "")
              {
                  continue;
              }
              //should execute or push to queue
              if(isTimeLimitApproaching_(tStart))
              {
                writeInfo_("time limit approached...can't execute function: " + functionName);
                quFlag = true;
                var funcObj = { "functionName" : functionName, "parameters" : notifData};
                push(new Date(), funcObj);
                continue;              
              }     
              //else
              writeInfo_("executing realtime function: " + functionName);
              var currStr = boardSheetName+functionName;
              var signatStr = createMd5String_(currStr);
              writeInfo_(currStr + "\n" + signatStr);
              this[functionName](notifData, signatStr);
          }
          catch(err)
          {
            try
            {
              Notification.logException("Caught expected exception executing: "+functionName,err);
            }
    
            catch(e2)
            {
                writeInfo_("function: " + functionName + " " + err);
                quFlag = true;
                var funcObj = { "functionName" : functionName, "parameters" : notifData};
                push(new Date(), funcObj);
            }
          }
        }//loop for all this board's rows ends
    }

    writeInfo_("Now coming to " + GLOBAL_COMMANDS_NAME_ + "...");
    var execution_lock  = LockService.getScriptLock();
    execution_lock.tryLock(1000);
    var globalSheet = Trellinator.fastGetSheetByName(GLOBAL_COMMANDS_NAME_);
    if(!globalSheet)
    {
      throw "Global command sheet not found";
    }
    var globalMap = globalSheet.getDataRange().getValues();
    execution_lock.releaseLock();

    for(var i = 1; i < globalMap.length; i++)
    {
      var mapRow = globalMap[i];

      var functionName = mapRow[2] + "";
      var timeTrigger  = mapRow[3] + "";
      
      if(functionName == "")
      {
          continue;
      }

      if(timeTrigger != "")
      {
          continue;
      }
      
      var funcObj = { "functionName" : functionName, "parameters" : notifData};
      var includeList = (mapRow[0] + "").trim();
      var excludeList = (mapRow[1] + "").trim();
      var execFlag = checkExecutionCriteria_(includeList, excludeList, notifData.action.data.board.id);

      if(!execFlag)
      {
        continue;
      }
      //else execute function
      try
      {
        //should execute or push to queue
        writeInfo_("executing realtime function from global commands: " + functionName);
        var currStr = [GLOBAL_COMMANDS_NAME_ , notifData.action.type , functionName].join(",");
        var signatStr = createMd5String_(currStr);
        writeInfo_(currStr + "\n" + signatStr);
        this[functionName](notifData, signatStr);
      }
      catch(err)
      {          
        try
        {
          Notification.logException("Caught expected exception executing: "+functionName+": ",err);
        }
        
        catch(e2)
        {
            writeInfo_("function: " + functionName + " " + err);
            quFlag = true;
            push(new Date(), funcObj);
        }
      }

    }//loop for all this board's rows ends
    if(0)//quFlag)
    {
      nextMinute();
    }
    successFlag = true;
    return successFlag;
  }
  catch(error)
  {
    execution_lock.releaseLock();
    writeInfo_("Executing Notification Command " + error);
    return successFlag;
  }
  
}
//////////////////////////////////////////////////////////////////////////////
function getAlphabeticalOrder_(currSheet)
{
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var allSheets = ss.getSheets();
  var sheetNames = [];
  for(var i = 0; i < allSheets.length; i++)
  {
    var currName = allSheets[i].getName();
    if(currName.indexOf(" [") > -1)
    {      
      sheetNames.push(currName.toLowerCase());//array sorting is different than range sorting
    }
  }
  //writeInfo_("unsorted: "+ sheetNames.join(", "));
  sheetNames.sort();
  //ss.insertSheet("Temp").getRange("A1);
  //writeInfo_("sorted: "+ sheetNames.join(", "));
  var currBName = currSheet.getName();
  var index = sheetNames.indexOf(currBName.toLowerCase()) - 1;  
  var prvsBName = sheetNames[index];
  var destIndex = Trellinator.fastGetSheetByName(prvsBName).getIndex() + 1;
  //writeInfo_("prvs tab: " + prvsBName + "\nprvs item's index in array: " + index + "\n" + "index in tabs: " + destIndex);
  currSheet.activate();
  ss.moveActiveSheet(destIndex);
}
//////////////////////////////////////////////////////////////////////////////
function renameBoardSheet_(actionData)
{
  try
  {
    var success = false;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var oldSheetName = truncateBoardNameTo100Characters(actionData.data.old.name + " [" + actionData.data.board.id + "]");
    var nuSheetName = truncateBoardNameTo100Characters(actionData.data.board.name + " [" + actionData.data.board.id + "]");
    writeInfo_("Attempting to rename: "+oldSheetName+" to "+nuSheetName);
    var brdSheet = Trellinator.fastGetSheetByName(oldSheetName);
    brdSheet.setName(nuSheetName);
    writeInfo_("Board sheet renamed from: " + oldSheetName + "\nto: " + nuSheetName);
    flushInfoBuffer();
    success = true;
    return success;
  }
  catch(error)
  {
    writeInfo_("Renaming Board sheet " + error);
    flushInfoBuffer();
    return success;
  }
}
//////////////////////////////////////////////////////////////////////////////
function createGlobalGroupSheet_()
{
  var globalGrpSheet = createSheetByName_(GLOBAL_GROUP_NAME_);
  globalGrpSheet.getRange("A1:C1").setValues([["Group Name", "Boards", UPDATE_TRIG_ACTION_LIST[0] ]])
  .setFontWeight("bold");  
  globalGrpSheet.setColumnWidth(1, 200)
  .setColumnWidth(2, 600)
  .setColumnWidth(3, 200)
  .getRange("A:B").setWrap(true).setVerticalAlignment("center");
  
  createDropDown_(globalGrpSheet, "C2", UPDATE_TRIG_ACTION_LIST); 
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var configSheet = Trellinator.fastGetSheetByName(CONFIG_NAME_);  
  globalGrpSheet.activate();
  ss.moveActiveSheet(configSheet.getIndex() + 1);  
  configSheet.activate();
}
//////////////////////////////////////////////////////////////////////////////
function checkExecutionCriteria_(includeList, excludeList, boardId)
{   
  //case 1:
  if(includeList == "" && excludeList == "")
  {
    //writeInfo_("both empty...execute=" + true);
    return true;
  }
  
  //case 2:
  if(includeList != "") //either exclude blank or not blank but include has preferrence
  {
    var grpList = (includeList.toLowerCase()).split(",");
    grpList = cleanList_(grpList);
    for(var i = 0; i < grpList.length; i++)
    {
      var groupName = grpList[i];
      var boardList = getBoardNames4mGroup_(groupName);  
      if(boardList.indexOf(boardId) > -1)
      {
        return true;
      }
    }//all group search loop ends
    return false;  
  }//include condition ends
  
  //case 3:
  if(includeList == "" && excludeList != "")
  {
    var exGrpList = (excludeList.toLowerCase()).split(",");
    exGrpList = cleanList_(exGrpList);
    for(var i = 0; i < exGrpList.length; i++)
    {
      var exGrpName = exGrpList[i];
      var boardList = getBoardNames4mGroup_(exGrpName);  
      if(boardList.indexOf(boardId) > -1)
      {
        return false;
      }
    }//all exclude group search loop ends
    return true;  
  }//exclude condition ends
}
//////////////////////////////////////////////////////////////////////////////
//lowercase, spaces-trimmed list of boards
function getBoardNames4mGroup_(groupName)
{
  if(!getBoardNames4mGroup_.board_names_by_group[groupName])
  {
    groupName = groupName.toLowerCase();
    
    if(!getBoardNames4mGroup_.grpData)
    {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var grpSheet = Trellinator.fastGetSheetByName(GLOBAL_GROUP_NAME_);
      getBoardNames4mGroup_.grpData = grpSheet.getDataRange().getValues();
    }
    
    var grpData = getBoardNames4mGroup_.grpData;
    var boardList = [];
    for(var i = 1; i < grpData.length; i++)
    {
      //writeInfo_(grpData[i][0] + " vs. " + groupName);
      if(grpData[i][0].toLowerCase() == groupName)
      {
        var boardStr = (grpData[i][1] + "").toLowerCase().trim();
        boardList = boardStr.split(GLOBAL_GROUP_SEPARATOR_);
        boardList = cleanList_(boardList);
        getBoardNames4mGroup_.board_names_by_group[groupName] = boardList;
      }
    }//loop ends
  }
  
  return getBoardNames4mGroup_.board_names_by_group[groupName];
}

getBoardNames4mGroup_.grpData = null;
getBoardNames4mGroup_.board_names_by_group = {};

//////////////////////////////////////////////////////////////////////////////
function cleanList_(strList)
{
  var cList = strList.map(function(str)
                          { 
                            //return str.trim();
                            try
                            {
                            return new RegExp("^[^]+ \\[(.+)\\]$").exec(str.trim())[1].trim();
                            }
                            
                            catch(e)
                            {
                              return str.trim();
                            }
                          });            
  
  return cList;
}
//////////////////////////////////////////////////////////////////////////////
function createEditDetector_()
{
  var funcName = FUNCTION_EDIT_DETECTION;
  removeSchedule_(funcName);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.newTrigger(funcName)
  .forSpreadsheet(ss)
  .onEdit()
  .create();
}
//////////////////////////////////////////////////////////////////////////////
function getAllBoards4Execution_(includeList, excludeList)
{
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var shList = ss.getSheets();
  var boardSheetList = getBoardData_(shList);
  var boardList = [];
  //case 1://get all
  if(includeList == "" && excludeList == "")
  {
    return boardSheetList;
  }

  //case 2: //get only included ones
  if(includeList != "") //either exclude blank or not blank but include has preferrence
  {
    var boardNames = [];
    var grpList = (includeList.toLowerCase()).split(",");
    grpList = cleanList_(grpList);
    for(var i = 0; i < grpList.length; i++)
    {
      var groupName = grpList[i];
      boardNames = boardNames.concat(getBoardNames4mGroup_(groupName));
    }//all group search loop ends

    boardList = []; //reset explicitly
    for(var b = 0; b < boardSheetList.length; b++)
    {
      var shName = boardSheetList[b].name;
      var shId = boardSheetList[b].id;
      if(boardNames.indexOf(shId) > -1)//matching
      {
        boardList.push({name : shName, id : boardSheetList[b].id});
      }
    }//loop ends

    return boardList;
  }//include condition ends

  //case 3://skip only excluded ones
  if(includeList == "" && excludeList != "")
  {
    var exGrpList = (excludeList.toLowerCase()).split(",");
    exGrpList = cleanList_(exGrpList);
    var exBoardNames = [];
    for(var i = 0; i < exGrpList.length; i++)
    {
      var exGrpName = exGrpList[i];
      exBoardNames = exBoardNames.concat(getBoardNames4mGroup_(exGrpName));
    }//all exclude group search loop ends

    boardList = []; //reset explicitly
    for(var b = 0; b < boardSheetList.length; b++)
    {
      var shName = boardSheetList[b].name;
      var shId = boardSheetList[b].id;
      if(exBoardNames.indexOf(shId) == -1)//not matching
      {
        boardList.push({name : shName, id : boardSheetList[b].id});
      }
    }//loop ends

    return boardList;
  }//exclude condition ends
}
//////////////////////////////////////////////////////////////////////////////
function getBoardData_(sheetList)
{
  if(!getBoardData_.cache)
  {
    var boardList = [];
    for(var i = 0; i < sheetList.length; i++)
    {
      var shName = sheetList[i].getName();
      if(shName.indexOf(" [") > -1)
      {
        var pieces = shName.split(" [");
        var brdName = pieces[0].trim().toLowerCase();
        var brdID = pieces[1].replace("]","").trim().toLowerCase();
        boardList.push({name : brdName, id : brdID});
      }
    }//loop ends
    
    boardList = boardList.concat(getBoardNamesFromGlobalCommandGroups());
    getBoardData_.cache = boardList;
  }
  
  return getBoardData_.cache;
}

getBoardData_.cache = null;

function getBoardNamesFromGlobalCommandGroups()
{
  if(!getBoardNamesFromGlobalCommandGroups.cache)
  {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var grpSheet = Trellinator.fastGetSheetByName(GLOBAL_GROUP_NAME_);
    var grpSheetValues = grpSheet.getDataRange().getValues();
    var boardList = [];
    
    for(var i = 1; i < grpSheetValues.length; i++)
    {
      if(parts = /^BOARD (.+) ([a-z0-9]+)$/.exec(grpSheetValues[i][0]))
      {
        boardList.push({name: parts[1],id: parts[2]});
      }
    }//loop ends
    
    getBoardNamesFromGlobalCommandGroups.cache = boardList;
  }
  
  return getBoardNamesFromGlobalCommandGroups.cache;
}

getBoardNamesFromGlobalCommandGroups.cache = null;



////////////////////////////////////////////////////////////////////////////////
function removeBoardSheet_(actionData)
{
  try
  {
    var boardID = actionData.data.board.id;
    var success = deleteWebhooks(boardID);
    if(!success)
    {
      return success;
    }
    //continue
    success = false;
    var boardSheetName = truncateBoardNameTo100Characters(actionData.data.board.name + " [" + boardID + "]");
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var brdSheet = Trellinator.fastGetSheetByName(boardSheetName);
    if(!brdSheet)
    {
      throw "Board sheet named [" + boardSheetName + "] not found";
    }
    //continue with execution queue cleansing
    var boardMap = brdSheet.getDataRange().getValues(); 
    for(var i = 1; i < boardMap.length; i++)
    {
      var mapRow = boardMap[i] + "";
      var functionName = mapRow[1] + "";        
      if(functionName == "")
      {
        continue;
      }
      var currStr = [boardSheetName , actionData.type , functionName].join(",");
      var signatStr = createMd5String_(currStr);
      clear(signatStr);
      
    }//loop for all board notification commands ends
    //remove all global time-triggers
    clearTimeTriggers4Board_(boardID);
    ss.deleteSheet(brdSheet);
    Trellinator.fastGetSheetByName.sheets = null;
    
    success = true;    
    return success;
  }
  catch(error)
  {
    writeInfo_("Removing board webhook, time trigger and sheet " + error);
    return success;
  }

}

