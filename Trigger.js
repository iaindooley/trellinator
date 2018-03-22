var Trigger = function(){}
Trigger.fake_now = null;

Trigger.now = function()
{
    if(Trigger.fake_now)
        return Trigger.fake_now;
    else
        return new Date();
}

Trigger.timeIsBetween = function(start,finish)
{
    var today = new Date();
    var start = new Date(today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate()+" "+start);
    var finish = new Date(today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate()+" "+finish);
    var now = new Date();
    return ((now.getTime() >= start.getTime()) && (now.getTime() <= finish.getTime()));
}

Trigger.xHoursFromNow = function(x)
{
    return Trigger.xMinutesFromNow(x*60);
}

Trigger.xMinutesFromNow = function(x)
{
    return new Date(Trigger.now().getTime() + x*60000);
}

Trigger.xDaysFromNow = function(x)
{
    var now = Trigger.now();
    now.setDate(now.getDate() + x);
    return now;
}

// returns week of the month starting with 0
Date.prototype.getWeekOfMonth = function() {
  var firstWeekday = new Date(this.getFullYear(), this.getMonth(), 1).getDay();
  var offsetDate = this.getDate() + firstWeekday - 1;
  return Math.floor(offsetDate / 7);
}

Date.prototype.getMonthName = function()
{
    var monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
    return monthNames[this.getMonth()];
}

Trigger.getRandomArbitrary = function(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}
