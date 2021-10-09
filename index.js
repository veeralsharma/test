const http = require('http')
const express = require('express')
const app = express()
const server = http.createServer(app)
const cors = require('cors')
var Queue = require('bull')
const fs = require('fs')

app.use(cors())
app.use(express.urlencoded({extended:false}))
app.use(express.json())

const socketio = require('socket.io')
const io = socketio(server)

const interval = setInterval(() => {
    var data = fs.readFileSync('logs.txt','utf-8')
    var res = data + '\n' + `This is a new line ${Math.random()}`  
    fs.writeFileSync('logs.txt',res)
},[5000])

io.on('connect',(socket) => {
    console.log('socket connection established');

    socket.on('disconnect',() => {
        clearInterval(interval)
        console.log('socket connection destroyed');
    })
})

var recieve_updated = new Queue('recieve_update',{
    redis:{
        host:'127.0.0.1',
        port: '6379'
    }
})

recieve_updated.process((job) => {
    const {data} = job ;
    io.emit('logs-update', data)
    console.log(data);
})



server.listen(5000, () => {
    console.log('server running on port 5000');
})