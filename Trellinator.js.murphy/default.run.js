/////////////////////////////////////////////////////
const murphy = require("murphytest");
//////////////////////////////////////////////////////
eval(murphy.load(__dirname,"../Trellinator.js"));

//May 8, 2018 - Auckland
var date = "2018-04-02";
var actual = "";
actual += new Date(date).butlerDefaultDate();
actual += "\n"+new Date(date).next("Monday").toUTCString();
actual += "\n"+new Date(date).next("Tuesday").toUTCString();
actual += "\n"+new Date(date).next("Wednesday").toUTCString();
actual += "\n"+new Date(date).next("Thursday").toUTCString();
actual += "\n"+new Date(date).next("Friday").toUTCString();
actual += "\n"+new Date(date).next("Saturday").toUTCString();
actual += "\n"+new Date(date).next("Sunday").toUTCString();
actual += "\n"+new Date(date).previous("Monday").toUTCString();
actual += "\n"+new Date(date).previous("Tuesday").toUTCString();
actual += "\n"+new Date(date).previous("Wednesday").toUTCString();
actual += "\n"+new Date(date).previous("Thursday").toUTCString();
actual += "\n"+new Date(date).previous("Friday").toUTCString();
actual += "\n"+new Date(date).previous("Saturday").toUTCString();
actual += "\n"+new Date(date).previous("Sunday").toUTCString();

var expected = "April 2, 2018\n"+
"Mon, 09 Apr 2018 00:00:00 GMT\n"+
"Tue, 03 Apr 2018 00:00:00 GMT\n"+
"Wed, 04 Apr 2018 00:00:00 GMT\n"+
"Thu, 05 Apr 2018 00:00:00 GMT\n"+
"Fri, 06 Apr 2018 00:00:00 GMT\n"+
"Sat, 07 Apr 2018 00:00:00 GMT\n"+
"Sun, 08 Apr 2018 00:00:00 GMT\n"+
"Sun, 25 Mar 2018 23:00:00 GMT\n"+
"Mon, 26 Mar 2018 23:00:00 GMT\n"+
"Tue, 27 Mar 2018 23:00:00 GMT\n"+
"Wed, 28 Mar 2018 23:00:00 GMT\n"+
"Thu, 29 Mar 2018 23:00:00 GMT\n"+
"Fri, 30 Mar 2018 23:00:00 GMT\n"+
"Sun, 01 Apr 2018 00:00:00 GMT";

if(actual != expected)
    console.log("Got: "+actual+" instead of: "+expected+" in Trellinator.js.murphy/default.run.js");
