var ExecutionQueue = function(){}
ExecutionQueue.fake_push = null;

ExecutionQueue.push = function(function_name,params,signature,dateobj)
{
    if(!ExecutionQueue.fake_push)
        push(dateobj,{functionName: function_name,parameters: params},signature);
    else
        ExecutionQueue.fake_push(function_name,params,signature,dateobj);
}
