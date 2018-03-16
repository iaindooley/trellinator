//function triggerInit()
//function processQueue()
//function push(timeStamp, funcObj)
//function nextMinute()
//function clear(signatureStr)
//function timeTriggerPush(funcName, dateStr, timeStr, boardStr, boardRow)
//function saveFunctionName(boardStr, boardRow, funcName)
//////////////////////////////////////////////////////////////////////////////
function triggerInit()
{  
  createQueueSheet_();
  triggerCreateSchedule_(PROCESS_QUEUE_FUNC_NAME_, 5);
}
//////////////////////////////////////////////////////////////////////////////
//must be same name as PROCESS_QUEUE_FUNC_NAME_ here as well as client side script
function processQueue()
{
  try
  {
    var queue_lock  = LockService.getScriptLock();
    queue_lock.waitLock(10000);
    var currTimeObj = new Date();
    var currTime    = currTimeObj.valueOf();    
    var ss          = SpreadsheetApp.getActiveSpreadsheet();
    var qSheet      = ss.getSheetByName(QUEUE_TAB_NAME_);
    qSheet.getRange("A2:" + LAST_QUEUE_COLUMN).sort({column: 1, ascending: true});
    SpreadsheetApp.flush();
    var qData = qSheet.getDataRange().getValues();
    
    for(var i = qData.length-1; i >= 0; i--)
    {     
      var rowTimeObj = qData[i][0];
      var rowTime = rowTimeObj.valueOf();

      if(rowTime <= currTime)
      {
        try
        {
          var funcJStr = (qData[i][1].toString()).trim();
          
          if(funcJStr == "")
          {
            qSheet.deleteRow(i+1);
            writeInfo_("Blank JSON text in row: " + (rowIndex+1) );
            return;
          }
          //continue
          var funcObj = JSON.parse(funcJStr);
          writeInfo_(funcObj.functionName + " executing from queue...");    
          var signat = qData[i][QUEUE_SIGNATURE_COLUMN - 1].toString();
          var originalTime = qData[i][0];
          
          if(typeof this[funcObj.functionName] === 'function')
          {     
            this[funcObj.functionName](funcObj.parameters, signat, originalTime);
            Logger.log("deleting: "+i);
            qSheet.deleteRow(i+1); 
          }
          
          else
          {
            throw new Error(funcObj.functionName+" is not a function that exists");
          }
        }
        catch(error)
        {
          writeInfo_("Error executing function: "+error);
        }
      }
      //exit if exceeding time limit
      if(triggerIsTimeLimitApproaching_(currTime))
      {
        writeInfo_("Time limit approaching...for queue processing...");
        if(i > 0)//still remaining
        {
            nextMinute();
            throw new Error("Abort! Time is up");
        }
      }      
    }//loop for all queue rows ends  
  }

  catch(error)
  {
      writeInfo_("Queue processing " + error);
  }
  
  queue_lock.releaseLock();    
  flushInfoBuffer();
}
//////////////////////////////////////////////////////////////////////////////
function push(timeStamp, funcObj, signatureStr)
{
  try
  {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var qSheet = ss.getSheetByName(QUEUE_TAB_NAME_);
    if(!signatureStr)
    {
      var currTime = (new Date()).valueOf();
      var timeStr = currTime.toString();
      signatureStr = createMd5String_(timeStr);
    }
    //simple checks
    if(timeStamp.getDate() && funcObj.functionName && funcObj.parameters)
    {
      var funcStr = JSON.stringify(funcObj);
      var dateFormat = qSheet.getRange("A2").getNumberFormat();      
      dateFormat = (dateFormat.indexOf("MM") == -1) ? dateFormat.replace("mm","MM") : dateFormat; //1st instance only//required due to google getnumberformat bug      
      dateFormat = (dateFormat.search(/H/g) == -1) ? dateFormat.replace(/h/g,"H") : dateFormat; //pretty buggy google apps script here, has only one 'h'
      dateFormat = (dateFormat.indexOf("HH") == -1) ? dateFormat.replace("hh","HH") : dateFormat; //otherwise will print in 12 hour time, and everything will execute 10 hours early!
      var timeStr = Utilities.formatDate(timeStamp, ss.getSpreadsheetTimeZone(), dateFormat);
      qSheet.appendRow([timeStr, funcStr, "", signatureStr]);
    }
    else
    {
      writeInfo_("Invalid timestamp or function object");
    }
  }
  catch(error)
  {
    writeInfo_("Adding to queue " + error);
  }
}
//////////////////////////////////////////////////////////////////////////////
function nextMinute()
{
  //writeInfo_(arguments.callee.name);
  var funcName = PROCESS_QUEUE_FUNC_NAME_;
  triggerCreateSchedule_(funcName, 5);//has embedded removal for all triggers for this function
  
  ScriptApp.newTrigger(funcName)
  .timeBased()  
  .inTimezone(SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone())  
  .after(15000)//15 sec but may be working in 1 minute
  .create();
}
//////////////////////////////////////////////////////////////////////////////
function clear(signatureStr)
{
  try
  {
    if(signatureStr == "")
    {
      throw "No signature available";
    }
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var qSheet = ss.getSheetByName(QUEUE_TAB_NAME_);
    do  
    {
      var delLock = LockService.getScriptLock();
      var successLock = delLock.tryLock(10000);//10 sec
    }while(!successLock);

    var qData = qSheet.getDataRange().getValues();
    var total = qData.length - 1;
    var clearCount = 0;
    for(var i = total; i >= 1; i--)//reverse to keep row positions intact
    {
      var rowSignat = "" + qData[i][3];
      if(rowSignat.search(signatureStr) == 0)//support both strings + regxp but for start-with type
      {
        qSheet.deleteRow(i + 1);
        clearCount++;
      }
    }//loop ends
    delLock.releaseLock();
    writeInfo_("Cleared " + clearCount + " records from execution queue.");
  }
  catch(error)
  {
    writeInfo_("Clearing " + signatureStr + " rows from queue " + error);
  }
}
//////////////////////////////////////////////////////////////////////////////
function timeTriggerPush(funcName, dateStr, timeStr, boardStr, boardRow)
{  
  var datePieces = dateStr.split("-");
  var timePieces = timeStr.split(":");
  var timeStamp = new Date(datePieces[0], datePieces[1]-1, datePieces[2], timePieces[0], timePieces[1], 0, 0);
 
  if(boardStr != GLOBAL_COMMANDS_NAME_)
  {//indivdual board
    var boardID = boardStr.split("[")[1].replace("]","").trim();
    var funcObj = {functionName : funcName, parameters : {id : boardID} };
    var currStr = [boardStr, ACTION_LIST[0], funcName].join(",");
    var signat = createMd5String_(currStr);
    push(timeStamp, funcObj, signat); 
  }
  else //global commands
  {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var globSheet = ss.getSheetByName(GLOBAL_COMMANDS_NAME_);
    var globDataRow = globSheet.getRange("A"+boardRow+":D"+boardRow).getValues()[0];
    var includeList = (globDataRow[0] + "").trim();
    var excludeList = (globDataRow[1] + "").trim();
    var boardList = getAllBoards4Execution_(includeList, excludeList);   
    for(var i = 0; i < boardList.length; i++)
    {
      var boardID = boardList[i].id;
      var funcObj = {functionName : funcName, parameters : {id : boardID} };
      var currStr = [boardStr, ACTION_LIST[0], funcName].join(",");
      //var signat = GLOBAL_TIME_TRIGGER_PREFIX + createMd5String_(currStr);
      var signat = createMd5String_(currStr) + "/" + boardID;     
      push(timeStamp, funcObj, signat);       
    }
  }
  
  //if all goes successful  
  saveFunctionName(boardStr, boardRow, funcName);
  flushInfoBuffer();
  return boardRow;
}
//////////////////////////////////////////////////////////////////////////////
function saveFunctionName(boardStr, boardRow, funcName)
{
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var brdSheet = ss.getSheetByName(boardStr);
  if(boardStr != GLOBAL_COMMANDS_NAME_)
  {
    brdSheet.getRange("B" + boardRow).setValue(funcName);
  }
  else
  {
    brdSheet.getRange("D" + boardRow).setValue(funcName);
  }
}
//////////////////////////////////////////////////////////////////////////////
function timeTriggerGroupUpdate(groupRow)
{   
  var grpName = (groupRow[0] + "");
  //var boardStr = (groupRow[1] + "");
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var globSheet = ss.getSheetByName(GLOBAL_COMMANDS_NAME_);  
  var globData = globSheet.getDataRange().getValues();
  for(var row = 1; row < globData.length; row++)
  {
    var funcName = globData[row][3] + "";
    if(globData[row][2] != ACTION_LIST[0])
    {
      continue;
    }
    //now processing Time trigger rows only
    var includeStr = (globData[row][0] + "");
    var excludeStr = (globData[row][1] + "");
    var grpFlag = checkGroupIncluded_(includeStr, excludeStr, grpName);
    if(!grpFlag)
    {
      continue;
    }
    //now processing group included rows only
    var boardList = getAllBoards4Execution_(includeStr, excludeStr);
    var currStr = [GLOBAL_COMMANDS_NAME_ , ACTION_LIST[0], funcName].join(",");
    var globSignat = createMd5String_(currStr);
    var globTimeStamp = findTimeStamp_(globSignat);
    //Phase-1: for all new boards added to group
    var signatList = [];
    for(var i = 0; i < boardList.length; i++)
    {
      var boardID = boardList[i].id;
      var funcObj = {functionName : funcName, parameters : {id : boardID} };
      var signat =  globSignat + "/" + boardID;     
      signatList.push(signat);
      var signatFlag = checkFullSignature_(signat);
      if(!signatFlag)
      {
        push(globTimeStamp, funcObj, signat);       
      }
    }//loop for all new boards ends
    //Phase-2: for all boards removed from group
    var qSheet = ss.getSheetByName(QUEUE_TAB_NAME_);
    var qData = qSheet.getDataRange().getValues();
    for(var q = qData.length - 1; q >= 1; q--)
    {
      var qSignat = qData[q][QUEUE_SIGNATURE_COLUMN - 1] + "";
      if(qSignat.indexOf("/") > -1 && qSignat.split("/")[0] == globSignat && signatList.indexOf(qSignat) == -1)
      {
        qSheet.deleteRow(q+1);
      }
                     
    }//queue data loop ends
  }//search for group name in all global commands ends
}
//////////////////////////////////////////////////////////////////////////////
