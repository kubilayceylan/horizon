var express = require('express');
var todoController = require('./controllers/producer');

var app = express();

//set up template engine
app.set('view engine', 'ejs');


//static files
app.use(express.static('./public'));

//fire controllers
todoController(app);

app.listen(3000);
console.log('Listening port 3000');


