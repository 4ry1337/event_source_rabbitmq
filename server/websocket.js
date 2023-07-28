const ws = require('ws');

const wss = new ws.Server({
    port: 5000,
}, () => console.log(`Server started on 5000`))


wss.on('connection', function connection(ws) {
    ws.on('message', function (message) {
        message = JSON.parse(message)
        switch (message.event) {
            case 'message':
                wss.clients.forEach(client => {
                    client.send(JSON.stringify(message))
                })
                break;
            case 'connection':
                wss.clients.forEach(client => {
                    client.send(JSON.stringify(message))
                })
                break;
        }
    })
})
