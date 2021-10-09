var Queue = require('bull')
const fs = require('fs')
const { resolve } = require('path')
const readLine = require('readline')
const stream = require('stream')

var recieve_updated = new Queue('recieve_update',{
    redis:{
        host:'127.0.0.1',
        port: '6379'
    }
})

// using worker server and redis based task queues such that 
// load is balanced on main server
var lastSentLength= 0;
fs.watchFile('logs.txt',(prev,curr) => {
    var data = fs.readFileSync('logs.txt','utf-8')
    var logs = data.split('\n')
    var numLines = logs.length
    // getting last 10 new logs , if less than ten then show the newly added logs
    if(numLines-lastSentLength > 10){
        logs = logs.slice(-10)
        lastSentLength=numLines
    }else{
        logs = logs.slice(lastSentLength,numLines)
        lastSentLength=numLines
    }
    recieve_updated.add(logs) 
})  

// function for faster file reading- helps us to get last line 
// we can pair up this function on fs.watch to get last added line whenever there is a change
var getLastLine = () => {
    var instream = fs.createReadStream('logs.txt')
    var outstream = new stream ;
    var rl = readLine.createInterface(instream,outstream)
    var lastLine;
    rl.on('line' ,(line) => {
        if(line.length >= 1){
            lastLine = line
        }
    })
    rl.on('close', () => {
        resolve(lastLine)
    })
}