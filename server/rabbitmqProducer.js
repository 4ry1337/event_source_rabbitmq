const express = require("express");
const amqp = require("amqplib");
const cors = require('cors')
const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient()

const PORT = 9005
const app = express()

var channel, connection;  //global variables

connectQueue()
async function connectQueue() {
    try {
        connection = await amqp.connect("amqps://frdnymoj:2fPMaUcqLC2j3ONnZ_IvEfBnRFu9IiQA@sparrow.rmq.cloudamqp.com/frdnymoj");
        channel    = await connection.createChannel()

        await channel.assertQueue("message")
        process.on('beforeExit', ()=>{
            console.log('closing')
            channel.close()
            connection.close()
        })
    } catch (error) {
        console.log(error)
    }
}

app.use(express.json())

app.use(cors({
   origin: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:4200']
}))
app.get('/api/messages', async (req, res) => {
    const messages = await prisma.message.findMany()
    res.json(messages)
})

app.post('/api/message', async (req, res) => {
    const message = await prisma.message.create({
        data: {
            from: req.body.from,
            message: req.body.message,
            event: req.body.event,
        }
    });
    channel.sendToQueue(
        'message',
        Buffer.from(
            JSON.stringify({
                ...message,
                date: new Date(),
            }),
        ),
    )
    return res.send(message)
})


app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
})
