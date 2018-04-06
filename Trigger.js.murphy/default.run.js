/////////////////////////////////////////////////////
const murphy = require("murphytest");
//////////////////////////////////////////////////////
eval(murphy.load(__dirname,"../Trigger.js"));

//May 8, 2018 - Auckland
var date = new Date().minusDays(365);
console.log(date.butlerDefaultDate());
