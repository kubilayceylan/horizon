let bodyParser =require('body-parser');


// Connect database

/*
mongoose.connect(
  process.env.MONGODB_CONNECTION_STRING,
  { useNewUrlParser: true }
);


//Create a schema
let todoSchema = new mongoose.Schema({
  item: String
});

// Use the schema
let Todo = mongoose.model('Todo', todoSchema);


 */

let urlencodedParser = bodyParser.urlencoded({extended: false});



module.exports = function (app) {

  /*

  let amqp1 = require('amqp');
  let connection = amqp1.createConnection({url: "amqp://rabbitmq:password@172.21.239.237:5672"},{defaultExchangeName: ''});
  connection.on('ready', function() {
    console.log('connected');
  });

   */

  app.get('/', function(req,res) {
      res.render('todo');
  });


//Post to RabbitMQ

  app.post('/todo', urlencodedParser, function(req, res) {

    var amqp = require('amqplib/callback_api');

    amqp.connect('amqp://rabbitmq:password@172.21.239.237:5672', function(error0, connection) {
      if (error0) {
        throw error0;
      }
      connection.createChannel(function(error1, channel) {
        if (error1) {
          throw error1;
        }

    var queue = 'load_queue';
    var msg = process.argv.slice(2).join(' ') || req.body.item;

    channel.assertQueue(queue, {
      durable: true
    });
    channel.sendToQueue(queue, Buffer.from(msg), {
      persistent: true
    });
    console.log(" [x] Sent '%s'", msg);
      });
    });
    res.send(200);

    /*
    let messageToSend = req.body.item;
    let queue = "last";
    console.log(messageToSend);
    connection.publish(queue, messageToSend);
    console.log(messageToSend);
    res.send(200);

     */

  });

  app.setMaxListeners(20);
  app.listen(80);


// Consume RabbitMQ




  /*
  app.post('/todo', urlencodedParser, function (req,res) {
    //get data from the view and add it to mongodb
    Todo(req.body).save(function (err, data) {
      if (err) throw err;
      res.json(data);
    });
  });

   */

  /*
  app.delete('/todo/:item', function (req,res) {
    //delete requested data from mongodb
    Todo.find({item: req.params.item.replace(/\-/g, " ")}).remove(function (err, data) {
      if (err) throw err;
      res.json(data);
    });
  });

   */

};


