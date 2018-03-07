var Trigger = function(){}

Trigger.xMinutesFromNow = function(x)
{
    return new Date(new Date().getTime() + x*60000);
}
