const murphy = require("murphytest");
//ADJUST THE PATH TO FIND THE FILES RELATIVE TO YOUR CURRENT DIRECTORY
eval(murphy.load(__dirname,"../ExecutionQueue.js"));
eval(murphy.load(__dirname,"../Trellinator.js"));
eval(murphy.load(__dirname,"../Trigger.js"));
eval(murphy.load(__dirname,"../../trellinator/TrigTest.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/Board.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/Card.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/Attachment.js")); 
eval(murphy.load(__dirname,"../../trellinator-libs/CheckItem.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/Checklist.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/Comment.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/Exceptions.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/HttpApi.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/IterableCollection.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/Label.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/List.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/Member.js"));  
eval(murphy.load(__dirname,"../../trellinator-libs/Notification.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/Team.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/TestConnector.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/TrelloApi.js"));
//INCLUDE ANY OTHER REQUIRED FILES HERE
//SET SOME MOCKING VARIABLES
TestConnector.test_base_dir = __dirname;
//the override_token needs to be set so that when others run your tests
//the new Trellinator() method doesn't fetch their member
//object instead of using your cached api fixtures
//DO NOT INCLUDE YOUR API KEY HERE -- TOKEN ONLY!!!
Trellinator.override_token = "dc1aaaa44446d40ba7a6c1f87e19c222bd172b165b7d5075ec428749e7437181";
Trellinator.fake_now = new Date("2018-02-28T05:00:00.000Z");
TestConnector.use_sequencer = true;//where multiple URLs need to be cached depending on when they are called
                                   //this is configured by default but not turned on by default
                                   //because otherwise all previously existing tests would need to 
                                   //be refixtured
/*OPTIONAL
TestConnector.prefix = "actual";
ExecutionQueue.fake_push = function(name,params,signature,time)
{

}
*/

//TestConnector.nocache = true;//use this to test performance or do setup/teardown
//ADD YOUR TEST FUNCTIONS HERE
/*
console.log(new Date(Trellinator.now()).dayName());
console.log(new Date(Trellinator.now()).addWeekDays(7).dayName());
console.log(new Date(Trellinator.now()).minusWeekDays(7).dayName());
*/
