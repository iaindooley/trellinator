/**
* @class ExecutionQueue
* @memberof module:TrellinatorCore
* @constructor
* @classdesc The ExecutionQueue is the mechanism by
* which all functionality that is not executed as the 
* direct result of a notification is executed.
*
* For example if you want something to happen in 3 
* days' time, you can use the ExecutionQueue.
* 
* If you want something to happen on a recurring
* basis, the function that gets called simply needs
* to create another entry for itself in the 
* ExecutionQueue.
*
* The ExecutionQueue class provides an interface to create
* executions in the queue, clear certain executions and 
* force the execution queue to run more often
*/
var ExecutionQueue = function(){}

/**
* Set this to a callback function to be called
* instead of the normal push function, so that
* you can test the value that will be pushed to
* the queue during automated testing
* @memberof module:TrellinatorCore.ExecutionQueue
* @example
* ExecutionQueue.fake_push = function(function_name,params,signature,dateobj)
* {
*     if(dateobj.toLocaleString() != expected)
*         throw new Error("Wrong datetime pushed");
* }
*/
ExecutionQueue.fake_push = null;

/**
* Push a new function to the execution queue
* @memberof module:TrellinatorCore.ExecutionQueue
* @param function_name {string} the name of the function to be called.
*        Must be a function defined in the local scope of the Google
*        Apps Script project, can't be from a library or a class member
* @param params {Object} whatever argument will be passed into the function
* @param signature {string} An arbitrary string that can be used to identify
*                           execution rows as being related. Typically you 
*                           Every function call is passed a signature so you
*                           can use that verbatim or add to it. When you
*                           clear the queue you can use all or part of 
*                           the signature
* @param dateobj {Date} the date/time when the function should be executed.
*                       By default the queue is executed every 10 minutes,
*                       and any row with a function scheduled in the past
*                       or at precisely the current time is executed, and the
*                       originally date/time is passed into the function
*                       regardless of when it actually executes
* @example
* function doSomething(notification,signature)
* {
*     ExecutionQueue.push("doSomethingElse",
*                         notification,
*                         signature,
*                         Trellinator.now().addDays(3).at("9:00"));
* }
*/
ExecutionQueue.push = function(function_name,params,signature,dateobj)
{
    if(!ExecutionQueue.fake_push)
        push(dateobj,{functionName: function_name,parameters: params},signature);
    else
        ExecutionQueue.fake_push(function_name,params,signature,dateobj);
}

/**
* Clear the rows from the ExecutionQueue with signature column 
* starting with or matching given string
* @memberof module:TrellinatorCore.ExecutionQueue
* @param signature {string} total or partial matching signature string
* @example
* function doSomething(notification,signature)
* {
*     var my_sig = new Notification(notification).card().id()+signature;
*     //clear any other executions for this card, related
*     //to the function called either globally, as part of 
*     //a group or on a specific board
*     ExecutionQueue.clear(my_sig);
*     ExecutionQueue.push("doSomethingElse",
*                         notification,
*                         my_sig,
*                         Trellinator.now().addDays(3).at("13:00"));
* }
*/
ExecutionQueue.clear = function(signature)
{
    clear(signature);
}

/**
* Force the queue to run again in 1 minute
* @memberof module:TrellinatorCore.ExecutionQueue
*/
ExecutionQueue.nextMinute = function(after)
{
    nextMinute(after);
}
