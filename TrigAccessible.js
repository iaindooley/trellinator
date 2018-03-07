//function triggerInit()
//function processQueue()
//function push(timeStamp, funcObj)
//function nextMinute()
//function clear(signatureStr)
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
    var currTimeObj = new Date();
    var currTime = currTimeObj.valueOf();
    //writeInfo_(arguments.callee.name);
    if(checkAlreadyRunning_(PROCESS_QUEUE_FUNC_NAME_))
    {
      return;
    }
    
    setRunning_(PROCESS_QUEUE_FUNC_NAME_);
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var qSheet = ss.getSheetByName(QUEUE_TAB_NAME_);
    removeCompleted_(qSheet);
    
    var qData = qSheet.getDataRange().getValues();
    var qLength = qData.length - 1;
    for(var i = 1; i < qData.length; i++)
    {     
      var rowTimeObj = qData[i][0];
      var rowTime = rowTimeObj.valueOf();
      var status = qData[i][QUEUE_STATUS_COLUMN - 1] + "";
      if(rowTime <= currTime && status == "")
      {
        //writeInfo_("Parsing row: " + (i+1));
        callFunction_(qSheet, qData[i], i);
      }
      //exit if exceeding time limit
      if(triggerIsTimeLimitApproaching_(currTime))
      {
        writeInfo_("Time limit approaching...for queue processing...");
        if(i < qLength)//still remaining
        {
          nextMinute();
        }
        setRunning_("");
        return;
      }      
    }//loop for all queue rows ends  
    
    //all completed
    setRunning_("");    
    return;
  }
  catch(error)
  {
    writeInfo_("Queue processing " + error);
    setRunning_("");
    return;
  }
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
    for(var i = total; i >= 1; i--)//reverse to keep row positions intact
    {
      var rowSignat = "" + qData[i][3];
      if(rowSignat.search(signatureStr) == 0)//support both strings + regxp but for start-with type
      {
        qSheet.deleteRow(i + 1);
      }
    }//loop ends
    delLock.releaseLock();
  }
  catch(error)
  {
    writeInfo_("Clearing " + signatureStr + " rows from queue " + error);
  }
}
//////////////////////////////////////////////////////////////////////////////