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
  var qSheet = Trellinator.fastGetSheetByName(QUEUE_TAB_NAME2_);
  if(qSheet)
  {
    //ss.deleteSheet(qSheet);
//    qSheet.clear();
  }
  else
  {//create fresh
    qSheet = ss.insertSheet(QUEUE_TAB_NAME2_);
    Trellinator.fastGetSheetByName.sheets = null;
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
  qSheet.getRange("A2:A").setNumberFormat(QUEUE_DATE_FORMAT);
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

/////////////////////////////////////////////////////////////////////////////
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
  var qSheet = Trellinator.fastGetSheetByName(QUEUE_TAB_NAME2_);
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
  var qSheet = Trellinator.fastGetSheetByName(QUEUE_TAB_NAME2_);
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

//////////////////////////////////////////////////////////////////////////////
function triggerIsTimeLimitApproaching_(tStart)
{
  var diff = (Trellinator.now().getTime() - tStart.getTime())/1000;
  //writeInfo("exec-time:" + diff);
  if(diff > TIME_OUT_LIMIT_TRIG_)
  {
    return true;
  }
 return false; 
}
//////////////////////////////////////////////////////////////////////////////
function clearTimeTriggers4Board_(boardID)
{
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var qSheet = Trellinator.fastGetSheetByName(QUEUE_TAB_NAME2_);
  var qData = qSheet.getDataRange().getValues();
  boardID = "/" + boardID;
  var removalCount = 0;
  for(var q = qData.length - 1; q >= 1; q--)
  {
    var qSignat = qData[q][QUEUE_SIGNATURE_COLUMN - 1] + "";
    if(qSignat.indexOf(boardID) > -1 )
    {
      qSheet.deleteRow(q+1);
      removalCount++;
    }
    
  }//queue data loop ends
  
  writeInfo_("Total " + removalCount + " global time-triggers removed for the board.");
}
