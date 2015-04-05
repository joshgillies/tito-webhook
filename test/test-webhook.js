var serverTest = require('servertest')
var webhook = require('..')('/')
var test = require('tape')
var http = require('http')
var fs = require('fs')

var app = http.createServer(function server (req, res) {
  webhook(req, res, function onNext (err, data) {
    res.end(err ? err.toString() : JSON.stringify(data))
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
    t.end()
  })

  serverStream.end('test')
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
    t.end()
  })

  rs.pipe(serverStream)
})
