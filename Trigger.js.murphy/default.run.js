/////////////////////////////////////////////////////
const murphy = require("murphytest");
//////////////////////////////////////////////////////
eval(murphy.load(__dirname,"../Trigger.js"));

//May 8, 2018 - Auckland
var date = new Date().minusDays(365);
console.log(date.butlerDefaultDate());

var date = "2018-04-02";

console.log(new Date(date).next("Monday").toLocaleString());
console.log(new Date(date).next("Tuesday").toLocaleString());
console.log(new Date(date).next("Wednesday").toLocaleString());
console.log(new Date(date).next("Thursday").toLocaleString());
console.log(new Date(date).next("Friday").toLocaleString());
console.log(new Date(date).next("Saturday").toLocaleString());
console.log(new Date(date).next("Sunday").toLocaleString());
console.log(new Date(date).previous("Monday").toLocaleString());
console.log(new Date(date).previous("Tuesday").toLocaleString());
console.log(new Date(date).previous("Wednesday").toLocaleString());
console.log(new Date(date).previous("Thursday").toLocaleString());
console.log(new Date(date).previous("Friday").toLocaleString());
console.log(new Date(date).previous("Saturday").toLocaleString());
console.log(new Date(date).previous("Sunday").toLocaleString());
