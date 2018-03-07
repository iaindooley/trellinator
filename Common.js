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
function onEdit(e)
{
  var rng = e.range;
  var ss = e.source;
  var value = rng.getValue();
  var row = rng.getRow();
  var col = rng.getColumn();
  var currSheet = rng.getSheet();
  var shName = currSheet.getName();
  var processFlag = false;
  if(EXCLUDED_SHEET_NAMES.indexOf(shName) > -1 || row < 2 || value != CLEAR_TRIG_ACTION_LIST[0])
  {
    return;//ignore
  }
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
  var signatStr = createMd5String_(currStr);
  writeInfo_("For clearing execution queue: " + currStr + "\n" + signatStr);
  clear(signatStr);
}
///////////////////////////////////////////////////////////////////////////////