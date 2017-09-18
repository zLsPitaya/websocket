(function() {
    var d = document,
        w = window,
        p = parseInt,
        dd = d.documentElement,
        db = d.body,
        sM = d.getElementById("sendMsg"),
        dc = d.compatMode == 'CSS1Compat',
        dx = dc ? dd : db,
        ec = encodeURIComponent;

    w.CHAT = {
        msgObj: d.getElementById("message"),
        username: null,
        userid: null,
        socket: null,
        /**
         * 让message滚动条保持在最低部
         */
        scrollToBottom: function() {
            this.msgObj.scrollTop = this.msgObj.scrollHeight;
        },
        /**
         * 退出，本例只是一个简单的刷新
         */
        logout: function() {
            //this.socket.disconnect();
            location.reload();
        },
        /**
         * 提交聊天消息内容
         */
        submit: function() {
            var content = d.getElementById("content").value;
            if (content != '') {
                var obj = {
                    userid: this.userid,
                    username: this.username,
                    content: content
                };
                this.socket.emit('message', obj);
                d.getElementById("content").value = '';
                d.getElementById("content").style.height = "24px";
            }
            return false;
        },
        /**
         * 用户id
         */
        genUid: function() {
            return new Date().getTime() + "" + Math.floor(Math.random() * 899 + 100);
        },
        /**
         * 更新系统消息，本例中在用户加入、退出的时候调用
         */
        updateSysMsg: function(o, action) {
            //当前在线用户列表
            var onlineUsers = o.onlineUsers;
            //当前在线人数
            var onlineCount = o.onlineCount;
            //新加入用户的信息
            var user = o.user;

            //更新在线人数
            d.getElementById("onlineCount").innerHTML = onlineCount;

            //添加系统消息
            var html = '';
            html += '';
            html += user.username;
            html += (action == 'login') ? '  加入了聊天室' : '  退出了聊天室';
            html += '';
            var section = d.createElement('section');
            section.className = 'system';
            var msgdiv = d.createElement("span");
            msgdiv.className = "system-msg";
            msgdiv.innerHTML = html;
            section.appendChild(msgdiv);
            this.msgObj.appendChild(section);
            this.scrollToBottom();
        },
        /**
         * 生成以昵称首字符的头像
         * n:名字
         * w:高度
         */
        textToHeadimg: function(n, w) {
            if (!w) {
                w = 100;
            }
            var name = n.charAt(0);
            var fontSize = w / 2;
            var fontWeight = 'bold';

            var canvas = document.createElement("canvas");
            var img = document.createElement("img");
            canvas.width = canvas.height = w;
            var context = canvas.getContext('2d');
            context.fillStyle = '#F7F7F9';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = '#605CA8';
            context.font = fontWeight + ' ' + fontSize + 'px sans-serif';
            context.textAlign = 'center';
            context.textBaseline = "middle";
            context.fillText(name, fontSize, fontSize);
            img.src = canvas.toDataURL("image/png");
            return img;
        },
        /**
         * 第一个界面用户提交用户名
         */
        usernameSubmit: function() {
            var username = d.getElementById("username").value;
            if (username != "") {
                d.getElementById("username").value = '';
                d.getElementById("loginbox").style.display = 'none';
                d.getElementById("chatbox").style.display = 'block';
                d.getElementById("sendMsg").style.display = 'block';
                this.init(username);
            }
            return false;
        },
        init: function(username) {
            this.userid = this.genUid();
            this.username = username;
            var _self = this;

            d.getElementById("showusername").innerHTML = this.username;
            this.setMH();
            this.scrollToBottom();

            //连接websocket后端服务器
            this.socket = io.connect('ws://www.zlspitaya.com:3031');

            //告诉服务器端有用户登录
            this.socket.emit('login', { userid: this.userid, username: this.username });

            //监听新用户登录
            this.socket.on('login', function(o) {
                _self.updateSysMsg(o, 'login');
            });

            //监听用户退出
            this.socket.on('logout', function(o) {
                _self.updateSysMsg(o, 'logout');
            });

            //监听消息发送
            this.socket.on('message', function(obj) {
                var isme = (obj.userid == CHAT.userid) ? true : false;
                /********************对话框容器*********************/
                var msg_box = document.createElement("div");
                msg_box.className = "msg-item";
                /********************头像**************************/
                var img = _self.textToHeadimg(obj.username, 40);
                /********************对话内容div*******************/
                var div = document.createElement("div");
                div.innerHTML = obj.content;
                var span = document.createElement("span");
                span.className = "triangle";
                if (isme) {
                    img.className = "self-img";
                    div.className = "self-msg";
                    msg_box.className += " self";
                    span.className += " triangle-self";
                } else {
                    img.className = "other-img";
                    div.className = "other-msg";
                    msg_box.className += " other";
                    span.className += " triangle-other";
                }
                msg_box.appendChild(span);
                msg_box.appendChild(div);
                msg_box.appendChild(img);
                _self.msgObj.appendChild(msg_box);
                _self.scrollToBottom();
            });
        },
        /**
         * 设置消息div的高度
         */
        setMH: function() {
            var top = (document.getElementsByClassName("title-content")[0]).offsetTop + (document.getElementsByClassName("title-content")[0]).clientHeight;
            this.msgObj.style.height = d.documentElement.clientHeight - (top + 40) + "px";
            this.scrollToBottom();
        }
    };
    /**
     * 通过“回车”提交用户名
     */
    d.getElementById("username").onkeydown = function(e) {
        e = e || event;
        if (e.keyCode === 13) {
            CHAT.usernameSubmit();
        }
    };
    /**
     * 通过“回车”提交信息
     */
    d.getElementById("content").onkeydown = function(e) {
        e = e || event;
        if (e.keyCode === 13) {
            e.preventDefault();
            CHAT.submit();
        }
    };
})();