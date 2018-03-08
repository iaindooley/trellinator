var Trigger = function(){}

Trigger.xMinutesFromNow = function(x)
{
    return new Date(new Date().getTime() + x*60000);
}

// returns week of the month starting with 0
Date.prototype.getWeekOfMonth = function() {
  var firstWeekday = new Date(this.getFullYear(), this.getMonth(), 1).getDay();
  var offsetDate = this.getDate() + firstWeekday - 1;
  return Math.floor(offsetDate / 7);
}
