const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 4444;
const aws = require('aws-sdk');
const db = new aws.DynamoDB({region: 'us-east-1'});

let POLO = [];
let MARCO = [];

function putPositionParam(data) {
    return ({ 
        TableName: "marcos",
        Item: {
            "id": { S: data.marco.toString() },
            "latitude": { S: data.latitude.toString() },
            "longitude": { S: data.longitude.toString() },
            "timestamp": { S: data.timestamp.toString() }
        }
    });
};

function getPositionParam(data) {
    return ({
        TableName: "marcos",
        Key: {
            "id": { S: data.polo.toString() },
        }
    });
}

function getDistance(p1, p2) {
    const distX = p1.latitude - p2.latitude;
    const distY = p1.longitude - p2.longitude;
    const distance = Math.sqrt(distX * distX + distY * distY);
    return distance;
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => res.send());

app.post('/update', (req, res) => {
    console.log(req);
    res.send();
});

app.post('/emoji', (req, res) => {
    console.log(req);
    res.send();
});

io.on('connection', socket => {
    socket.on('emoji', data => {
       console.log(data);
        io.to(POLO).emit('showemoji', data);
    });
    socket.on('position', data => {
        let param = putPositionParam(data);
        POLO = data.polo;
        socket.join(data.marco);

        db.putItem(param, (error, result) => {
            if (error) { console.log(error); }
            else {
                const marco_data = data;
                param = getPositionParam(data);
                db.getItem(param, (error, result) => {
                    if (error || !result.Item) { console.log("error:", error, result); }
                    else {
                        const polo_response = result;
                        const distance = getDistance({
                            latitude: parseFloat(marco_data.latitude),
                            longitude: parseFloat(marco_data.longitude)
                        }, {
                            latitude: parseFloat(polo_response.Item.latitude.S),
                            longitude: parseFloat(polo_response.Item.longitude.S)
                        });

                        socket.emit('distance', { "distance": distance });
                    }
                });
            }
        });
    });
    socket.on('marcopolo', data => {
        console.log(data);
    });
    socket.on('polo', data => {
        POLO = data.polo;
        MARCO = data.marco;
        console.log('polo event');
        console.log(data);
    });
});

io.on('disconnect', socket => {
    console.log('byebye');
});

server.listen(port);
console.log("geo api listening on port " + port);
