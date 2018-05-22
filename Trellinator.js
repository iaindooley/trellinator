const Trellinator = function()
{
    if(!Trellinator.data)
    {
      var col = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG_NAME_).getDataRange().getValues();
      new IterableCollection(col).each(function(row)
                                       { 
                                         if(row[0] == "Trello Token")
                                         {
                                             var trello_token = row[1];
                                             Trellinator.data = TrelloApi.get("tokens/"+trello_token+"/member");
                                         }
                                       });
    }

    this.member = new Member(Trellinator.data);

    for(var key in this.member)
      this[key] = this.member[key];
}

Trellinator.data = null;
