const express = require('express')
const request = require('request')
const app = express()
const port = 3000

app.use(express.static('public'))

app.get('/img/:url', function (req, res) {
    request(req.params.url).pipe(res);
})

app.get('/healthcheck', function (req, res) {
    res.sendStatus(200);
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})