var jsonBody = require('body/json')

module.exports = function (accessKey) {
  return function webhook (req, res, next) {
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
      else next(new Error('Unknown webhook name: ' + name))
    }

    if (req.url === accessKey) {
      if (req.method === 'POST') {
        if (req.headers['x-webhook-name']) return processWebhook(req.headers['x-webhook-name'])

        next(new Error('Missing header'))
      } else {
        next(new Error('Method not supported: ' + req.method))
      }
    } else {
      next()
    }
  }
}
