var webhook = require('..')
var test = require('tape')
var http = require('http')
var spec = require('./spec')

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
  t.end()
})
