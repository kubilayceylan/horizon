var bodyParser = require('body-parser');
var mongoose = require('mongoose');


// Connect database
mongoose.connect(
    process.env.MONGODB_CONNECTION_STRING,
    {useNewUrlParser: true}
);

//Create a schema
var todoSchema = new mongoose.Schema({
  item: String
});

// Use the schema
var Todo = mongoose.model('Todo', todoSchema);

var urlencodedParser = bodyParser.urlencoded({extended: false});


module.exports = function (app) {


  app.get('/', function (req, res) {

    var amqp = require('amqplib');

    amqp.connect('amqp://rabbitmq:password@172.21.239.237:5672').then(function(conn) {
      process.once('SIGINT', function() { conn.close(); });
      return conn.createChannel().then(function(ch) {
        var ok = ch.assertQueue('demo_queue', {durable: true});
        ok = ok.then(function() { ch.prefetch(1); });
        ok = ok.then(function() {
          ch.consume('demo_queue', doWork, {noAck: false});
          console.log(" [*] Waiting for messages. To exit press CTRL+C");
        });
        return ok;

        function doWork(msg) {
          var body = msg.content.toString();
          console.log(" [x] Received '%s'", body);
          //console.log(" [x] Task takes %d seconds", secs);
          var secs = body.split('.').length - 1;
          setTimeout(function() {
            let jsonmsg = {item: msg.content.toString()};
            Todo(jsonmsg).save(function (err, data) {
              if (err) throw err;
            });
            console.log(" [x] Done");
            ch.ack(msg);
          }, secs * 10000);
        }
      });
    }).catch(console.warn);


    /*

    amqp.connect('amqp://rabbitmq:password@172.21.239.237:5672', function (error0, connection) {
      if (error0) {
        throw error0;
      }
      connection.createChannel(function (error1, channel) {
        if (error1) {
          throw error1;
        }

        function waitAndConsume(msg) {
          console.log(" [x] Received %s", msg.content.toString());
          setTimeout(function () {
            let jsonmsg = {item: msg.content.toString()};
            console.log(" [x] Done");
            Todo(jsonmsg).save(function (err, data) {
              if (err) throw err;
            });
            channel.ack(msg);
          }, 10000);
        }


        let queue = 'test3';


        channel.assertQueue(queue, {
          durable: true
        });

        channel.qos(1);

        channel.prefetch(1);

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

        channel.consume(queue, waitAndConsume, {
          noAck: false
        });
      });
    });

    */


    //get data from mongodb and pass it to view
    Todo.find({}, function (err, data) {
      if (err) throw err;
      console.log(data);
      res.render('todo', {todos: data});
    });
  });

  /*
  app.post('/todo', urlencodedParser, function (req,res) {
    //get data from the view and add it to mongodb
    Todo(req.body).save(function (err, data) {
      if (err) throw err;
      res.json(data);
    });
  });


   */

  app.delete('/todo/:item', function (req, res) {
    //delete requested data from mongodb
    Todo.find({item: req.params.item.replace(/\-/g, " ")}).remove(function (err, data) {
      if (err) throw err;
      res.json(data);
    });
  });

};