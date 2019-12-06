const express = require('express')
const snap7 = require('node-snap7')


const PLCList = {
    "1UW": {
        IP: "172.17.5.31",
        DBNumber: 14
    }
}

var s7client = new snap7.S7Client()

var disconnected = true
var justConnected = false

while (disconnected){
    var now = new Date().getTime();
    var millisecondsToWait = 1000; /* i.e. 1 second */
    while ( new Date().getTime() < now + millisecondsToWait )
    {
    /* do nothing; this will exit once it reached the time limit */
    /* if you want you could do something and exit*/
    /* mostly I prefer to use this */
    }
    console.log(disconnected)

}
s7client.ConnectTo("172.17.5.31", 0, 1, function(err) {
    if(err)
        console.log(' >> Connection failed. Code #' + err + ' - ' + s7client.ErrorText(err))
    
    disconnected = false
    justConnected = true
    console.log("here")
    
})
if (justConnected) {
    this.cyclicRead = setInterval(()=>{        
        // Read the first byte from PLC process outputs...
        s7client.DBRead(14, 0, 305, function(err, res) {
            if(err)
            return console.log(' >> ABRead failed. Code #' + err + ' - ' + s7client.ErrorText(err))
            // ... and write it to stdout
            console.log(res)
        })
    }, 3000)
    justConnected = false
} else {
    clearInterval(this.cyclicRead)
}