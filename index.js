var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require("fs");
var path = require('path');
var writeLog = require("./log.js");

app.use('/', express.static(path.join(__dirname))); //静态资源文件读取

app.get('/', function(req, res) {
    fs.readFile("./index.html", "utf8", function(err, data) {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain;charset=utf-8' });
            res.write("服务器忙，请稍后刷新重试！");
        } else {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.write(data.toString());
        }
    })
});

//在线用户
var onlineUsers = {};
//在线用户数
var onlineCount = 0;

io.on('connection', function(socket) {
    //监听新用户加入
    socket.on('login', function(obj) {
        //将新加入用户的唯一标识当做socket的名称，后面退出的时候会用到
        socket.name = obj.userid;

        //检查在线列表，如果不在里面就加入
        if (!onlineUsers.hasOwnProperty(obj.userid)) {
            onlineUsers[obj.userid] = obj.username;
            onlineCount += 1;
        }

        //向所有客户端广播用户加入
        io.emit('login', { onlineUsers: onlineUsers, onlineCount: onlineCount, user: obj });
        writeLog(obj.username + ' 加入了聊天室');
    });

    //监听用户退出
    socket.on('disconnect', function() {
        //将退出的用户从在线列表中删除
        if (onlineUsers.hasOwnProperty(socket.name)) {
            //退出用户的信息
            var obj = { userid: socket.name, username: onlineUsers[socket.name] };
            delete onlineUsers[socket.name];
            onlineCount -= 1;

            //向所有客户端广播用户退出
            io.emit('logout', { onlineUsers: onlineUsers, onlineCount: onlineCount, user: obj });
            writeLog(obj.username + ' 退出了聊天室');
        }
    });

    socket.on('message', function(obj) {
        //向所有客户端广播发布的消息
        io.emit('message', obj);
        writeLog(obj.username + '说： ' + obj.content);
    });
})

http.listen(3031, function() {
    console.log('listening on *:3031');
})