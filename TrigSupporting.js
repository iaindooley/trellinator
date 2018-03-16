//function createQueueSheet_()
//function triggerCreateSchedule_(funcName, minutes)
//function removeCompleted_(qSheet)
//function callFunction_(qSheet, qDataRow, rowIndex)
//function triggerIsTimeLimitApproaching_(tStart)
//function checkAlreadyRunning_(funcName)
//function setRunning_(funcName)
//function checkAlreadyFlushing_(funcName)
//function setFlushing_(funcName)
//function setSafetyStatus_(safetyStatus)
//function createMd5String_(currStr)

var document_properties = null;
function documentProperties()
{
    if(!document_properties)
      document_properties = PropertiesService.getDocumentProperties();
  
    return document_properties;
}
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
  qSheet.getRange("A1:" + LAST_QUEUE_COLUMN + "1").setValues([["DateTime", "Function Call", "Status", "Signature"]])
  .setFontWeight("bold");
  //other settings
  qSheet.setFrozenRows(1);
  qSheet.setColumnWidth(1, 150);
  qSheet.setColumnWidth(2, 600);
  qSheet.setColumnWidth(4, 250);
  //date time format show upto minute only, 
  //but keep different date formats due to different locals esp. US and AU locales
  //example case me and Iain
  var dateStr = qSheet.getRange("A2").clear().setValue(new Date(2017,11,23)).getDisplayValue();
  var datePiece = dateStr.split(" ")[0];
  datePiece = datePiece.replace("2017","yyyy").replace("12","MM").replace("23","dd");  
  var formatA = datePiece + " " + TIME_FORMAT_;  
  qSheet.getRange("A2:A").setNumberFormat(formatA).clearContent(); 
  //colA.setValue(formatA).clearContent();
  //wrap text column B
  qSheet.getRange("B:B").setWrap(true);
  qSheet.getRange("A:" + LAST_QUEUE_COLUMN).setVerticalAlignment("center");
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
  do  
  {
    var delLock = LockService.getScriptLock();
    var successLock = delLock.tryLock(10000);//10 sec
  }while(!successLock);
  
  //setSafetyStatus_(UNSAFE_STATUS_);
  var qData = qSheet.getDataRange().getValues();
  //remove already completed ones
  for(var ro = qData.length - 1; ro >= 1; ro--)//start deleting from bottom to preserve positions
  {
    if(qData[ro][2] == FUNC_DONE_STATUS_)
    {
      qSheet.deleteRow(ro+1);
    }
  }//cleansing loop ends
  //order by time
  qSheet.getRange("A2:" + LAST_QUEUE_COLUMN).sort({column: 1, ascending: true});
  delLock.releaseLock();
  SpreadsheetApp.flush();
  //setSafetyStatus_(SAFE_STATUS_);
}
//////////////////////////////////////////////////////////////////////////////
function callFunction_(qSheet, qDataRow, rowIndex)
{
  try
  {
    qSheet.getRange(rowIndex+1, QUEUE_STATUS_COLUMN).setValue(FUNC_LOCK_STATUS_);
    var funcJStr = (qDataRow[1] + "").trim();
    if(funcJStr == "")
    {
      qSheet.getRange(rowIndex+1, QUEUE_STATUS_COLUMN).setValue(FUNC_DONE_STATUS_);
      writeInfo_("Blank JSON text in row: " + (rowIndex+1) );
      return;
    }
    //continue
    var funcObj = JSON.parse(funcJStr);
    writeInfo_(funcObj.functionName + " executing from queue...");    
    var signat = qDataRow[QUEUE_SIGNATURE_COLUMN - 1] + "";
    var originalTime = qDataRow[0];

    if(typeof this[funcObj.functionName] === 'function')
    {     
      this[funcObj.functionName](funcObj.parameters, signat, originalTime);
      qSheet.getRange(rowIndex+1, QUEUE_STATUS_COLUMN).setValue(FUNC_DONE_STATUS_);  
    }
    
    else
    {
        throw new Error(funcObj.functionName+" is not a function that exists");
    }
  }
  catch(error)
  {
    writeInfo_("Error executing function: "+error);
    flushInfoBuffer();
    qSheet.getRange(rowIndex+1, QUEUE_STATUS_COLUMN).clearContent();
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
  Utilities.sleep(1000);
  var runningName = documentProperties().getProperty(KEY_RUNNING_FUNCTION);
  var runFlag = (runningName == funcName) ? true : false;
  return runFlag;
}
//////////////////////////////////////////////////////////////////////////////
function setRunning_(funcName)
{
  Utilities.sleep(1000);
  documentProperties().setProperty(KEY_RUNNING_FUNCTION, funcName);
}

//////////////////////////////////////////////////////////////////////////////
//running the processqueue and unsafe, then yes
function checkAlreadyFlushing_(funcName)
{
  //writeInfo_(arguments.callee.name);
  Utilities.sleep(1000);
  var runningName = documentProperties().getProperty(KEY_RUNNING_FUNCTION+" flushinfo");
  var runFlag = (runningName == funcName) ? true : false;
  return runFlag;
}
//////////////////////////////////////////////////////////////////////////////
function setFlushing_(funcName)
{
  Utilities.sleep(1000);
  documentProperties().setProperty(KEY_RUNNING_FUNCTION+" flushinfo", funcName);
}


//////////////////////////////////////////////////////////////////////////////
function setSafetyStatus_(safetyStatus)
{
  //Utilities.sleep(5);
  documentProperties().setProperty(KEY_SAFETY_STATUS, safetyStatus);  
}
//////////////////////////////////////////////////////////////////////////////
function createMd5String_(currStr)
{
  var hash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, currStr);
  //Logger.log(hash);
  var hashStr = hash.map(function(byt){return ("0" + ((byt+256)%256).toString(16)).slice(-2)}).join("");
  //Logger.log(hashStr);
  return hashStr;
}
//////////////////////////////////////////////////////////////////////////////
function checkGroupIncluded_(includeList, excludeList, grpName)
{
  var groupFlag = 0;//unconcerned
  //case 1:
  if(includeList == "" && excludeList == "")
  {  
    return groupFlag;
  }
  
  //case 2:
  if(includeList != "") //either exclude blank or not blank but include has preferrence
  {
    grpName = grpName.toLowerCase();
    var grpList = (includeList.toLowerCase()).split(",");
    grpList = cleanList_(grpList);
    groupFlag = (grpList.indexOf(grpName) > -1) ? 1 : 0;
    return groupFlag;
    
  }//include condition ends
  
  //case 3: 
  if(includeList == "" && excludeList != "")
  {
    grpName = grpName.toLowerCase();
    var exGrpList = (excludeList.toLowerCase()).split(",");
    exGrpList = cleanList_(exGrpList);    
    groupFlag = (exGrpList.indexOf(grpName) > -1) ? -1 : 0;
    return groupFlag;
    
  }//exclude condition ends
}
//////////////////////////////////////////////////////////////////////////////
function checkFullSignature_(signat)
{
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var qSheet = ss.getSheetByName(QUEUE_TAB_NAME_);
  var qData = qSheet.getDataRange().getValues();
  for(var i = 0; i < qData.length; i++)
  {
    if(qData[i][QUEUE_SIGNATURE_COLUMN - 1] == signat)
    {
      return true;
    }
  }//loop ends
  //if still not found
  return false;
}
//////////////////////////////////////////////////////////////////////////////
function findTimeStamp_(globSignat)
{  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var qSheet = ss.getSheetByName(QUEUE_TAB_NAME_);
  var qData = qSheet.getDataRange().getValues();
  for(var i = 0; i < qData.length; i++)
  {
    var qSignat = (qData[i][QUEUE_SIGNATURE_COLUMN - 1] + "").split("/")[0];
    if(qSignat == globSignat)
    {
      return qData[i][0];
    }
  }//loop ends
  //if still not found
  return null;
}
