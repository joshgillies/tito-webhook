var jsonBody = require('body/json')
var sendPlain = require('send-data/plain')

module.exports = function (accessKey) {
  return function webhook (req, res, next) {
    function makeError (message, statusCode) {
      var error = new Error(message)
      error.statusCode = statusCode || 500
      return error
    }

    function handleError (err) {
      sendPlain(req, res, {
        body: err.toString(),
        statusCode: err.statusCode
      })
    }

    function handlePost (err, body) {
      if (err) return next(err)
      next(null, body)
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

    if (req.url === accessKey) {
      if (req.method === 'POST') {
        if (req.headers['x-webhook-name']) return processWebhook(req.headers['x-webhook-name'])

        handleError(makeError('Missing header', 400))
      } else {
        handleError(makeError('Method not supported: ' + req.method, 405))
      }
    } else {
      next()
    }
  }
}
