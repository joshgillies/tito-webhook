var serverTest = require('servertest')
var webhook = require('..')
var test = require('tape')
var connect = require('connect')
var http = require('http')
var fs = require('fs')

var webhookServer = connect()

webhookServer.use(webhook('/', function hook (err, data) {
  // supress tape output for err
  // in this case it's fine to do so
  if (err) return
  console.log(JSON.stringify(data))
}))
webhookServer.use('/test', function (req, res) {
  res.end('passthrough')
})

// wrap webhookServer in http.createServer
// so servertest can manage its life cycle
var app = http.createServer(webhookServer)

test('middleware passthrough', function (t) {
  serverTest(app, '/test', { encoding: 'utf8', method: 'GET' }, function (err, res) {
    t.ifError(err, 'no error')
    t.equal(res.statusCode, 200, 'correct statusCode')
    t.equal(res.body, 'passthrough', 'correct body content')
    t.end()
  })
})

test('unsupported HTTP methods', function (t) {
  serverTest(app, '/', { encoding: 'utf8', method: 'GET' }, function (err, res) {
    t.ifError(err, 'no error')
    t.equal(res.statusCode, 405, 'correct statusCode')
    t.end()
  })
})

test('missing header \'x-webhook-name\'', function (t) {
  var opts = {
    encoding: 'utf8',
    method: 'POST'
  }
  var serverStream = serverTest(app, '/', opts, function (err, res) {
    t.ifError(err, 'no error')
    t.equal(res.statusCode, 400, 'correct statusCode')
    t.equal(res.body, 'Error: Missing header', 'correct body content')
    t.end()
  })

  serverStream.end('test')
})

test('unknown \'x-webhook-name\' value', function (t) {
  var opts = {
    encoding: 'utf8',
    method: 'POST',
    headers: {
      'x-webhook-name': 'fail'
    }
  }
  var serverStream = serverTest(app, '/', opts, function (err, res) {
    t.ifError(err, 'no error')
    t.equal(res.statusCode, 400, 'correct statusCode')
    t.equal(res.body, 'Error: Unknown webhook name: fail', 'correct body content')
    t.end()
  })

  serverStream.end('test')
})

test('malformed POST data', function (t) {
  var opts = {
    encoding: 'utf8',
    method: 'POST',
    headers: {
      'x-webhook-name': 'ticket.created'
    }
  }
  var serverStream = serverTest(app, '/', opts, function (err, res) {
    t.ifError(err, 'no error')
    t.equal(res.statusCode, 500, 'correct statusCode')
    t.equal(res.body, 'SyntaxError: Unexpected end of input', 'correct body content')
    t.end()
  })

  serverStream.end('{"test":"what')
})

test('process webhook', function (t) {
  var rs = fs.createReadStream(__dirname + '/fixtures/example.json')
  var opts = {
    encoding: 'utf8',
    method: 'POST',
    headers: {
      'x-webhook-name': 'ticket.created'
    }
  }
  var serverStream = serverTest(app, '/', opts, function (err, res) {
    t.ifError(err, 'no error')
    t.equal(res.statusCode, 200, 'correct statusCode')
    t.equal(res.body, 'ok', 'correct body content')
    t.end()
  })

  rs.pipe(serverStream)
})
