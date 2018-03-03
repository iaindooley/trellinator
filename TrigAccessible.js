//function triggerInit()
//function processQueue()
//function push(timeStamp, funcObj)
//function nextMinute()
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
    var currTime = (new Date()).valueOf();  
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
      var rowTime = (qData[i][0]).valueOf();
      var status = qData[i][2] + "";
      if(rowTime <= currTime && status == "")
      {
        writeInfo_("Parsing row: " + (i+1));
        callFunction_(qSheet, qData[i], i);
      }
      //exit if exceeding time limit
      if(triggerIsTimeLimitApproaching_(currTime))
      {
        writeInfo_("time limit approaching...for queue processing...");
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
function push(timeStamp, funcObj)
{
  try
  {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var qSheet = ss.getSheetByName(QUEUE_TAB_NAME_);
    //simple checks
    if(timeStamp.getDate() && funcObj.functionName && funcObj.parameters)
    {
      var funcStr = JSON.stringify(funcObj);
      var timeStr = Utilities.formatDate(timeStamp, ss.getSpreadsheetTimeZone(), DATE_FORMAT_);
      qSheet.appendRow([timeStr, funcStr]);
      //var dateCell = qSheet.getRange("A" + qSheet.getLastRow());
      //dateCell.setValue(dateCell.getDisplayValue().slice(0,-3)).setNumberFormat(numberFormat);
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
  //remove previously created one-off triggers every..6..hours
  //var currTime = (new Date()).valueOf();
  //Utilities.sleep(5);
  //var actionTime = PropertiesService.getDocumentProperties().getProperty(KEY_ACTION_TIME);
//  if(actionTime != null && parseInt(actionTime) < currTime)
//  {
  triggerCreateSchedule_(funcName, 5);//has embedded removal for all triggers for this function
//    actionTime = currTime + (1000 * 60 * 10);
//    Utilities.sleep(5);
//    PropertiesService.getDocumentProperties().setProperty(KEY_ACTION_TIME, actionTime);
//  }
  //create one-off
  
  ScriptApp.newTrigger(funcName)
  .timeBased()  
  .inTimezone(SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone())  
  .after(15000)//15 sec but may be working in 1 minute
  .create();
}
//////////////////////////////////////////////////////////////////////////////