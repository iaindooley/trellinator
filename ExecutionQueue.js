/**
* @class ExecutionQueue
* @constructor
* @classdesc The ExecutionQueue is the mechanism by
* which all functionality that is not executed as the 
* direct result of a notification is executed.
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
* @memberof ExecutionQueue
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
* @param signature {string} total or partial matching signature string
*/
ExecutionQueue.clear = function(signature)
{
    clear(signature);
}

/**
* Force the queue to run again in 1 minute
*/
ExecutionQueue.nextMinute = function()
{
    nextMinute();
}
