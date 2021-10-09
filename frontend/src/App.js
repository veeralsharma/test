import {useEffect, useState} from 'react'
import './App.css';
import io from 'socket.io-client'

let socket;

function App() {

  const [logs,setLogs] = useState([])

  useEffect(() => {
    socket = io('http://localhost:5000',{transports: ['websocket']});
  }, [])

  useEffect(() => {
    socket.on('logs-update',(data) => {
      try{
        setLogs([...logs,...data])
      }catch(err){
        alert(err)
      }
    })
  },[logs])

  return (
    <div className="App">
      Following are the logs
      {
        logs.map((log,index) => {
          return (
            <div className="log" key={index}>
              {log}
            </div>
          )
        })
      }
    </div>
  );
}

export default App;
