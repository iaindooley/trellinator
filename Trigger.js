//DEPRECATED: don't use anything from this class
var Trigger = function(){}

Trigger.getRandomArbitrary = function(min, max) {
    return Trellinator.getRandomArbitrary(min,max);
}

Trigger.now = function()
{
    return Trellinator.now();
}

Trigger.isWeekDay = function(date)
{
    //return !((date.getDay() == 6) || (date.getDay() == 0));
    return date.isWeekDay();
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
    return Trellinator.now().timeIsBetween(start,finish);
}

Trigger.xHoursFromNow = function(x)
{
    return Trigger.now().addHours(x);
}

Trigger.xMinutesFromNow = function(x)
{
    return Trigger.now().addMinutes(x);
}

Trigger.xDaysFromNow = function(x,time)
{
    var date = Trigger.now().addDays(x);
    
    if(time)
        date.at(time);

    return date;
}
