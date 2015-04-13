var serverTest = require('servertest')
var fs = require('fs')

module.exports = function tests (app) {
  return {
    'unsupported HTTP methods': function (t) {
      serverTest(app, '/', { encoding: 'utf8', method: 'GET' }, function (err, res) {
        t.ifError(err, 'no error')
        t.equal(res.statusCode, 405, 'correct statusCode')
        t.end()
      })
    },
    'missing header \'x-webhook-name\'': function (t) {
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
    },
    'unknown \'x-webhook-name\' value': function (t) {
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
    },
    'malformed POST data': function (t) {
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
    },
    'process webhook': function (t) {
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
    }
  }
}
