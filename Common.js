///////////////////////////////////////////////////////////////////////////////
function onOpen()
{
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  SpreadsheetApp.getUi()
  .createMenu("Trellinator Utilities")
  .addItem("Initialize", "createInitialSetup")
  .addItem("Trellinator Delete All Webhook(s)", "deleteTrellinatorWebhooks")
  .addToUi();
  
}
///////////////////////////////////////////////////////////////////////////////
function doGet(e)
{
  var hooks = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Custom Webhooks");
  var htmlOut = false;
  
  if(hooks)
  {
    new IterableCollection(hooks.getDataRange().getValues()).each(function(row)
                                     { 
                                       if(this[row[0].trim()] &&(htmlOut === false))
                                       {
                                         htmlOut = this[row[0].trim()](e);
                                       }
                                     });
  }
  
  if(htmlOut === false)
  {
    var htmlOut = doGetting(e);
  }
  
  else
  {
    var htmlOut = HtmlService.createHtmlOutput("<p>Processed Notification</p>");
    flushInfoBuffer();
  }
  
  return htmlOut;
}
///////////////////////////////////////////////////////////////////////////////
function doPost(e)
{
  var hooks = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Custom Webhooks");
  var htmlOut = false;
  
  if(hooks)
  {
    new IterableCollection(hooks.getDataRange().getValues()).each(function(row)
                                     { 
                                       if(this[row[0].trim()] &&(htmlOut === false))
                                       {
                                         htmlOut = this[row[0].trim()](e);
                                       }
                                     });
  }
  
  if(htmlOut === false)
  {
    var notifText = e.postData.contents;  
    var htmlOut = doPosting(notifText);
  }
  
  else
  {
    var htmlOut = HtmlService.createHtmlOutput("<p>Processed Notification</p>");
    flushInfoBuffer();
  }
  
  return htmlOut;
}
///////////////////////////////////////////////////////////////////////////////
function onEditDetected(e)
{
  var rng = e.range;
  var ss = e.source;
  var value = rng.getValue();
  var row = rng.getRow();
  var col = rng.getColumn();
  var currSheet = rng.getSheet();
  var shName = currSheet.getName();
  var processFlag = false;
  if(EXCLUDED_SHEET_NAMES.indexOf(shName) > -1 || row < 2 )//excluded list
  {
    return;//ignore
  }
  switch(value)
  {
    //case 1  "Clear Triggers"
    case CLEAR_TRIG_ACTION_LIST[0]:
      //both cases
      if((shName == GLOBAL_COMMANDS_NAME_  && col == 5) || (shName != GLOBAL_GROUP_NAME_ && col == 3))
      {
        processFlag = true;
      }
      else
      {
        return;//ignore
      }
      //now process
      var dataRow = currSheet.getDataRange().getValues()[row-1];
      var currStr = shName+dataRow[col-3]+dataRow[col-2];//will cover both global and individual boards

      var signatStr = createMd5String_(currStr);
      writeInfo_("For clearing execution queue: " + currStr + "\n" + signatStr);
      clear(signatStr);     
      
      break;
  
    //case 2 "Time Trigger"
    case ACTION_LIST[0]:
      if((shName == GLOBAL_COMMANDS_NAME_  && col == 4)  || (shName != GLOBAL_GROUP_NAME_ && col == 2))
      {
        processFlag = true;
      }
      else
      {
        return; //ignore
      }
      //now process
      var htmlData = HtmlService.createTemplateFromFile("apps/trellinator/TimeTrigUI").getRawContent();
      htmlData = htmlData.replace("{{board-Tab-Name}}",shName);
      htmlData = htmlData.replace("{{board-Tab-Row}}",row);
      var htmlOut = HtmlService.createTemplate(htmlData).evaluate();
      SpreadsheetApp.getUi().showModalDialog(htmlOut, "Time Trigger Details");      
      break;
      
    //case 3: "Update Triggers"
    case UPDATE_TRIG_ACTION_LIST[0]:
      if(shName == GLOBAL_GROUP_NAME_  && col == 3)
      {        
        processFlag = true;
      }
      else
      {
        return;
      }
      //now process
      
      var dataRow = currSheet.getDataRange().getValues()[row-1];
      timeTriggerGroupUpdate(dataRow);
      break;
  }//switch ends
  
  flushInfoBuffer();
}
///////////////////////////////////////////////////////////////////////////////
function includeFile(filename) 
{
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}
///////////////////////////////////////////////////////////////////////////////
