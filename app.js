process.env.NODE_ENV = ( process.env.NODE_ENV && ( process.env.NODE_ENV ).trim().toLowerCase() == 'production' ) ? 'production' : 'development';

const http = require('http');
const url = require('url');
const fs = require('fs');
const express = require('express');
const geoip = require('geoip-country');
const app = express();
const bodyParser  = require('body-parser');
const mongoose    = require('mongoose');
const useragent = require('express-useragent');
const helmet = require("helmet");
const db = mongoose.connection;
const logger = require('./config/winston');
const dummy = require('./js/dummy');
const chart = require('./js/chart');

mongoose.set('debug', function (collectionName, method, query, doc) {
     logger.debug(JSON.stringify(query));
});
db.on('error', function(err){
     logger.error(err);
     logger.error("Shutting Down Application...");
     process.exit(1);
});
db.once('open', function(){
     logger.info("Connected to mongod server");
});

logger.info("Connecting mongodb..")
mongoose.connect('mongodb://localhost/stat', { useNewUrlParser: true });

app.use(useragent.express())
app.use(helmet());
app.use('/script', express.static(__dirname+"/node_modules"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('views', __dirname+'/web');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use('/dummy', dummy);
app.use('/chart', chart);

app.get('/', function(req, res){
     const addr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
     const geo = geoip.lookup(addr);
     const geo_name = geo==null?'PRIV':geo.country;
     logger.info(addr + " (" + geo_name + ")");
     res.render('index.html');
})

 //---------------------------------------------//
 logger.info("Starting Web Application")
 app.listen(80, '0.0.0.0', function(){
     logger.info("Web Application Initialized");
})