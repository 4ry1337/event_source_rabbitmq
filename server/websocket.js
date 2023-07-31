const ws = require('ws');

const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient()

const wss = new ws.Server({
    port: 5000,
}, () => console.log(`Server started on 5000`))


wss.on('connection', function connection(ws) {
    ws.on('message', async function (message) {
        message = JSON.parse(message)
        switch (message.event) {
            /*case 'initial':
                const messages = await prisma.message.findMany()
                const res = {
                    event: 'initial',
                    messages: messages,
                }
                wss.clients.forEach(client => {
                    client.send(JSON.stringify(res))
                })
                break;*/
            case 'message':
                message = await prisma.message.create({
                    data: {
                        from: message.from,
                        message: message.message,
                        event: message.event,
                    }
                });
                wss.clients.forEach(client => {
                    client.send(JSON.stringify(message))
                })
                break;
            case 'connection':
                await prisma.message.create({
                    data: {
                        from: message.from,
                        message: message.message,
                        event: message.event,
                    }
                });
                const messages = await prisma.message.findMany()
                const res = {
                    event: 'connection',
                    messages: messages,
                }
                wss.clients.forEach(client => {
                    client.send(JSON.stringify(res))
                })
                break;
        }
    })
})
