var serverTest = require('servertest')
var webhook = require('..')
var test = require('tape')
var http = require('http')
var spec = require('./spec')
var fs = require('fs')

var _webhook = webhook('/', function hook (err, data) {
  // supress tape output for err
  // in this case it's fine to do so
  if (err) return
  // console.log(JSON.stringify(data))
})

var app = http.createServer(function server (req, res) {
  _webhook(req, res)
})

var tests = spec(app)

test('Vanilla HTTP', function (t) {
  Object.keys(tests).forEach(function runner (_test) {
    t.test(_test, tests[_test])
  })
  t.test('recieve data', function (t) {
    var file = __dirname + '/fixtures/example.json'
    var data = fs.readFileSync(file)
    var rs = fs.createReadStream(file)
    var opts = {
      encoding: 'utf8',
      method: 'POST',
      headers: {
        'x-webhook-name': 'ticket.created'
      }
    }

    function hook (err, _data) {
      t.ifError(err, 'no error')
      t.deepEqual(_data, JSON.parse(data.toString()), 'original data returned')
      t.end()
    }

    rs.pipe(serverTest(http.createServer(webhook('/', hook)), '/', opts))
  })
  t.end()
})
