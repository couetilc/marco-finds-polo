const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 4444;
const aws = require('aws-sdk');
const db = new aws.DynamoDB({region: 'us-east-1'});

function getPositionParam(data) {
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
    });
    socket.on('position', data => {
        const param = getPositionParam(data);

        db.putItem(param, (error, data) => {
            if (error) { console.log(error); }
            else {
                //calculate distance?
            }
        });
    });
    socket.on('marcopolo', data => {
        console.log(data);
    });
});

io.on('disconnect', socket => {
    console.log('byebye');
});

server.listen(port);
console.log("geo api listening on port " + port);
