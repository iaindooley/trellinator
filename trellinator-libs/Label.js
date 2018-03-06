var Label = function(data)
{    
    this.data  = data;
  
    this.name = function()
    {
        if(!this.data.name)
            this.load();

        return this.data.name;
    }
    
    this.load = function()
    {
        this.data = TrelloApi.get("labels/"+this.data.id+"?fields=all");
        return this;
    }
    
    return this;
}
