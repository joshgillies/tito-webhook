# tito-webhook
A Node.js middleware for Tito webhook requests.

[![Build Status](https://travis-ci.org/joshgillies/tito-webhook.svg)](https://travis-ci.org/joshgillies/tito-webhook)

## Example

```js
var webhook = require('tito-webhook')
var http = require('http')

var _webhook = webhook('/')

var app = http.createServer(function server (req, res) {
  _webhook(req, res, function onNext (err, data) {

    conosle.log(JSON.stringify(data))

    res.statusCode = err ? 500 : 200
    res.end(err ? err.toString() : 'ok')
  })
})

app.listen(1337)
```
