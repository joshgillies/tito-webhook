# tito-webhook
A Node.js middleware for Tito webhook requests.

[![Build Status](https://travis-ci.org/joshgillies/tito-webhook.svg)](https://travis-ci.org/joshgillies/tito-webhook)

## Example

```js
var webhook = require('tito-webhook')
var http = require('http')

var _webhook = webhook('/', function done (err, data) {
  if (err) console.log(err)
  conosle.log(JSON.stringify(data))
})

var app = http.createServer(function server (req, res) {
  _webhook(req, res, function next () {
    res.statusCode = 404
    res.end()
  })
})

app.listen(1337)
```
