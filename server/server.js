const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const axios = require('axios')
const he = require('he')
const snap7 = require('node-snap7')

const app = express()

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')))
app.use(bodyParser.json())

var buffer
var s7client = new snap7.S7Client()
var datiPLC = {}

connectToPLC = function(){
  var connecting = setInterval(function(){
    s7client.ConnectTo('172.17.5.31', 0, 1, function(err) {
      if(err)
          return console.log(' >> Connection failed. Code #' + err + ' - ' + s7client.ErrorText(err))
   
      console.log("connected: ", s7client.Connected())
      clearInterval(connecting) 
      getData()
  })
  },5000)
}

getData = function(){
  var gettingData = setInterval(function(){
    if(s7client.Connected()){
      // Read the first byte from PLC process outputs...
      s7client.DBRead(14, 0, 305, function(err, res) {
        if(err){
          s7client.Disconnect()
          clearInterval(gettingData)
          console.log(' >> ABRead failed. Code #' + err + ' - ' + s7client.ErrorText(err))
          connecting()
          return
        }

        //Qui devo interpretare il buffer 
        buffer=res
        var ProbeData = {}
        var numbers = []

        //Real
        for(i=0; i<=276; i=i+4){
          var data = [buffer[i], buffer[i+1], buffer[i+2], buffer[i+3]]
          // Create a buffer
          var buf = new ArrayBuffer(4)
          // Create a data view of it
          var view = new DataView(buf)
          // set bytes
          data.forEach(function (b, i) {
            view.setUint8(i, b)
          })
          ProbeData["Real_"+(i/4)] = view.getFloat32(0)
          numbers.push(view.getFloat32(0))
        }

        //Int
        for(i=280; i<=298; i=i+2){
          var data = [buffer[i], buffer[i+1]]
          // Create a buffer
          var buf = new ArrayBuffer(2)
          // Create a data view of it
          var view = new DataView(buf)
          // set bytes
          data.forEach(function (b, i) {
            view.setUint8(i, b)
          })
          ProbeData["Int_"+((i-280)/2)] = view.getUint16(0)
          numbers.push(view.getUint16(0))
        }

        //Bool
        var data = [buffer[300], buffer[301], buffer[302], buffer[303]]
        // Create a buffer
        var buf = new ArrayBuffer(4)
        // Create a data view of it
        var view = new DataView(buf)
        // set bytes
        data.forEach(function (b, i) {
          view.setUint8(i, b)
        })
        for(u = 0; u < 20; ++u)
          ProbeData["Bool_"+u] = (view.getUint32(0) >> u) & 1

        //Index
        var data = [buffer[304], buffer[305], buffer[306], buffer[307]]
        // Create a buffer
        var buf = new ArrayBuffer(4)
        // Create a data view of it
        var view = new DataView(buf)
        // set bytes
        data.forEach(function (b, i) {
          view.setUint8(i, b)
        })
        ProbeData["index"] = view.getUint16(0)
        datiPLC["ProbeData"]=ProbeData
      })
    }
  },800)
}

connectToPLC()





















// Update valori
app.post('/api/getData', (req,res) => {
    //chiamata a funzione di update stato lato Python
    axios({
      method: 'post',
      url: 'http://127.0.0.1:3002/getData',
      data: req.body
    }).then((results) =>{
        res.status(200).send(results.data.replace(/'/g, ''))
      })

    // axios.get('http://127.0.0.1:3002/getData')
    //   .then((results) => {
    //     res.status(200).send(JSON.parse(results.data.replace(/'/g, '')))
    //   })
})

// Update valori da PLC 1UW
app.post('/api/getUNWData', (req,res) => {
      res.status(200).send(datiPLC)
})

// impostazione setpoint
app.post('/api/set', (req,res) => {
    //chiamata a funzione di update stato lato Python
    axios({
      method: 'post',
      url: 'http://127.0.0.1:3002/set',
      data: req.body
    }).then((results) =>{
        res.status(200).send(results.data)
      })
})

// pulsante
app.post('/api/logicButton', (req,res) => {
    //chiamata a funzione di update stato lato Python
    axios({
      method: 'post',
      url: 'http://127.0.0.1:3002/logicButton',
      data: req.body
    }).then((results) =>{
        res.status(200).send(results.data)
      })
})

// selezione
app.post('/api/logicSelection', (req,res) => {
    //chiamata a funzione di update stato lato Python
    axios({
      method: 'post',
      url: 'http://127.0.0.1:3002/logicSelection',
      data: req.body
    }).then((results) =>{
        res.status(200).send(results.data)
      })
})




// // Handles any requests that don't match the ones above
// app.get('*', (req,res) =>{
//     res.sendFile(path.join(__dirname+'/build/index.html'))
// })

const port = process.env.PORT || 5000
app.listen(port)

console.log('App is listening on port ' + port)