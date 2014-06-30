var express = require('express'),
    mongoose = require('mongoose'),
    util = require('util'),
    _ = require('lodash'),
    app = express()

app.set('port', process.env.PORT || 3000)
app.set('mongodb-url', process.env.MONGODB_URL || 'mongodb://localhost/hangman')

if ('test' === app.get('env')) {
  app.set('port', 9000)
  app.set('mongodb-url', 'mongodb://localhost/hangman-test')
}

mongoose.connect(app.get('mongodb-url'))

var User = mongoose.model('User', (function() {
  return mongoose.Schema({
    'email_address': {type: String, required: 'Missing required field [{PATH}]'},
    'password': {type: String, required: 'Missing required field [{PATH}]'}
  })
})())

app.use(require('morgan')('dev'))
app.use(require('body-parser').urlencoded({extended: true}))

app.get('/', function(req, res) {
  res.json({
    'index': '/',
    'me': '/me',
    'prisoners': '/prisoners'
  })
})

app.post('/me', function(req, res) {
  new User(req.body).save(function(err, user) {
    if (err) {
      return res.send(400, {
        'status': 'Bad Request',
        'status_code': 400,
        'description': _(err.errors).chain().values().pluck('message').join(', ').value()
      })
    }
    res.location(util.format('/users/%s', user.id))
    res.send(201)
  })
})

if (require.main === module) {
  mongoose.connection.on('connected', function() {
    console.log('Connected to %s', app.get('mongodb-url'))
    app.listen(app.get('port'), function() {
      console.log('Listening on port %d', app.get('port'))
    })
  })
}
