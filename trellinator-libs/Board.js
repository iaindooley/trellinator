var Board = function(data)
{    
    this.data = data;

    this.name = function()
    {
        if(!this.data.name)
            this.load();
        
        return this.data.name;
    }
  
    this.moveAllCards = function(data)
    {
        //data.from == RegExp, data.to == RegExp
        var lists = TrelloApi.get("boards/"+this.data.id+"/lists?cards=all&card_fields=all&filter=open&fields=all");
        var from_list = null;
        var to_list = null;

        for(var key in lists)
        {
            if(TrelloApi.nameTest(data.from,lists[key].name))
                from_list = lists[key];
            else if(TrelloApi.nameTest(data.to,lists[key].name))
                to_list = lists[key];
        }
        
        var ret = new IterableCollection(TrelloApi.post("lists/"+from_list.id+"/moveAllCards?idBoard="+to_list.idBoard+"&idList="+to_list.id));
        
        ret.transform(function(elem)
        {
            return new Card(elem);
        });
        
        return ret;
    }

    this.list = function(data)
    {
        return this.lists(data).first();
    }

    this.lists = function(data)
    {
        var lists = new IterableCollection(TrelloApi.get("boards/"+this.data.id+"/lists?cards=all&card_fields=all&filter=open&fields=all"));

        lists.transform(function(elem)
        {
            return new List(elem);
        });

        if(data.name)
            lists.filterByName(data.name);
        
        return lists;
    }

    this.cards = function(data)
    {
        var cards = new IterableCollection(TrelloApi.get("boards/5a938de4e0c2896bd94c7434/cards"));
        cards.transform(function(card)
        {
            return new Card(card);
        });
        
        if(data.name)
            cards.filter(data.name);
        
        return cards;
    }

    return this;
}
