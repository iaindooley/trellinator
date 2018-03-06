/******** 1. Aggregate Comments *********/
//Call when a card is added to the board
function aggregateComments(notification)
{
    var list_exp = new RegExp("Inbox \\([0-9+\\)");
    var card_exp = new RegExp("(.+): (.+)");

    if(list_exp.test(notification.listName))
    {
        var new_description = notification.cardDescription.replace(notification.boardName,'****');
        var parts = card_exp.exec(notification.cardName);

        Board({id: notification.idBoard}).cards({name: new RegExp(".*"+parts[2]+".*")}).each(function(card)
        {
            if(card.data.id != notification.idCard)
            {
                card.setDescription(card.data.cardDescription+"\n\n"+parts[1]+": "+new_description)
                    .moveTo({list: "Inbox",position: "bottom"});
            }
        });
        
        Card({id: notification.idCard}).archive();
    }
}

/******** 2. Archive Warning ***********/
//Call when a card is archived
function archiveWarning(notification)
{
    if(notification.username != notification.boardName)
    {
        Card({id: notification.cardId})
                   .unArchive()
                   .addChecklist("Really archive?",function(checklist)
                   {
                       checklist.addItem("Yes, really archive");
                   })
                   .postComment("@"+notification.username+" did you really mean to archive this card in "+notification.boardName+"'s board? If so, check the Yes, really archive item that has been added to this card. Otherwise, you can delete the checklist and we'll pretend this never happened");
    }
}

/******* 3. Really archive the card *******/
//Call when a checklist item is checked
function reallyArchiveCard(notification)
{
    if(notification.checklistItemName == "Yes, really archive")
        Card({id: notification.idCard}).archive();
}
