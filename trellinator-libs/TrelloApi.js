var TrelloApi = function(){};
TrelloApi.post = function(baseURL)
{
    return TrelloApi.call("post",baseURL);
}

TrelloApi.get = function(baseURL)
{
    return TrelloApi.call("get",baseURL);
}

TrelloApi.del = function(baseURL)
{
    return TrelloApi.call("delete",baseURL);
}

TrelloApi.put = function(baseURL)
{
    return TrelloApi.call("put",baseURL);
}

TrelloApi.call = function(method,baseURL)
{
    var url = TrelloApi.constructTrelloURL(baseURL);
    var connector = (typeof UrlFetchApp == "undefined")? TestConnector():UrlFetchApp;
    var resp = connector.fetch(url, {"method": method,"muteHttpExceptions":true});
    
    if(typeof Utilities != "undefined")
        Utilities.sleep(5);
  
    return JSON.parse(resp);
}

TrelloApi.constructTrelloURL = function(baseURL)
{
    var freshURL = "";
    var creds = {key: "dummy",token: "dummy"};

    try
    {
        creds = TrelloApi.checkControlValues();
    }
    
    catch(e)
    {
    }

    if (baseURL.indexOf("?") == -1)
        freshURL = "https://api.trello.com/1/"+ baseURL +"?key="+ creds.key + "&token="+ creds.token;
    else
        freshURL = "https://api.trello.com/1/"+ baseURL +"&key="+ creds.key +"&token="+ creds.token;
    
    return freshURL;
}

TrelloApi.checkControlValues = function()
{ 
    var col = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG_NAME_).getRange("B2:B3").getValues();
 
    var appKey = (col[0][0] + "").trim();
 
    if(appKey == "")
        return {key: "", token: "", err: "Trello Key not found in " + CONFIG_NAME_ + " tab." };
   
    var token = (col[1][0] + "").trim();

    if(token == "")
        return {key: "", token: "", err: "Trello Token not found in " + CONFIG_NAME_ + " tab." };

    //both found
    return {key: appKey, token: token, err:""};
}

//Convenience functions
/**
* Tests if an actual string matches a test,
* whether the test is a string (equal) or a
* regular expression
*/
TrelloApi.nameTest = function(test,actual)
{
    var ret = null;

    if(typeof test === 'string')
    {
        if(actual == test)
            ret = actual;
    }
        
    else if(test.constructor === RegExp)
    {
        if(test.test(actual))
            ret = actual;
    }
    
    else
    {
        console.log("Unsupported test type: "+(typeof test));
        console.log(test);
        process.exit();
    }
    
    return ret;
}
