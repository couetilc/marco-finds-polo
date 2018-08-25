
const express = require('express')
    , router = express.Router()
    , bodyParser = require('body-parser')
    , app = express()
    , port = process.env.PORT || 5555;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

router.route('/update')
    .post((req, res) => {
        //need: { position: {}, marco: [] }
    });

app.use('/', router);

app.listen(port);
console.log("geo api listening on port " + port);
