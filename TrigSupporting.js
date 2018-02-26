//function createQueueSheet_()
//function triggerCreateSchedule_(funcName, minutes)
//function removeCompleted_(qSheet)
//function callFunction_(qSheet, qDataRow, rowIndex)
//function triggerIsTimeLimitApproaching_(tStart)
//function checkAlreadyRunning_(funcName)
//function setRunning_(funcName)
//function setSafetyStatus_(safetyStatus)
//////////////////////////////////////////////////////////////////////////////
function createQueueSheet_()
{
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var qSheet = ss.getSheetByName(QUEUE_TAB_NAME_);
  if(qSheet)
  {
    //ss.deleteSheet(qSheet);
    qSheet.clear();
  }
  else
  {//create fresh
    qSheet = ss.insertSheet(QUEUE_TAB_NAME_);
    //remove extra columns and rows
    qSheet.deleteColumns(6, 21);
    qSheet.deleteRows(101, 900);
  }
  qSheet.getRange("A1:C1").setValues([["DateTime", "Function Call", "Status"]])
  .setFontWeight("bold");
  //other settings
  qSheet.setFrozenRows(1);
  qSheet.setColumnWidth(1, 150);
  qSheet.setColumnWidth(2, 500);
  //date time format show upto minute only
  var formatA = DATE_FORMAT_;//"dd/MM/yyyy hh:mm";//qSheet.getRange("A2").setValue(new Date()).getDisplayValue();
  //formatA = formatA + " 13:00";
  qSheet.getRange("A2:A").setNumberFormat(formatA); 
  //colA.setValue(formatA).clearContent();
  //wrap text column B
  qSheet.getRange("B:B").setWrap(true);
  qSheet.getRange("A:C").setVerticalAlignment("center");
}
//////////////////////////////////////////////////////////////////////////////
function triggerCreateSchedule_(funcName, minutes)
{
  var trigList = ScriptApp.getProjectTriggers();
  for(var i = 0; i < trigList.length; i++)
  {
    if(trigList[i].getHandlerFunction() == funcName)
    {
      ScriptApp.deleteTrigger(trigList[i]);
    }
  }//search for existing triggers ends
  
  ScriptApp.newTrigger(funcName)
  .timeBased()
  .everyMinutes(minutes)
  .create();
}
//////////////////////////////////////////////////////////////////////////////
function removeCompleted_(qSheet)
{
  //setSafetyStatus_(UNSAFE_STATUS_);
  var qData = qSheet.getDataRange().getValues();
  //remove already completed
  for(var ro = qData.length - 1; ro >= 1; ro--)//start deleting from bottom to preserve positions
  {
    if(qData[ro][2] == FUNC_DONE_STATUS_)
    {
      qSheet.deleteRow(ro+1);
    }
  }//cleansing loop ends
  //order by time
  qSheet.getRange("A2:C").sort({column: 1, ascending: true});
  SpreadsheetApp.flush();
  //setSafetyStatus_(SAFE_STATUS_);
}
//////////////////////////////////////////////////////////////////////////////
function callFunction_(qSheet, qDataRow, rowIndex)
{
  try
  {
    qSheet.getRange(rowIndex+1, 3).setValue(FUNC_LOCK_STATUS_);
    var funcJStr = (qDataRow[1] + "").trim();
    if(funcJStr == "")
    {
      qSheet.getRange(rowIndex+1, 3).setValue(FUNC_DONE_STATUS_);
      writeInfo_("Blank JSON text in row: " + (rowIndex+1) );
      return;
    }
    //continue
    var funcObj = JSON.parse(funcJStr);
    writeInfo_(funcObj.functionName + " executing...");    
    this[funcObj.functionName](funcObj.parameters);
    qSheet.getRange(rowIndex+1, 3).setValue(FUNC_DONE_STATUS_);        
  }
  catch(error)
  {
    writeInfo_(error);
    qSheet.getRange(rowIndex+1, 3).clearContent();
  }

}
//////////////////////////////////////////////////////////////////////////////
function triggerIsTimeLimitApproaching_(tStart)
{
  var tEnd = new Date().valueOf();
  var diff = (tEnd - tStart)/1000;
  //writeInfo("exec-time:" + diff);
  if(diff > TIME_OUT_LIMIT_TRIG_)
  {
    return true;
  }
 return false; 
}
//////////////////////////////////////////////////////////////////////////////
//running the processqueue and unsafe, then yes
function checkAlreadyRunning_(funcName)
{
  //writeInfo_(arguments.callee.name);
  Utilities.sleep(5);
  var runningName = PropertiesService.getDocumentProperties().getProperty(KEY_RUNNING_FUNCTION);
  var runFlag = (runningName == funcName) ? true : false;
  return runFlag;
}
//////////////////////////////////////////////////////////////////////////////
function setRunning_(funcName)
{
  Utilities.sleep(5);
  PropertiesService.getDocumentProperties().setProperty(KEY_RUNNING_FUNCTION, funcName);
}
//////////////////////////////////////////////////////////////////////////////
function setSafetyStatus_(safetyStatus)
{
  Utilities.sleep(5);
  PropertiesService.getDocumentProperties().setProperty(KEY_SAFETY_STATUS, safetyStatus);  
}
//////////////////////////////////////////////////////////////////////////////