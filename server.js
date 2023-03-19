const {Server}=require('socket.io');
const http=require('http');
const express=require('express');
const app=express();

app.get('/',(req,res)=>{
    res.sendFile(`${__dirname}/public/index.html`);
})

const {userJoin}=require('./utils/users');
const {getRoomUsers}=require('./utils/users');
const {getCurrentUser}=require('./utils/users')
const {formatMsg}=require('./utils/message');
const {userLeave}=require('./utils/users');

const httpServer=http.createServer(app);

const io=new Server(httpServer);


io.on('connection',(socket)=>{
    console.log('connected a new user');

    socket.on("joinRoom",({username,room})=>{

        const user=userJoin({id:socket.id,username,room});
        socket.join(user.room);

        socket.emit("message",formatMsg('Masai server',"welcome to masai server"));

        socket.broadcast.to(user.room).emit("message",formatMsg('Masai server',`${username} has joined the chat`));

        io.to(user.room).emit("roomUsers",{
            room:user.room,
            users:getRoomUsers(user.room) 
        })

    })

    socket.on("chatMsg",(msg)=>{
       
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit("message",formatMsg(user.username,msg));

     });

    socket.on('disconnect',()=>{ 

        const user=userLeave(socket.id);

        socket.broadcast.to(user.room).emit("message",formatMsg('Masai server',`${user.username} has left the chat`));

        io.to(user.room).emit("roomUsers",{
            room:user.room,
            users:getRoomUsers(user.room)
        }) 
    })
})

httpServer.listen(3500,()=>{
    console.log('running at: 3500');
})