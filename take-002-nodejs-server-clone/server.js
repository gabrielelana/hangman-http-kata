var express = require('express'),
    mongoose = require('mongoose'),
    app = express()

app.set('port', process.env.PORT || 3000)
app.set('mongodb-url', process.env.MONGODB_URL || 'mongodb://localhost/hangman')

if ('test' === app.get('env')) {
  app.set('port', 9000)
  app.set('mongodb-url', 'mongodb://localhost/hangman-test')
}

mongoose.connect(app.get('mongodb-url'))

app.use(require('morgan')('dev'))
app.use(require('body-parser').json())

app.get('/', function(req, res) {
  res.json({
    'index': '/',
    'me': '/me',
    'prisoners': '/prisoners'
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
