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
    //var modelSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MODEL_DB_NAME);
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
      //SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MODEL_DB_NAME).appendRow([modelID]);//it will add member id as well
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
  var trelloData = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG_NAME_).getRange("B2:B3").getValues();
  
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
  var freshURL = "";
  var trelloBase = "https://api.trello.com/1/";
  var trelloData = getTrelloKeys_();
  
  if (parameterURL.indexOf("?") == -1) 
  {
    freshURL =  trelloBase + parameterURL +"?key="+ trelloData.key + "&token="+ trelloData.token ;
  }  
  else 
  {
    freshURL = trelloBase + parameterURL +"&key="+ trelloData.key +"&token="+ trelloData.token;
  }  
  
  return freshURL;
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
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var infoSheet = ss.getSheetByName(INFO_TAB_NAME_);
    if(!infoSheet)
    {
      infoSheet = ss.insertSheet(INFO_TAB_NAME_);
      infoSheet.appendRow(["Date" , "Description"]).setColumnWidth(2, 600).setFrozenRows(1);
      infoSheet.appendRow([ new Date(), INFO_TAB_NAME_ + " Created"]);
    }

    var msg = null;

    while(msg = write_info_buffer.pop())
    {   
        infoSheet.insertRows(2);

        if(!msg)
            msg = "No data";

        infoSheet.getRange("A2:B2").setValues([[new Date(), msg]]);
    }   

    var maxRow = infoSheet.getMaxRows();

    if(maxRow > 500)
        infoSheet.deleteRows(501,maxRow-500)
}

function writeInfo_(msg)
{
  if(write_info_buffer.length > 20)
      flushInfoBuffer();
  else
      write_info_buffer.unshift(msg);
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
  //var msgList = sheet.getParent().getSheetByName(QUOTE_NAME).getRange("A1:A10").getValues();
  
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
  var brdSheet = ss.getSheetByName(BOARD_DB_NAME_);
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
    var brdSheet = ss.getSheetByName(BOARD_DB_NAME_); 
    var boardList = brdSheet.getDataRange().getValues();
    //var singleList = getSingleColumn_(modelList, 1);
    if(boardList.length < 2)
    {
      writeInfo_("No more boards remaining to register");
      ss.deleteSheet(brdSheet);
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
        currBSheet.getRange("A1:C1").setValues([["Notification Type", "Function Call", "Clear Triggers"]])
        .setFontWeight("bold");
        currBSheet.setColumnWidth(1, 250)
        .setColumnWidth(2, 200); 
        createDropDown_(currBSheet, "A2", ACTION_LIST);
        createDropDown_(currBSheet, "C2", CLEAR_TRIG_ACTION_LIST);
        brdSheet.deleteRow(i+1);
      }
      //tStart = showUpdateProgress_(tStart, sheet, msgList);
    }//loop ends  
    //create global sheet
    createGlobalSheet_();
    //remove board sheet
    ss.deleteSheet(brdSheet);
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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var nuSheet = ss.getSheetByName(shName);
  //remove existing or clear data
  if(nuSheet)
  {
    nuSheet.clear();    
    //ss.deleteSheet(nuSheet);
  }
  else
  {//create fresh
    var totalSheets = ss.getSheets().length;
    nuSheet = ss.insertSheet(shName, totalSheets);
    //remove extra default columns and rows
    nuSheet.deleteColumns(6, 21);
    nuSheet.deleteRows(101, 900);
  }
  
  return nuSheet;  
}
///////////////////////////////////////////////////////////////////////////////////
function createGlobalSheet_()
{
  var globalSheet = createSheetByName_(GLOBAL_COMMANDS_NAME_);
  globalSheet.getRange("A1:E1").setValues([["Include", "Exclude", "Notification Type", "Function Call", "Clear Triggers"]])
  .setFontWeight("bold");
  //globalSheet = SpreadsheetApp.getActiveSheet();
  globalSheet.setColumnWidth(1, 200)
  .setColumnWidth(2, 200)
  .setColumnWidth(3, 150)
  .setColumnWidth(4, 150)
  .getRange("A:B").setWrap(true);
  
  createDropDown_(globalSheet, "C2", ACTION_LIST);
  createDropDown_(globalSheet, "E2", CLEAR_TRIG_ACTION_LIST);
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var configSheet = ss.getSheetByName(CONFIG_NAME_);  
  globalSheet.activate();
  ss.moveActiveSheet(configSheet.getIndex() + 1);
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
    var success = registerWebhook_(actionData.data.board.id);    
    if(success)
    {
      success = false;
      var boardSheetName = actionData.data.board.name + " [" + actionData.data.board.id + "]";
      var currBSheet = createSheetByName_(boardSheetName);      
      currBSheet.getRange("A1:B1").setValues([["Notification Type", "Function Call"]])
      .setFontWeight("bold");
      currBSheet.setColumnWidth(1, 250)
      .setColumnWidth(2, 200); 
      createDropDown_(currBSheet, "A2", ACTION_LIST);    
      getAlphabeticalOrder_(currBSheet);
      success = true;
    }
    return success;
  }
  catch(error)
  {
    writeInfo_("Board webhook and sheet creation " + error);
    return success;
  }
  
}
//////////////////////////////////////////////////////////////////////////////
function executeNotificationCommand_(notifData)
{
  try
  {
    //writeInfo_("notification parser to find relevant functions...");
    var successFlag = false;
    var quFlag = false;
    var tStart = (new Date()).valueOf();
    var boardSheetName = notifData.action.data.board.name + " [" + notifData.action.data.board.id + "]";
    writeInfo_("Processing notification for board: " + boardSheetName);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var brdSheet = ss.getSheetByName(boardSheetName);
    if(!brdSheet)
    {
      throw "Board sheet named [" + boardSheetName + "] not found";
    }
    var boardMap = brdSheet.getDataRange().getValues();
    for(var i = 1; i < boardMap.length; i++)
    {
      var mapRow = boardMap[i];
      if(mapRow[0] == notifData.action.type)
      {
        var functionName = mapRow[1] + "";        
        try
        {
          if(functionName == "")
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
          writeInfo_("executing function: " + functionName);
          var currStr = [boardSheetName , notifData.action.type , functionName].join(",");
          var signatStr = createMd5String_(currStr);
          writeInfo_(currStr + "\n" + signatStr);
          this[functionName](notifData, signatStr);
          
        }
        catch(err)
        {
          writeInfo_("function: " + functionName + " " + err);
          quFlag = true;
          var funcObj = { "functionName" : functionName, "parameters" : notifData};
          push(new Date(), funcObj);
        }
      }//if condition ends
    }//loop for all this board's rows ends
    
    var globalSheet = ss.getSheetByName(GLOBAL_COMMANDS_NAME_);
    if(!globalSheet)
    {
      throw "Global command sheet not found";
    }
    var globalMap = globalSheet.getDataRange().getValues();
    for(var i = 1; i < globalMap.length; i++)
    {
      var mapRow = globalMap[i];
      if(mapRow[2] == notifData.action.type)
      {
        var functionName = mapRow[3] + "";
        var funcObj = { "functionName" : functionName, "parameters" : notifData};
        //var includeList = mapRow[0] + "";
        //var excludeList = mapRow[1] + "";
        try
        {
          if(functionName == "")
          {
            continue;
          }
          //should execute or push to queue
          if(isTimeLimitApproaching_(tStart))
          {           
            writeInfo_("time limit approached in global commands, pushing-to-queue function: " + functionName);
            quFlag = true;
            push(new Date(), funcObj);
            continue;              
          }   
          writeInfo_("executing function from global commands: " + functionName);
          var currStr = [GLOBAL_COMMANDS_NAME_ , notifData.action.type , functionName].join(",");
          var signatStr = createMd5String_(currStr);
          writeInfo_(currStr + "\n" + signatStr);
          this[functionName](notifData, signatStr);          
        }
        catch(err)
        {          
          writeInfo_("function: " + functionName + " " + err);
          quFlag = true;
          push(new Date(), funcObj);
        }
      }
    }//loop for all this board's rows ends
    if(quFlag)
    {
      nextMinute();
    }
    successFlag = true;
    return successFlag;
  }
  catch(error)
  {
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
  var destIndex = ss.getSheetByName(prvsBName).getIndex() + 1;
  //writeInfo_("prvs tab: " + prvsBName + "\nprvs item's index in array: " + index + "\n" + "index in tabs: " + destIndex);
  currSheet.activate();
  ss.moveActiveSheet(destIndex);
}
//////////////////////////////////////////////////////////////////////////////
