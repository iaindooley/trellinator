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
  var ss = SpreadsheetApp.openById("1t533HZLYKkXUNncJlRmJzf721CO65TikNdNsJDSbn5c")
  SpreadsheetApp.setActiveSpreadsheet(ss);
  var htmlOut = doGetting(e);
  return htmlOut;
}
///////////////////////////////////////////////////////////////////////////////
function doPost(e)
{
  var ss = SpreadsheetApp.openById("1t533HZLYKkXUNncJlRmJzf721CO65TikNdNsJDSbn5c")
  SpreadsheetApp.setActiveSpreadsheet(ss);
  var notifText = e.postData.contents;  
  var htmlOut = doPosting(notifText);
  return htmlOut;
}
///////////////////////////////////////////////////////////////////////////////
