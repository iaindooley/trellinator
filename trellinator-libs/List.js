var List = function(data)
{    
    this.data  = data;
    this.cards = null;
  
    this.name = function()
    {
        if(!this.data.name)
            this.load();

        return this.data.name;
    }
    
    this.countCards = function(params)
    {
        if(!this.cards)
        {
            this.cards = new IterableCollection(TrelloApi.get("lists/"+this.data.id+"/cards"));
            
            this.cards.transform(function(elem)
            {
                return new Card(elem);
            });
        }

        return this.cards.length();
    }
    
    this.rename = function(new_name)
    {
        var updated = TrelloApi.put("lists/"+this.data.id+"/name?value="+encodeURIComponent(new_name));
        this.data.name = updated.name;
        return updated;
    }
    
    this.load = function()
    {
        this.data = TrelloApi.get("lists/"+this.data.id+"?fields=all");
        return this;
    }
    
    return this;
}
