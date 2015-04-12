# tito-webhook

A Node.js middleware for Tito webhook requests.

[![Build Status](https://travis-ci.org/joshgillies/tito-webhook.svg)](https://travis-ci.org/joshgillies/tito-webhook)

## Example

### Vanilla `require('http')`:

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

### Connect:

```js
var webhook = require('tito-webhook')
var connect = require('connect')

var app = connect()

app.use(webhook('/', function done (err, data) {
  if (err) console.log(err)
  conosle.log(JSON.stringify(data))
})

app.listen(1337)
```

### Express:

```js
var webhook = require('tito-webhook')
var express = require('express')

var app = express()

app.use(webhook('/', function done (err, data) {
  if (err) console.log(err)
  conosle.log(JSON.stringify(data))
})

app.listen(1337)
```

## API

### webhook(path, callback)

## License

MIT
