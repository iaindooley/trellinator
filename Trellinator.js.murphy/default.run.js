/////////////////////////////////////////////////////
const murphy = require("murphytest");
//////////////////////////////////////////////////////
eval(murphy.load(__dirname,"../Trellinator.js"));

//May 8, 2018 - Auckland
var date = "2018-04-02";
var actual = "";
actual += new Date(date).butlerDefaultDate();
actual += "\n"+new Date(date).next("Monday").toLocaleString();
actual += "\n"+new Date(date).next("Tuesday").toLocaleString();
actual += "\n"+new Date(date).next("Wednesday").toLocaleString();
actual += "\n"+new Date(date).next("Thursday").toLocaleString();
actual += "\n"+new Date(date).next("Friday").toLocaleString();
actual += "\n"+new Date(date).next("Saturday").toLocaleString();
actual += "\n"+new Date(date).next("Sunday").toLocaleString();
actual += "\n"+new Date(date).previous("Monday").toLocaleString();
actual += "\n"+new Date(date).previous("Tuesday").toLocaleString();
actual += "\n"+new Date(date).previous("Wednesday").toLocaleString();
actual += "\n"+new Date(date).previous("Thursday").toLocaleString();
actual += "\n"+new Date(date).previous("Friday").toLocaleString();
actual += "\n"+new Date(date).previous("Saturday").toLocaleString();
actual += "\n"+new Date(date).previous("Sunday").toLocaleString();

var expected = "April 2, 2018\n"+
"2018-4-9 10:00:00\n"+
"2018-4-3 10:00:00\n"+
"2018-4-4 10:00:00\n"+
"2018-4-5 10:00:00\n"+
"2018-4-6 10:00:00\n"+
"2018-4-7 10:00:00\n"+
"2018-4-8 10:00:00\n"+
"2018-3-26 10:00:00\n"+
"2018-3-27 10:00:00\n"+
"2018-3-28 10:00:00\n"+
"2018-3-29 10:00:00\n"+
"2018-3-30 10:00:00\n"+
"2018-3-31 10:00:00\n"+
"2018-4-1 10:00:00";

if(actual != expected)
    console.log("Got: "+actual+" instead of: "+expected+" in Trellinator.js.murphy/default.run.js");
