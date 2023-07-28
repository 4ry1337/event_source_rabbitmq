const express = require("express");
const EventEmitter = require('events')
const amqp = require("amqplib");
const {PrismaClient} = require("@prisma/client");
const cors = require('cors')
const prisma = new PrismaClient()

const PORT = 9006
const app = express()
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:4200']
}))
app.use(express.json())
const emitter = new EventEmitter();
let channel, connection;  //global variables

connectQueue()
async function connectQueue() {
    try {
        connection = await amqp.connect("amqps://frdnymoj:2fPMaUcqLC2j3ONnZ_IvEfBnRFu9IiQA@sparrow.rmq.cloudamqp.com/frdnymoj");
        channel    = await connection.createChannel()
        await channel.consume('message', (data) => {
            console.log(`Received ${Buffer.from(data.content)}`)
            const msg = JSON.parse(data.content.toString())
            emitter.emit(msg.event, msg)
            channel.ack(data);
        })
        process.on('beforeExit', ()=>{
            console.log('closing')
            channel.close()
            connection.close()
        })
    } catch (error) {
        console.log(error)
    }
}

app.get('/api/connect', async (req, res) => {
    res.writeHead(200, {
        'Connection': 'keep-alive',
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache'
    })
    emitter.on('message', (message)=>{
        // console.log('event message => ' + `${JSON.stringify(message)}`)
        res.write(`data: ${JSON.stringify(message)} \n\n`)
    })
    emitter.on('connection', (message)=>{
        // console.log('event message => ' + `${JSON.stringify(message)}`)
        res.write(`data: ${JSON.stringify(message)} \n\n`)
    })
})

app.get('*', (req, res) => {
    res.status(404).send('Not found')
})

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
})
