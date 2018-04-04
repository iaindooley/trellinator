var Trigger = function(){}
Trigger.fake_now = null;

Trigger.now = function()
{
    if(Trigger.fake_now)
        return Trigger.fake_now;
    else
        return new Date();
}

Trigger.isWeekDay = function(date)
{
    return !((date.getDay() == 6) || (date.getDay() == 0));
}

//time given in 24 hour time with no seconds like 14:34
Trigger.xOclockTomorrow = function(time24)
{
    var time_parts = time24.split(":");
    var ret  = new Date();
    ret.setDate(ret.getDate() + 1);
    ret.setHours(time_parts[0]);
    ret.setMinutes(time_parts[1]);
    ret.setMilliseconds(0);
    return ret;
}

//time given in 24 hour time with no seconds like 14:34
Trigger.timeIsBetween = function(start,finish)
{
    var start_parts = start.split(":");
    var finish_parts = finish.split(":");
    var start = new Date();
    start.setHours(start_parts[0],start_parts[1],0,0);
    var finish = new Date();
    finish.setHours(finish_parts[0],finish_parts[1],0,0);
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

Trigger.xDaysFromNow = function(x,time)
{
    var now = Trigger.now();
    now.setDate(now.getDate() + x);

    if(time)
    {
        var time_parts = time.split(":");
        now.setHours(time_parts[0],time_parts[1],0,0);
    }

    return now;
}

// returns week of the month starting with 0
Date.prototype.getWeekOfMonth = function() {
  var firstWeekday = new Date(this.getFullYear(), this.getMonth(), 1).getDay();
  var offsetDate = this.getDate() + firstWeekday - 1;
  return Math.floor(offsetDate / 7);
}

Date.prototype.dayName = function()
{
    var weekday = new Array(7);
    weekday[0] =  "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    return weekday[this.getDay()];
}

Date.prototype.monthName = function()
{
    return this.getMonthName();
}

Date.prototype.getMonthName = function()
{
    var monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
    return monthNames[this.getMonth()];
}

Date.prototype.next = function(day,time)
{ 
    var index = new Array();
    index["Monday"]    = 7;
    index["Sunday"]    = 6;
    index["Saturday"]  = 5;
    index["Friday"]    = 4;
    index["Thursday"]  = 3;
    index["Wednesday"] = 2;
    index["Tuesday"]   = 1;

    var ret = new Date(this);
    var cur_day = ret.getDay();

    if(index[day] < cur_day)
        index[day] += 7;

    ret.setDate(ret.getDate() + (((index[day] - cur_day)%7)+1));

    if(time)
    {
        var time_parts = time.split(":");
        var hours = time_parts[0];
        var minutes = time_parts[1];
        ret.setHours(hours);
        ret.setMinutes(minutes);
        ret.setMilliseconds(0);
    }

    return ret;
}

Trigger.getRandomArbitrary = function(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}
