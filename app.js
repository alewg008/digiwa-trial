const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require("axios");
const bodyParser = require('body-parser'); 
const dotenv = require("dotenv");
var path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json()); 

app.use(express.static('public'));


const userSockets = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register', (userId) => {
    userSockets[userId] = socket.id;
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on('message', async (data) => {
    console.log(data)
    try {
        const body = {
            "message": {
                "from": data.userid,
                "from_name": data.userid,
                "type": "text",
                "msg_id": "wamid.HBgNNjI4NTc2MzY2NjYzNBUCABIYFDNBNEI0Rjk5QUI4MDM5RTIyMDI4AA==",
                "message": data.msg,
                "media_id": null,
                "media_url": null,
                "mime_type": null,
                "caption": null,
                "quoted_msg_id": null,
                "ori_timestamp": "1746277346"
            },
            "conversation": {
                "id": "lGBs5bdLh17zS_jO1BH5o",
                "channel": "api"
            }
        }
        console.log(`Request out URL: ${process.env.AI_URL}, Payload: ${body}`)

        const request = await axios.post(process.env.AI_URL, body)
        console.log(request.data);
    } catch (error) {
        console.log(error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (const userId in userSockets) {
        if (userSockets[userId] === socket.id) {
            delete userSockets[userId];
            break;
        }
    }
  });
});

app.post("/outbond", (req, res) => {
    const { body } = req;
    const targetSocketId = userSockets[body.message.from];

    console.log(`Incoming outbound To: ${body.message.from}, SocketId: ${targetSocketId}, Message: ${body.result.message}`)
    io.to(targetSocketId).emit('message', {
        userid: body.message.from,
        msg: body.result.message
    })
    res.json({
        status: true
    })
})

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
