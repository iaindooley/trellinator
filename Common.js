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
  var htmlOut = doGetting(e);
  return htmlOut;
}
///////////////////////////////////////////////////////////////////////////////
function doPost(e)
{
  var notifText = e.postData.contents;  
  var htmlOut = doPosting(notifText);
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
  if(EXCLUDED_SHEET_NAMES.indexOf(shName) > -1 || row < 2 )
  {
    return;//ignore
  }
  switch(value)
  {
    //case 1  
    case CLEAR_TRIG_ACTION_LIST[0]:
      //both cases
      if((shName == GLOBAL_COMMANDS_NAME_  && col == 5) || col == 3)
      {
        processFlag = true;
      }
      else
      {
        return;//ignore
      }
      //now process
      var dataRow = currSheet.getDataRange().getValues()[row-1];
      var currStr = [shName , dataRow[col-3], dataRow[col-2] ].join(",");//will cover both global and individual boards
      //non-default cases for signature
      if(dataRow[0] == ACTION_LIST[0])//Time Trigger but it seems to be the same structure
      {
        currStr = [shName , dataRow[col-3], dataRow[col-2] ].join(",");
      }      
      var signatStr = createMd5String_(currStr);
      writeInfo_("For clearing execution queue: " + currStr + "\n" + signatStr);
      clear(signatStr);      
      break;
  
    //case 2
    case ACTION_LIST[0]:
      if(col != 1)//(shName == GLOBAL_COMMANDS_NAME_  && col == 5) || 
      {
        return; //ignore
      }
      var htmlData = HtmlService.createTemplateFromFile("trellinator/TimeTrigUI").getRawContent();
      htmlData = htmlData.replace("{{board-Tab-Name}}",shName);
      htmlData = htmlData.replace("{{board-Tab-Row}}",row);
      var htmlOut = HtmlService.createTemplate(htmlData).evaluate();
      SpreadsheetApp.getUi().showModalDialog(htmlOut, "Time Trigger Details");
      
      break;
  }//switch ends

}
///////////////////////////////////////////////////////////////////////////////
function includeFile(filename) 
{
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}
///////////////////////////////////////////////////////////////////////////////