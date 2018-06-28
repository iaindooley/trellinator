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

        new IterableCollection(boardStr.split(GLOBAL_GROUP_SEPARATOR_)).find(function(elem)
        {
            var board = trellinator.board(elem);
            return board.name()+" ["+board.id()+"]";
        }).asArray().push(to_add).join(GLOBAL_GROUP_SEPARATOR_)
        );

        timeTrigger4NewBoard_(board.id());
        writeInfo_("Added "+board.name()+" to "+group_name);
    }
}
