var express = require('express');
var redis = require('redis');
var fs = require('fs');
var path = require('path');
var readline = require('readline');
var baseRedirectDomain = process.env.BASE_REDIRECT_DOMAIN;


var app = express();
app.set('port', process.env.PORT || 3000);


var redisUrl = process.env.REDIS_URL;
var redisKey = process.env.REDIS_KEY;
var client = redis.createClient(6380, redisUrl, { auth_pass: redisKey, tls: { servername: redisUrl } });

app.get('/refresh', function(req, res) {
    var filePath = path.join(__dirname, 'redirects.csv');
    var reader = readline.createInterface({
        input: fs.createReadStream(filePath)
    });

    reader.on('line', function(line) {
        var vals = line.split(',');
        client.set(vals[0],vals[1], function (err, reply) {
            //console.log(reply);
        });
    });
    
    reader.on('error', function (err) {
        res.end(err);
    });
    
    // Set test urls
    client.set('exists', 'exists-true');
    client.set('hello', 'hello-there');
    
    res.send('Done!');
});

app.get('/*', function (req, res) {
    
    //Get url sans query string and leading slash
    var url = req.url.split('?')[0].replace('/', '');
    
    // See if you can get url from Redis
    client.get(url, function (err, data) {
        if (data == null) {
            client.hincrby("404", url, 1);
            res.send('Not found');

            //res.redirect(301, baseRedirectDomain);
        } else {
            
            // Log stats
            client.incr(data + '-stats');
            
            //Redirect the customer
            res.redirect(301, baseRedirectDomain + data);
        }
    });

});


app.listen(app.get('port'), function() {
    //console.log('Example app listening on port 3000!');
});
