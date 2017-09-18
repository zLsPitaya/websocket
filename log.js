var fs = require("fs");
var path = require("path");

var writeLog = function(txt) {
    var p = path.join(__dirname) + "\\log\\" + new Date().getFullYear() + "-" +
        (new Date().getMonth() + 1) + "-" +
        new Date().getDate();
    txt = "====================" + new Date() + "====================\r\n" + txt + "\r\n";
    fs.exists(p, function(ext) {
        if (!ext) {
            fs.mkdirSync(p);
        }
        p = p + "\\log.txt";
        fs.exists(p, function(exists) {
            if (exists) {
                fs.appendFile(p, txt, 'utf8', function(err) {
                    if (err) {
                        throw new err;
                    }
                })
            } else {
                fs.writeFile(p, txt, 'utf8', function(err) {
                    if (err) {
                        throw new err;
                    }
                });
            }
        })
    })
}

module.exports = writeLog;