const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const app = express()
const router = express.Router()
const config = require('./config')
const tokenList = {}


router.get('/', (req, res, next) => {
    res.status(200).json('Ok');
})

router.post('/login', (req, res, next) => {

    console.log("/login => req", req.body);

    const postData = req.body;
    const user = {
        "name": postData.name,
        "password": postData.password
    }

    // do the database authentication here, with user name and password combination.
    const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife })
    const refreshToken = jwt.sign(user, config.refreshTokenSecret, { expiresIn: config.refreshTokenLife })
    const response = {
        "status": "Logged in",
        "token": token,
        "refreshToken": refreshToken,
    }

    tokenList[refreshToken] = response
    res.status(200).json(response);
})

router.post('/token', (req, res, next) => {
    // refresh the damn token
    const postData = req.body
    // if refresh token exists
    if ((postData.refreshToken) && (postData.refreshToken in tokenList)) {
        const user = {
            "name": postData.name,
            "password": postData.password
        }
        const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife })
        const response = {
            "token": token,
        }
        // update the token in the list
        tokenList[postData.refreshToken].token = token
        res.status(200).json(response);
    } else {
        res.status(404).send('Invalid request')
    }
})

//Configura a proxima get... para receber uma checagem
// router.use(require('./tokenChecker'));
router.get('/secure', (req, res, next) => {
    // all secured routes goes here
    res.send('Autenticado com sucesso...')
});


app.use(function (req, res, next) {
    // res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST,GET,OPTIONS,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
    console.log("CORS", req.body);
});

app.use(bodyParser.json())
app.use('/api', router)
app.listen(3001, function () {
    console.log("http://localhost:3001/api");
});
//https://codeforgeek.com/2018/03/refresh-token-jwt-nodejs-authentication/