var Checklist = function(data)
{
    this.data       = data;
    this.added_item = null;

    this.name = function()
    {
        if(!this.data.name)
            this.load();
        
        return this.data.name;
    }

    this.addItem = function(name,position)
    {
        if(!position)
            position = "bottom";

        this.added_item = TrelloApi.post("checklists/"+this.data.id+"/checkItems?name="+encodeURIComponent(name)+"&pos="+encodeURIComponent(position));
        return this;
    }
    
    this.load = function()
    {
        this.data = TrelloApi.get("checklists/"+this.data.id+"?cards=all&checkItems=all&checkItem_fields=all&fields=all");
        return this;
    }
    
    return this;
}
