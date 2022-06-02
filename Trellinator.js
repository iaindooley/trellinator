/**
* @class Trellinator
* @memberof module:TrellinatorCore
* @constructor
* @classdesc The Trellinator object is a special
* instance of Member, which gets it's username
* from the token in the Configuration tab of the
* Trellinator spreadsheet. As such, this is a 
* Member object that is always the Trello
* member on behalf of which Trellinator will
* act when making Trello API calls
*
* This is particularly useful when you need to
* avoid taking action on notifications which have
* been caused by actions taken by Trellinator, and
* it is the Trellinator class that is used by
* the Member.notTrellinator method.
* 
* Another common use case is to find another
* board other than the one in which the 
* notification occurred.
*
* Trellinator also has a useful now() method which
* can be used so that, when you are creating your
* Murphy tests, you will be able to inject a "fake"
* time to act as the current date/time so you can 
* get consistent output when testing.
* 
* The Trellinator object is also where a bunch of
* Date convenience functions are added to the Date
* prototype, and those functions are documented here
*
* Methods that are added to the Date prototype in 
* this class show up as "static" and belonging to
* Date#functionName, but they're not static. If you
* know how to make these not show as static, please
* send a pull request :)
*
* @example
* if(new Notification(posted).member().notTrellinator())
* @example
* new Trellinator().board("Board Name").card("Ohai")
* @example
* new Trellinator().name()
*/
var Trellinator = function()
{
    if(!Trellinator.data)
    {
        if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
        {
            Trellinator.data = WekanApi.login();
        }
        
        else
        {
            var trello_token = null;
      
            if(Trellinator.isGoogleAppsScript())
            {
                var col = Trellinator.fastGetSheetByName(CONFIG_NAME_).getDataRange().getValues();
                new IterableCollection(col).each(function(row)
                                                 { 
                                                   if(row[0] == "Trello Token")
                                                   {
                                                     trello_token = row[1];
                                                   }
                                                 });
            }
            
            else if(Trellinator.override_token)
            {
                trello_token = Trellinator.override_token;
            }
      
            else
            {
              trello_token = process.argv[3];
            }
      
            if(trello_token)
              Trellinator.data = TrelloApi.get("tokens/"+trello_token+"/member");
            else
              throw new Error("Could not find trello token");
        }
    }

    this.member = new Member(Trellinator.data);

    for(var key in this.member)
      this[key] = this.member[key];
}

/**
* Cache active spreadsheet sheets in an 
* object referenced by name to reduce time to call
* (for example when executing via node 
* on the command line)
* @memberof module:TrellinatorCore.Trellinator
*/
Trellinator.fastGetSheetByName = function(name)
{
  if(!Trellinator.fastGetSheetByName.sheets)
  {
    Trellinator.fastGetSheetByName.sheets = {};
    var all = SpreadsheetApp.getActiveSpreadsheet().getSheets();
    
    for(var i = 0;i < all.length;i++)
    {
      Trellinator.fastGetSheetByName.sheets[all[i].getName()] = all[i];
    }
  }

  return Trellinator.fastGetSheetByName.sheets[name];
}

Trellinator.fastGetSheetByName.sheets = null;

Trellinator.data = null;
Trellinator.override_token = null;

/**
* Return true if we are running in Google 
* Apps Script environment, false if not 
* (for example when executing via node 
* on the command line)
* @memberof module:TrellinatorCore.Trellinator
*/
Trellinator.isGoogleAppsScript = function()
{
    return (typeof DriveApp !== "undefined");
}

/**
* Create a log entry in the Info Log
* when running in Google Apps Script
* or console.log when running in
* node
* @memberof module:TrellinatorCore.Trellinator
* @param msg {string} the log entry
* @example
* Trellinator.log("Oops, what went wrong?");
*/
Trellinator.log = function(msg)
{
    writeInfo_(msg);
}

/**
* Add a board name to a global command group. 
* This is used when you create a new board
* using Trellinator and need that board to
* inherit a bunch of functionality from a
* global command group.
* @memberof module:TrellinatorCore.Trellinator
* @param board {Board} a Board object to add to the global command group
* @param group_name {string} the name of the group to add this board to
* @example
* var trellinator = new Trellinator();
* var copied = trellinator.board("Template").copy("Project",trellinator.team("Whitefish"));
* Trellinator.addBoardToGlobalCommandGroup(copied,"Project Boards");
*/
Trellinator.addBoardToGlobalCommandGroup = function(board,group_name)
{
  if(Trellinator.isGoogleAppsScript())
  {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var globSheet = Trellinator.fastGetSheetByName(GLOBAL_GROUP_NAME_);
    var globData = globSheet.getDataRange().getValues();
    var added = false;
    
    for(var row = 1; row < globData.length; row++)
    {
      if(globData[row][0] == group_name)
      {
        var value   = globData[row][1].trim();
        var to_add  = board.name()+" ["+board.id()+"]";
        var to_test = board.id();
        var arr = new IterableCollection(value.split(GLOBAL_GROUP_SEPARATOR_)).find(function(elem)
                                                                                    {
                                                                                      if(elem && (new RegExp("^[^]+ \\[(.+)\\]$").exec(elem.trim())[1].trim() == to_test))
                                                                                      {
                                                                                        return false;
                                                                                      }
                                                                                      
                                                                                      else
                                                                                      {
                                                                                        return elem;
                                                                                      }
                                                                                    }).asArray();
        arr.push(to_add);
        globSheet.getRange(row+1, 2).setValue(arr.join(GLOBAL_GROUP_SEPARATOR_));
        getBoardData_.cache = null;
        getBoardNamesFromGlobalCommandGroups.cache = null;
        getBoardNames4mGroup_.grpData = null;
        getBoardNames4mGroup_.board_names_by_group = {};
        timeTrigger4NewBoard_(board.id());
        writeInfo_("Added "+board.name()+" to "+group_name);
        added = true;
      }
    }//loop for all global commmands ends
    
    if(!added)
    {
      globSheet.appendRow([group_name,board.name()+" ["+board.id()+"]"]);
      getBoardData_.cache = null;
      getBoardNamesFromGlobalCommandGroups.cache = null;
      getBoardNames4mGroup_.grpData = null;
      getBoardNames4mGroup_.board_names_by_group = {};
      timeTrigger4NewBoard_(board.id());
      writeInfo_("Added "+board.name()+" to NEW global command group "+group_name);
    }
  }
  
  return board;
}

Trellinator.boardsInGlobalCommandGroup = function(group_name)
{
    var ret = false;

    if(Trellinator.isGoogleAppsScript())
    {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var globSheet = Trellinator.fastGetSheetByName(GLOBAL_GROUP_NAME_);
      var globData = globSheet.getDataRange().getValues();
      var added = false;

      for(var row = 1; row < globData.length; row++)
      { 
        if(globData[row][0] == group_name)
        {
            ret = new IterableCollection(globData[row][1].trim().split(";;;")).find(function(id)
                                                                              {
                                                                                try
                                                                                {
                                                                                  return new Board({id: /.+\[([A-Za-z0-9]+)\]/.exec(id)[1]}).load();
                                                                                }
                                                                                                    
                                                                                catch(e)
                                                                                {
                                                                                  return false;
                                                                                }
                                                                              });


        }
      }//loop for all global commmands ends
   }

   return ret;
}

Trellinator.boardIsInGlobalCommandGroup = function(board,group_name)
{
    var ret = false;

    if(Trellinator.isGoogleAppsScript())
    {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var globSheet = Trellinator.fastGetSheetByName(GLOBAL_GROUP_NAME_);
      var globData = globSheet.getDataRange().getValues();
      var added = false;

      for(var row = 1; row < globData.length; row++)
      { 
        if(globData[row][0] == group_name)
        {
            var value = globData[row][1].trim();

            if(value.indexOf(board.id()) > -1)
                ret = true;
        }
      }//loop for all global commmands ends
   }

   return ret;
}

/**
* Remove a board name from a global command group. 
* @memberof module:TrellinatorCore.Trellinator
* @param board {Board} a Board object to remove from the global command group
* @param group_name {string} the name of the group to remove this board from
* @example
* Trellinator.removeBoardFromGlobalCommandGroup(new Notification(posted).board(),"Project Boards");
*/
Trellinator.removeBoardFromGlobalCommandGroup = function(board,group_name)
{
    if(Trellinator.isGoogleAppsScript())
    {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var globSheet = Trellinator.fastGetSheetByName(GLOBAL_GROUP_NAME_);
      var globData = globSheet.getDataRange().getValues();
      var added = false;
      
      for(var row = 1; row < globData.length; row++)
      {
        if(globData[row][0] == group_name)
        {
            var value = globData[row][1].trim();
            var to_remove = board.id();
            globSheet.getRange(row+1, 2).setValue(
            new IterableCollection(value.split(GLOBAL_GROUP_SEPARATOR_)).find(function(elem)
            {
                if(elem && (new RegExp("^[^]+ \\[(.+)\\]$").exec(elem.trim())[1].trim() == to_remove))
                    return false;
                else
                    return elem;
            }).asArray().join(GLOBAL_GROUP_SEPARATOR_)
            );
            
           //We need to do this, but calling this now will
           //also clear all triggers for the board that are
           //not from this global command group, so put this
           //back in when the Trigger system is more consistent
           //and better refactored
           //clearTimeTriggers4Board_(board.id());
            writeInfo_("Removed "+board.name()+" from "+group_name);
        }
      }//loop for all global commmands ends
   }
}

Trellinator.removeBoardFromGlobalCommandGroupById = function(board_id,group_name)
{
    if(Trellinator.isGoogleAppsScript())
    {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var globSheet = Trellinator.fastGetSheetByName(GLOBAL_GROUP_NAME_);
      var globData = globSheet.getDataRange().getValues();
      var added = false;
      
      for(var row = 1; row < globData.length; row++)
      {
        if(globData[row][0] == group_name)
        {
            var value = globData[row][1].trim();
            var to_remove = board_id;
            globSheet.getRange(row+1, 2).setValue(
            new IterableCollection(value.split(GLOBAL_GROUP_SEPARATOR_)).find(function(elem)
            {
                if(elem && (new RegExp("^[^]+ \\[(.+)\\]$").exec(elem.trim())[1].trim() == to_remove))
                    return false;
                else
                    return elem;
            }).asArray().join(GLOBAL_GROUP_SEPARATOR_)
            );
            
           //We need to do this, but calling this now will
           //also clear all triggers for the board that are
           //not from this global command group, so put this
           //back in when the Trigger system is more consistent
           //and better refactored
           //clearTimeTriggers4Board_(board.id());
            writeInfo_("Removed "+board_id+" from "+group_name);
        }
      }//loop for all global commmands ends
   }
}

//USED INTERNALLY
Trellinator.getStack = function()
{
  var stack = "";
  
  try 
  {
    throw new Error("Whoops!");
  } 
  catch (e) 
  {
    stack = e.stack;
  }
  
  return stack;
}

//USED INTERNALLY
Trellinator.fakeNow = function()
{
    return new Date(Trellinator.fake_now);
}

/**
* You can use this instead of new Date()
* and this means you will be able to get
* consistency when writing tests 
* by setting Trellinator.fake_now to
* fixed date and time
* @memberof module:TrellinatorCore.Trellinator
*/
Trellinator.now = function()
{
    return (Trellinator.fake_now) ? Trellinator.fakeNow() : new Date();
}

Trellinator.username = null;
Trellinator.fake_now = null;

/**
* Get a random number between 2 numbers
* @memberof module:TrellinatorCore.Trellinator
*/
Trellinator.getRandomArbitrary = function(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

/**
* Any Date object will have this method, allowing
* you to tell if the time is between 2 values
* @param start {string} A time in 24 hour format eg. 17:00
* @param finish {string} A time in 24 hour format eg. 13:00
* @memberof module:TrellinatorCore.Trellinator
* @example
* if(Trellinator.now().timeIsBetween("9:00","17:00"))
*/
Date.prototype.timeIsBetween = function(start,finish)
{
    var start_parts = start.split(":");
    var finish_parts = finish.split(":");
    var start = new Date(this);
    start.setHours(start_parts[0],start_parts[1],0,0);
    var finish = new Date(this);
    finish.setHours(finish_parts[0],finish_parts[1],0,0);
    return ((this.getTime() >= start.getTime()) && (this.getTime() <= finish.getTime()));
}

/**
* Returns true if this is monday - friday
* @memberof module:TrellinatorCore.Trellinator
* @example
* if(Trellinator.now().isWeekDay())
*/
Date.prototype.isWeekDay = function()
{
    return !((this.getDay() == 6) || (this.getDay() == 0));
}

//DEPRECATED: use on()
Date.prototype.onDate = function(date)
{
    this.setDate(date);
    return this;
}

/**
* Set the day component of this date
* to the given day, eg. 27 
* @memberof module:TrellinatorCore.Trellinator
* @param date {int} the day to set this date to, eg. 27
* @example
* //1st day of next month
* Trellinator.now().addMonths(1).on(1);
*/
Date.prototype.on = function(date)
{
  this.setDate(date);
  return this;
}

/**
* Set the time component of this date
* to the given time in 24 format, HH:MM
* seconds are not supportd
* @memberof module:TrellinatorCore.Trellinator
* @param time {string} format HH:MM in 24 hour time
* @example
* //9am tomorrow
* Trellinator.now().addDays(1).at("9:00");
*/
Date.prototype.at = function(time)
{
    var time_parts = time.split(":");
    this.setHours(time_parts[0],time_parts[1],0,0);
    return this;
}

/**
* Add X minutes to the date
* @memberof module:TrellinatorCore.Trellinator
* @param minutes {int} number of minutes to add
* @example
* Trellinator.now().addMinutes(20);
*/
Date.prototype.addMinutes = function(minutes)
{
    this.setMinutes(this.getMinutes() + parseInt(minutes));
    return this;
}

/**
* Minus X minutes from the date
* @memberof module:TrellinatorCore.Trellinator
* @param minutes {int} number of minutes to minus
* @example
* Trellinator.now().minusMinutes(20);
*/
Date.prototype.minusMinutes = function(minutes)
{
    this.setMinutes(this.getMinutes() - parseInt(minutes));
    return this;
}

/**
* Add X hours to the date
* @memberof module:TrellinatorCore.Trellinator
* @param hours {int} number of hours to add
* @example
* Trellinator.now().addHours(1);
*/
Date.prototype.addHours = function(hours)
{
    return this.addMinutes(parseFloat(hours)*60);
}

/**
* Minus X hours from the date
* @memberof module:TrellinatorCore.Trellinator
* @param hours {int} number of hours to minus
* @example
* Trellinator.now().minusHours(1);
*/
Date.prototype.minusHours = function(hours)
{
    return this.minusMinutes(parseFloat(hours)*60);
}

/**
* Add X weekdays to the date
* @memberof module:TrellinatorCore.Trellinator
* @param days {int} number of days to add
* @example
* //Tomorrow
* Trellinator.now().addWeekDays(1);
*/
Date.prototype.addWeekDays = function(days)
{
    var days = parseInt(days);
    var cur_day = 1;

    while(days > 0)
    {
        this.setDate(this.getDate() + cur_day);
        
        if(this.isWeekDay())
            days--;
    }

    return this;
}

/**
* Add X days to the date
* @memberof module:TrellinatorCore.Trellinator
* @param days {int} number of days to add
* @example
* //Tomorrow
* Trellinator.now().addDays(1);
*/
Date.prototype.addDays = function(days)
{
    this.setDate(this.getDate() + parseInt(days));
    return this;
}

/**
* Add X weeks to the date
* @memberof module:TrellinatorCore.Trellinator
* @param weeks {int} number of weeks to add
* @example
* Trellinator.now().addWeeks(1);
*/
Date.prototype.addWeeks = function(weeks)
{
    return this.addDays(parseInt(weeks)*7);
}

/**
* Subtract X weeks from the date
* @memberof module:TrellinatorCore.Trellinator
* @param weeks {int} number of weeks to subtract
* @example
* Trellinator.now().minusWeeks(1);
*/
Date.prototype.minusWeeks = function(weeks)
{
    return this.minusDays(parseInt(weeks)*7);
}

Date.isLeapYear = function (year) { 
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)); 
};

Date.getDaysInMonth = function (year, month) {
    return [31, (Date.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
};

Date.prototype.isLeapYear = function () { 
    return Date.isLeapYear(this.getFullYear()); 
};

Date.prototype.getDaysInMonth = function () { 
    return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
};

/**
* Add X months to the date
* @memberof module:TrellinatorCore.Trellinator
* @param months {int} number of months to add
* @example
* Trellinator.now().addMonths(1);
*/
Date.prototype.addMonths = function(value)
{
    var n = this.getDate();
    this.setDate(1);
    this.setMonth(this.getMonth() + parseInt(value));
    this.setDate(Math.min(n, this.getDaysInMonth()));
    return this;
}

/**
* Subtract X months from the date
* @memberof module:TrellinatorCore.Trellinator
* @param months {int} number of months to subtract
* @example
* Trellinator.now().minusMonths(1);
*/
Date.prototype.minusMonths = function(months)
{
    this.setMonth(this.getMonth() - parseInt(months));
    return this;
}

/**
* Return the week of the month, starting
* with 0. Useful if you want to say that
* you are in the 3rd week of August, for
* example
* @memberof module:TrellinatorCore.Trellinator
* @example
* Trellinator.now().weekOfMonth()
*/
Date.prototype.weekOfMonth = function()
{
    return this.getWeekOfMonth();
}

//DEPRECATED: use weekOfMonth
Date.prototype.getWeekOfMonth = function() {
  var firstWeekday = new Date(this.getFullYear(), this.getMonth(), 1).getDay();
  var offsetDate = this.getDate() + firstWeekday - 1;
  return Math.floor(offsetDate / 7);
}

/**
* Find out the name of the day, returned
* as the full day name eg. Monday
* @memberof module:TrellinatorCore.Trellinator
* @example
* Trellinator.now().dayName();
*/
Date.prototype.dayName = function()
{
    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    return weekday[this.getDay()];
}

/**
* Find out the name of the day, returned
* as the short day name eg. Mon
* @memberof module:TrellinatorCore.Trellinator
* @example
* Trellinator.now().shortDayName();
*/
Date.prototype.shortDayName = function()
{
    var weekday = new Array(7);
    weekday[0] = "Sun";
    weekday[1] = "Mon";
    weekday[2] = "Tue";
    weekday[3] = "Wed";
    weekday[4] = "Thu";
    weekday[5] = "Fri";
    weekday[6] = "Sat";
    return weekday[this.getDay()];
}

/**
* Find out the name of the month, returned
* as the full month name eg. August
* @memberof module:TrellinatorCore.Trellinator
* @example
* Trellinator.now().monthName();
*/
Date.prototype.monthName = function()
{
    return this.getMonthName();
}

/**
* Find out the name of the month, returned
* as the short month name eg. Aug
* @memberof module:TrellinatorCore.Trellinator
* @example
* Trellinator.now().shortMonthName();
*/
Date.prototype.shortMonthName = function()
{
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return monthNames[this.getMonth()];
}

//DEPRECATED use monthName
Date.prototype.getMonthName = function()
{
    var monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
    return monthNames[this.getMonth()];
}

/**
* Find the previous instance of the given
* day of the week, before the current date
* @memberof module:TrellinatorCore.Trellinator
* @param day {string} the name of the day of the
* week you wish to find the previous instance of
* @example
* Trellinator.now().previous("Monday")
*/
Date.prototype.previous = function(day)
{
    index = new Array();
    index["sunday"]    = 0;
    index["monday"]    = 1;
    index["tuesday"]   = 2;
    index["wednesday"] = 3;
    index["thursday"]  = 4;
    index["friday"]    = 5;
    index["saturday"]  = 6;
    var target = index[day.toLowerCase()];
    var daynum = this.getDay();
    var diff = ((target - daynum)-7);
    
    if(diff != -7)
        var offset = diff % 7;
    else
        var offset = diff;

    this.setDate(this.getDate() + offset);
    return this;
}

/**
* Find the next instance of the given
* day of the week, after the current date
* @memberof module:TrellinatorCore.Trellinator
* @param day {string} the name of the day of the
* week you wish to find the next instance of
* @example
* Trellinator.now().next("Monday")
*/
Date.prototype.next = function(day)
{ 
    var index = new Array();
    index["sunday"]    = 0;
    index["monday"]    = 1;
    index["tuesday"]   = 2;
    index["wednesday"] = 3;
    index["thursday"]  = 4;
    index["friday"]    = 5;
    index["saturday"]  = 6;

    var day_to_find = index[day.toLowerCase()];
    var diff = (day_to_find + 7) - this.getDay();
    
    if(diff != 7)
        var offset = diff % 7;
    else
        var offset = diff;

    this.setDate(this.getDate() + offset);
    return this;
}

/**
* Return the current date in the format
* MONTH DAY, YEAR where MONTH is the full
* month such as August or September, 
* day is the date without leading zeroes
* such as 1 or 19 and YEAR is the current
* year with 4 digits such as 2018.
* This method is created to return the date
* in the same format that Butler for Trello
* stores in the {date} variable
* @memberof module:TrellinatorCore.Trellinator
* @example
* Trellinator.now().butlerDefaultDate();
*/
Date.prototype.butlerDefaultDate = function()
{
    //May 8, 2018
    return this.monthName()+" "+this.getDate()+", "+this.getFullYear();
}

/**
* Find the last day of the current month
* @memberof module:TrellinatorCore.Trellinator
* @example
* Trellinator.now().lastDayOfMonth();
*/
Date.prototype.lastDayOfMonth = function()
{
    return new Date(this.getFullYear(), this.getMonth()+1, 0);
}

/**
* Subtract X weekdays from the current date
* @memberof module:TrellinatorCore.Trellinator
* @param days {int} number of days to subtract
* @example
* //3 days ago
* Trellinator.now().minusWeekDays(3);
*/
Date.prototype.minusWeekDays = function(days)
{
    var days = parseInt(days);
    var cur_day = 1;

    while(days > 0)
    {
        this.setDate(this.getDate()-cur_day);
        
        if(this.isWeekDay())
            days--;
    }

    return this;
}

/**
* Subtract X days from the current date
* @memberof module:TrellinatorCore.Trellinator
* @param days {int} number of days to subtract
* @example
* //3 days ago
* Trellinator.now().minusDays(3);
*/
Date.prototype.minusDays = function(days)
{
    this.setDate(this.getDate()-parseInt(days));
    return this;
}

/**
* Return a string formatted date from an object
* @memberof module:TrellinatorCore.Trellinator
* @param format {string} the desired format. Currently supports
* only 2 formats: YYYY-MM-DD and HH:MM
* @example
* Trellinator.now().stringFormat("YYYY-MM-DD");
*/
Date.prototype.stringFormat = function(format)
{
    if(format == "YYYY-MM-DD")
    {
        var year = this.getFullYear();
        var month = this.getMonth()+1;
        var day = this.getDate();
        
        if (day < 10) {
          day = '0' + day;
        }
        if (month < 10) {
          month = '0' + month;
        }
        
        var ret = format.replace("YYYY",year).replace("MM",month).replace("DD",day);
    }
    
    else if(format == "HH:MM")
    {
        var hours = this.getHours();
        var minutes = this.getMinutes();
        
        if (hours < 10) {
          day = '0' + day;
        }
        if (minutes < 10) {
          month = '0' + month;
        }
        
        var ret = format.replace("HH",hours).replace("MM",minutes);
    }

    else
        throw new Error("Unsupported format passed to Date.stringFormat: "+format+" add more formats!");

    return ret;
}

/**
* Return a string that is the day number 
* followed by ordinal suffix (th,rd,st)
* @memberof module:TrellinatorCore.Trellinator
* @example
* Trellinator.now().ordinalDay();
*/
Date.prototype.ordinalDay = function()
{
    return new Number(this.getDate()).nth();
}

//https://stackoverflow.com/a/15397539
Number.prototype.nth= function(){
    if(this%1) return this;
    var s= this%100;
    if(s>3 && s<21) return this+'th';
    switch(s%10){
        case 1: return this+'st';
        case 2: return this+'nd';
        case 3: return this+'rd';
        default: return this+'th';
    }
}

Trellinator.googleDriveIdRegExp = function()
{
  return /.*[^-\w]([-\w]{25,})[^-\w]?.*/;
}
////////////////////////////////////////////////////////////////////////////////////////
function getFolderByURL_(folderUrl)
{
  var folderID = folderUrl.match(Trellinator.googleDriveIdRegExp())[1];
  var folder = DriveApp.getFolderById(folderID);
  return folder;
}

////////////////////////////////////////////////////////////////////////////////////////
Trellinator.getFileByURL = function(fileUrl)
{
  var fileID = fileUrl.match(Trellinator.googleDriveIdRegExp());

  if(fileID)
    fileID = fileID[1];
  else
    throw new InvalidDataException("Could not get file by URL: "+fileUrl);
  
  var file = DriveApp.getFileById(fileID);
  return file;
}
////////////////////////////////////////////////////////////////////////////////////////
Trellinator.getFolderByURL = function(folderUrl)
{
  var folderID = folderUrl.match(/.*[^-\w]([-\w]{25,})[^-\w]?.*/);
  
  if(folderID)
    folderID = folderID[1];
  else
    throw new InvalidDataException("Could not get folder by URL: "+folderUrl);
  
  var folder = DriveApp.getFolderById(folderID);
  return folder;
}

Trellinator.findOrCreateFileByName = function(filename,creator,parent)
{
  if(!parent)
  {
    parent = DriveApp.getRootFolder();
  }
  
  if(!creator)
  {
    creator = DocumentApp;
  }
  
  try
  {
    var ret = Trellinator.getFileByName(filename,parent);
  }
  
  catch(e)
  {
    Notification.expectException(InvalidDataException,e);
    var ret = DriveApp.getFileById(creator.create(filename).getId());
    DriveApp.getRootFolder().removeFile(ret);
    parent.addFile(ret);
  }
  
  return ret;
}

Trellinator.getFileByName = function(filename,parent)
{
  if(!parent)
  {
    parent = DriveApp.getRootFolder();
  }

  var iter = parent.getFilesByName(filename);
  
  if(iter.hasNext())
  {
    return iter.next();
  }
  
  else
  {
    throw new InvalidDataException("No file: "+filename+" in parent: "+parent.getName());
  }
}

Trellinator.findOrCreateFolderByName = function(filename,parent)
{
  if(!parent)
  {
    parent = DriveApp.getRootFolder();
  }
  
  var id = Trellinator.getFolderByName(filename,parent);

  if(!id.id)
  {
    var ret = parent.createFolder(filename);
  }

  else
  {
    var ret = DriveApp.getFolderById(id.id);
  }

  return ret;
}

Trellinator.getFolderByName = function(fileName, fileInFolder)
{
  var filecount = 0;
  var dupFileArray = [];
  var folderID = "";
  
  if(!fileInFolder)
  {
    fileInFolder = DriveApp.getRootFolder();
  }

  fileInFolder = fileInFolder.getId();
  var files = DriveApp.getFoldersByName(fileName);

  while(files.hasNext()){
    var file = files.next();
    dupFileArray.push(file.getId());

    filecount++;
  };

  if(filecount > 1){
    if(typeof fileInFolder === 'undefined'){
        folderID = {"id":false,"error":"More than one file with name: "+fileName+". \nTry adding the file's folder name as a reference in Argument 2 of this function."}

    }else{
     //iterate through list of files with the same name
     for(fl = 0; fl < dupFileArray.length; fl++){
       var activeFile = DriveApp.getFileById(dupFileArray[fl]);
       var folders = activeFile.getParents();
       var folder = ""
       var foldercount = 0;

       //Get the folder name for each file
       while(folders.hasNext()){
         folder = folders.next().getName();
         foldercount++;
       };

       if(folder === fileInFolder && foldercount > 1){
         folderID = {"id":false,"error":"There is more than one parent folder: "+fileInFolder+" for file "+fileName}
       };

       if(folder === fileInFolder){
           folderID = {"id":dupFileArray[fl],"error":false};

       }else{
         folderID = {"id":false,"error":"There are multiple files named: "+fileName+". \nBut none of them are in folder, "+fileInFolder}
       };
     };
   };

  }else if(filecount === 0){
      folderID = {"id":false,"error":"No file in your drive exists with name: "+fileName};

  }else{ //IF there is only 1 file with fileName
    folderID = {"id":dupFileArray[0],"error":false};
    };

  return folderID;
}

/**
* Static method to escape user input to be
* used as part of a regular expression
* @memberof module:TrellinatorCore.Trellinator
*/
Trellinator.downloadFileToGoogleDrive = function(fileURL)
{
  if(Trellinator.isGoogleAppsScript())
  {
    try
    {
      var folder = DriveApp.getFoldersByName("Trellinator Downloads").next();
    }

    catch(e)
    {
      var folder = DriveApp.createFolder("Trellinator Downloads");
    }

    var response = UrlFetchApp.fetch(fileURL, {muteHttpExceptions: true});
    var rc = response.getResponseCode();

    if (rc == 200) {
      var fileBlob = response.getBlob()
      var file = folder.createFile(fileBlob);
    }

    else
      throw new Error("Unable to get file: "+rc);
  }

  else
  {
   var file = new MockDriveFile(fileURL, "Mock Drive File");
  }

  return file;
}

var MockDriveFile = function(url,name)
{
  this.url = url;
  this.name = name;

  this.getUrl = function()
  {
    return this.url;
  }

  this.getName = function()
  {
    return this.name;
  }
}

/**
* Static method to escape user input to be
* used as part of a regular expression
* @memberof module:TrellinatorCore.Trellinator
*/
RegExp.escape = function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};


//SOME EXPERIMENTAL DATE PARSING FUNCTIONS
Trellinator.isMonthFirstDate = function()
{
  var ret = false;

  if(Trellinator.isGoogleAppsScript())
  {
      var loc = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetLocale();
      
      if((loc.indexOf("_CA") > -1) || (loc.indexOf("_US") > -1))
          ret = true;
  }
  
  return ret;
}

Trellinator.parseDate = function(text)
{
  var ret = Trellinator.now();
  var start = new Date(ret);
  var replace = null;
  text = text.toLowerCase();
  var at_index = 0;

  //deal with tomorrow at a given time or not, default to 9am
  if(parts = new RegExp("(.*)\\b(tomorrow|today)(.*)","i").exec(text))
  {
    replace = parts[1];
    
    if(parts[2] == "tomorrow")
      ret.addDays(1);
    
    ret.at(Trellinator.optionalAt(parts[3]));
  }
  
  else if(parts = new RegExp("(.*)\\bnext( week| month| (.+)day)?( (on)? ((.+)day|(the ([0-9]+)(st|rd|th))))?( at .+)?","i").exec(text))
  { 
    replace = parts[1];
    //Specific day next wek 
    if(parts[3])
      ret.next(parts[3]+"day");
    
    //Sometime next week optionally on a day optionally at a time
    else if(parts[2].trim() == "week")
    {   
      if(parts[7])
        var day = parts[7]+"day";
      else
        var day = "monday";
      
      ret.next(day);
    }   
    
    else if(parts[2].trim() == "month")
    {   
      if(parts[9])
        var day = parseInt(parts[9].trim());
      else
        var day = 1;
      
      ret.addMonths(1).on(day);
    }
    
    ret.at(Trellinator.optionalAt(parts[11]));
  }
  
  else if(parts = new RegExp("(.*)\\bon ((.+)day|(([0-9]+)(st|th|rd)?( of)? (jan[A-Za-z]*|feb[A-Za-z]*|mar[A-Za-z]*|apr[A-Za-z]*|may|jun[A-Za-z]*|jul[A-Za-z]*|aug[A-Za-z]*|sept[A-Za-z]*|oct[A-Za-z]*|nov[A-Za-z]*|dec[A-Za-z]*),?( ([0-9]+))?)|((jan[A-Za-z]*|feb[A-Za-z]*|mar[A-Za-z]*|apr[A-Za-z]*|may|jun[A-Za-z]*|jul[A-Za-z]*|aug[A-Za-z]*|sept[A-Za-z]*|oct[A-Za-z]*|nov[A-Za-z]*|dec[A-Za-z]*) ([0-9]+)(th|st|rd)?),?( ([0-9]+))?|(([0-9]+)(/|-)([0-9]+)((/|-)([0-9]+))?))( at .+)?","i").exec(text))
  {   
    replace = parts[1];
    //on a day 
    if(parts[3])
    {   
      var day = parts[3]+"day";
      ret.next(day);
    }   
    
    //on a date with month name first
    else if(parts[13])
    {   
      var month = Trellinator.fullMonth(parts[12]);
      var day = parts[13];      
      ret = new Date(day+" "+month+" "+Trellinator.optionalYear(parts[15]));
    }   
    //on a date in numeric format with separators
    else if(parts[17])
    {   
      var day = Trellinator.isMonthFirstDate() ? parts[20]:parts[18];
      var month = Trellinator.isMonthFirstDate() ? parts[18]:parts[20];
      
      if(month.length == 1)
        month = "0"+month;
      if(day.length == 1)
        day = "0"+day;
      
      ret = new Date(Trellinator.optionalYear(parts[23])+"-"+month+"-"+day);
    }   
    
    //on a date with date first followed by month name
    else if(parts[5])
    {   
      var month = Trellinator.fullMonth(parts[8]);
      var day = parseInt(parts[5]);
      ret = new Date(day+" "+month+" "+Trellinator.optionalYear(parts[10]));
    }   
    
    ret.at(Trellinator.optionalAt(parts[24]));
  }
  
  //Check if the date changed since the start, if not, then
  //no parseable date strings were found. We have to floor/1000
  //because new Date(other_date) creates a new date with 000
  //for the milliseconds part
  if(Math.floor(start.getTime()/1000) == Math.floor(ret.getTime()/1000))
      throw new Error("No date parseable strings found");


  return {date: ret,comment: text.replace(text.replace(replace,""),"")};
}

Trellinator.fullMonth = function(month)
{
    var map = {"jan":"january",
               "feb":"february",
               "mar":"march",
               "apr":"april",
               "may":"may",
               "jun":"june",
               "jul":"july",
               "aug":"august",
               "sept":"september",
               "oct":"october",
               "nov":"november",
               "dec":"december"};

    return map[month] ? map[month]:month;
}

Trellinator.optionalYear = function(str)
{
    return str ? parseInt(str):Trellinator.now().getFullYear();
}

Trellinator.optionalAt = function(str)
{
    //at time included
    if(str)
        ret = Trellinator.atString(str);
    //default to 9am 
    else
        ret = "9:00";
    
    return ret;
}

Trellinator.atString = function(str)
{
  var ampm = new RegExp("(at )?([0-9]+):?([0-9]*) ?(am|pm)?","i").exec(str.trim());
  var hours = (ampm[4] != "pm") ? ampm[2]:(parseInt(ampm[2])+12);
  var minutes = ampm[3] ? ampm[3]:"00";
  return hours+":"+minutes;
}

Trellinator.oppoIdFromCard = function(card)
{
  var ret = 0;
  notif.card().attachments().each(function(attachment)
                                  {
                                    if(parts = new RegExp(".+Opportunity/(.+)/view$").exec(attachment.url))
                                    {
                                      ret = parts[1];
                                    }
                                  });
  
  return ret;
}

Trellinator.testDateParsing = function()
{
  var cmts = [
    "do this thing on Thursday",
    "do this thing on Thursday at 10am",
    "do this thing on September 23",
    "do this thing on Sept 23",
    "do this thing on September 23rd",
    "do this thing on Sept 23rd",
    "do this thing on September 23 at 10am",
    "do this thing on Sept 23 at 10am",
    "do this thing on September 23rd at 10am",
    "do this thing on September 23, 2019",
    "do this thing on September 23rd, 2019",
    "do this thing on September 23, 2019 at 10am",
    "do this thing on September 23rd, 2019 at 10am",
    "do this thing on 9/23/2019 at 10am",
    "do this thing on 9/23 at 10am",
    "do this thing on 23 September",
    "do this thing on 23rd September",
    "do this thing on 23rd of September",
    "do this thing on 23 September at 10am",
    "do this thing on 23rd September at 10am",
    "do this thing on 23rd of September at 10am",
    "do this thing on 23 September, 2019",
    "do this thing on 23rd September, 2019",
    "do this thing on 23rd of September, 2019",
    "do this thing on 23 September, 2019 at 10am",
    "do this thing on 23rd September, 2019 at 10am",
    "do this thing on 23rd of September, 2019 at 10am",
    "do this thing on 23 September 2019",
    "do this thing on 23rd September 2019",
    "do this thing on 23rd of September 2019",
    "do this thing on 23 September 2019 at 10am",
    "do this thing on 23rd September 2019 at 10am",
    "do this thing on 23rd of September 2019 at 10am",
    "do this thing next Monday at 9am",
    "do this thing next Monday",
    "do this thing next week on Monday at 9am",
    "do this thing next Monday at 9am",
    "do this thing next week",
    "do this thing next month", 
    "do this thing next month on the 1st at 9am"]; 
  
  for(var i = 0;i < cmts.length;i++)
  {
    console.log("from: "+cmts[i]);
    console.log(Trellinator.parseDate(cmts[i]).date.toLocaleString());
    console.log(Trellinator.parseDate(cmts[i]).comment);
  }
}

// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength,padString) {
        targetLength = targetLength>>0; //truncate if number or convert non-number to 0;
        padString = String((typeof padString !== 'undefined' ? padString : ' '));
        if (this.length > targetLength) {
            return String(this);
        }
        else {
            targetLength = targetLength-this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0,targetLength) + String(this);
        }
    };
}

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
if (!String.prototype.endsWith) {
	String.prototype.endsWith = function(search, this_len) {
		if (this_len === undefined || this_len > this.length) {
			this_len = this.length;
		}
		return this.substring(this_len - search.length, this_len) === search;
	};
}

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
        value: function(search, rawPos) {
            var pos = rawPos > 0 ? rawPos|0 : 0;
            return this.substring(pos, pos + search.length) === search;
        }
    });
}

var trellinator_global_functions_list = this;

Trellinator.cacheCollection = function(key,collection)
{
  if(Trellinator.isGoogleAppsScript());
  {
    try
    {
      var first = collection.first();
      to_cache = [first.constructor.toString(),collection.obj];
    }
    
    catch(e)
    {
      Notification.expectException(InvalidDataException,e);
      to_cache = [];
    }
    
    var cache_card = Card.findOrCreate(Board
                                       .findOrCreate("TrelloBackedCache")
                                       .findOrCreateList("Cached Collections"),key);
    
    var cache_text = Utilities.base64Encode(JSON.stringify(to_cache));
    
    if(cache_text.length < 16384)
    {
      cache_card.setDescription(cache_text);
    }
    
    else
    {
      var cache_file = Trellinator.findOrCreateFileByName("TRELLOBACKEDCACHE-"+key+cache_card.id(),DocumentApp,Trellinator.findOrCreateFolderByName("TRELLOBACKEDCACHE"));
      DocumentApp.openById(cache_file.getId()).getBody().setText(cache_text);
      cache_card.attachLink(cache_file.getUrl());
    }
    
    
    PropertiesService
    .getUserProperties()
    .setProperty(key,cache_card.link());
  }
}

Trellinator.cachedCollection = function(key)
{
  var ret = null;
  var props = PropertiesService.getUserProperties();
  
  if(Trellinator.isGoogleAppsScript())
  {
    var link = props.getProperty(key);
    
    try
    {
      var card = new Card({link: link});

      if(!card.isArchived())
      {
        if(card.attachments().length())
        {
          var cached = JSON.parse(Utilities.newBlob(Utilities.base64Decode(DocumentApp.openByUrl(card.attachments().first().link()).getBody().getText())).getDataAsString());
        }
        
        else
        {
          var cached = JSON.parse(Utilities.newBlob(Utilities.base64Decode(card.description())).getDataAsString());
        }

        if(Object.keys(cached).length)
        {
          var cons = new IterableCollection(trellinator_global_functions_list).find(function(glob)
                                                                                    {
                                                                                      var ret = false;

                                                                                      if((glob instanceof Function) && (glob.toString() === cached[0]))
                                                                                      {
                                                                                        ret = glob;
                                                                                      }
                                                                                      
                                                                                      return ret;
                                                                                    }).first();
          var obj = cached[1];

          ret = new IterableCollection(obj).find(function(inst)
                                                 {
                                                   var ret = new cons(inst.data);
                                                   
                                                   for(var key in inst)
                                                   {
                                                     if(key != "data")
                                                     {
                                                       ret[key] = inst[key];
                                                     }
                                                   }
                                                   
                                                   return ret;
                                                 });
        }
        
        else
        {
          ret = new IterableCollection({});
        }
      }
      
      else
      {
        props.deleteProperty(key);
      }
    }
    
    catch(e)
    {
      //Doesn't matter why this fails, we just return null if we 
      //can't get a cached value for any reason. At the same time,
      //clear existing value from PropertiesService in case it's
      //because of some corrupt data
      props.deleteProperty(key);
    }
  }
  
  return ret;
}

Trellinator.unCacheCollection = function(key)
{
  var props = PropertiesService.getUserProperties();
  
  if(Trellinator.isGoogleAppsScript())
  {
    if(link = props.getProperty(key))
    {
      try
      {
        new Card({link: link}).del();
      }
      
      catch(e)
      {
      }
      
      props.deleteProperty(key);
    }
  }
}

Trellinator.configVariable = function(name)
{
  var ret = null;
  
  if(Trellinator.configVariable.cache[name])
  {
    ret = Trellinator.configVariable.cache[name];
  }
  
  else if(Trellinator.isGoogleAppsScript())
  {
    var col = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG_NAME_).getDataRange().getValues();
    new IterableCollection(col).each(function(row)
                                     {   
                                       if(row[0] == name)
                                       {   
                                         ret = row[1].toString().trim();
                                         Trellinator.configVariable.cache[name] = ret;
                                       }   
                                     }); 
  }
  
  else
    ret = "dummy";
  
  return ret;
}

Trellinator.provider = function()
{
    var ret = null;

    if((typeof TRELLINATOR_PROVIDER !== 'undefined') && TRELLINATOR_PROVIDER)
    {
        ret = JSON.parse(TRELLINATOR_PROVIDER);
    }
    
    return ret;
}

Trellinator.standardId = function(data)
{
    if((prov = Trellinator.provider()) && (prov.name == "WeKan"))
        return data['_id'];
    else
        return data.id;
}
  
Trellinator.configVariable.cache = {};


/**
* Static method to wrap a regex for safe
* reuse to avoid this insane JS bug:
* https://stackoverflow.com/questions/3891641/regex-test-only-works-every-other-time
* @memberof module:TrellinatorCore.Trellinator
*/
Trellinator.regex = function(reg)
{
  return (new RegExp(reg));
}
