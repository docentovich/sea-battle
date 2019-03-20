const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const Pusher = require('pusher');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


const APP_ID = '738828';
const KEY = '050830562651109a4451';
const secret = 'f05192e0363cf9bbd8b3';
const cluster = 'eu';

console.log(APP_ID);
const pusher = new Pusher({
    appId: APP_ID,
    key: KEY,
    secret: secret,
    cluster: cluster,
    encrypted: true
});

app.use(express.static('./dist/battleship'));

app.all('/*', function(req, res, next) {
    console.log('all');

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
});

app.post('/pusher/auth', function(req, res) {
    console.log('auth');

    let socketId = req.body.socket_id;
    let channel = req.body.channel_name;
    console.log(socketId, channel);
    let presenceData = {
        user_id: crypto.randomBytes(16).toString("hex")
    };
    let auth = pusher.authenticate(socketId, channel, presenceData);
    console.log(auth);

    res.send(auth);
});

app.get('*', (req, res) => {
    console.log('request');
    res.sendFile(path.join(__dirname, './dist/battleship/index.html'));
});

var port = process.env.PORT || 3000;
app.listen(port, () => console.log('Listening at http://localhost:3000'));