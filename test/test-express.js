var serverTest = require('servertest')
var webhook = require('..')
var test = require('tape')
var express = require('express')
var http = require('http')
var spec = require('./spec')

var webhookServer = express()

webhookServer.use(webhook('/', function hook (err, data) {
  // supress tape output for err
  // in this case it is fine
  if (err) return
  // console.log(JSON.stringify(data))
}))
webhookServer.use('/test', function (req, res) {
  res.end('passthrough')
})

// wrap webhookServer in http.createServer
// so servertest can manage its life cycle
var app = http.createServer(webhookServer)

var tests = spec(app)

test('Express', function (t) {
  t.test('middleware passthrough', function (t) {
    serverTest(app, '/test', { encoding: 'utf8', method: 'GET' }, function (err, res) {
      t.ifError(err, 'no error')
      t.equal(res.statusCode, 200, 'correct statusCode')
      t.equal(res.body, 'passthrough', 'correct body content')
      t.end()
    })
  })
  Object.keys(tests).forEach(function runner (_test) {
    t.test(_test, tests[_test])
  })
  t.end()
})
