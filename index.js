var jsonBody = require('body/json')

module.exports = function webhook (route, callback) {
  if (!route) throw new TypeError('webhook access route required')

  return function handler (req, res, next) {
    function makeError (message, statusCode) {
      var error = new Error(message)
      error.statusCode = statusCode || 500
      return error
    }

    function handleError (err) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.statusCode = err.statusCode
      res.end(err.toString())
    }

    function handlePost (err, body) {
      callback(err, body)
      res.statusCode = err ? 500 : 200
      res.end(err ? err.toString() : 'ok')
    }

    function processWebhook (name) {
      var accepted = [
        'ticket.created',
        'ticket.updated',
        'ticket.voided',
        'ticket.unsnoozed',
        'ticket.reassigned'
      ]
      if (~accepted.indexOf(name)) jsonBody(req, res, handlePost)
      else handleError(makeError('Unknown webhook name: ' + name, 400))
    }

    if (req.url !== route) return next()

    if (req.method !== 'POST') {
      res.writeHead(req.method === 'OPTIONS' ? 200 : 405, {'Allow': 'OPTIONS, POST'})
      res.end()
      return
    }

    if (req.headers['x-webhook-name']) return processWebhook(req.headers['x-webhook-name'])
    else handleError(makeError('Missing header', 400))
  }
}
