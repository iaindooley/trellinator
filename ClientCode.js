///////////////////////////////////////////////////////////////////////
function createInitialSetup()
{
  triggerInit();
  init();
}
///////////////////////////////////////////////////////////////////////
//exact name required
function continueInitialization()
{
  continueInit();
}
///////////////////////////////////////////////////////////////////////
//exact name required
//function processQueue()//due to library architecture now gone-off, same definition twice makes confusion
//{
//  processQueue();  
//}
///////////////////////////////////////////////////////////////////////
function deleteTrellinatorWebhooks()
{
  deleteWebhooks();
}
///////////////////////////////////////////////////////////////////////
//function trialFun(arg, signat, tim)
//{
//  if(tim)
//  {
//    //Browser.msgBox("timestamp from original queue row: " + tim.toString());
//  }
//}
/////////////////////////////////////////////////////////////////////////
//function testingSohail()
//{
//  var htmlData = HtmlService.createTemplateFromFile("trellinator/TimeTrigUI").getRawContent();
//  htmlData = htmlData.replace("{{board-Tab-Name}}","name [some-board-id]");
//  var htmlOut = HtmlService.createTemplate(htmlData).evaluate();
//  SpreadsheetApp.getUi().showModalDialog(htmlOut, "Options for Time Trigger");
//}