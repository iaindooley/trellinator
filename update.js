function fixGlobalCommandGroups()
{
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var globSheet = ss.getSheetByName(GLOBAL_GROUP_NAME_);
    var globData = globSheet.getDataRange().getValues();
    var added = false;
    var trellinator = new Trellinator();

    for(var row = 1; row < globData.length; row++)
    {
        var value   = globData[row][1].trim();
      
        globSheet.getRange(row+1, 2).setValue(

        new IterableCollection(value.split(",")).find(function(elem)
        {
            try
            {
            var board = trellinator.board(elem);
            return board.name()+" ["+board.id()+"]";
            }
          
          catch(e)
          {
            Logger.log("not found: "+elem);
            return false;
          }
        }).asArray().join(GLOBAL_GROUP_SEPARATOR_)
        );
    }
}
