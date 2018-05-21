const fs = require("fs");
const path = require("path");
const glob = require("glob");
const {exec} = require('child_process');
var TrigTest = function(){};

TrigTest.dirname = null;
TrigTest.used_fixture_file_names = new Array();

function triggerInit(basedir)
{  
    TrigTest.dirname = basedir;

    glob(TrigTest.dirname+"/triggers/*",function(er,files)
    {
            for(var i = 0;i < files.length;i++)
            {
                exec("rm -f "+files[i], (err, stdout, stderr) =>
                {
                    if (err)
                        console.log("Unable to execute: "+cmd);

                    if(stdout)
                        console.log(stdout);
                    if(stderr)
                        console.log(stderr);
                });
            }
    });
}

function push(timeStamp, funcObj, signatureStr)
{
    var fixture_file_name = path.resolve(TrigTest.dirname,"./triggers/").toString()+"/"+md5(signatureStr);
    fs.writeFileSync(fixture_file_name,timeStamp.toString()+":::"+JSON.stringify(funcObj));
    TrigTest.used_fixture_file_names.push(fixture_file_name);
}

function nextMinute()
{

}

function clear(signatureStr)
{
}
