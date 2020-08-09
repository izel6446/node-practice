process.env.NODE_ENV = ( process.env.NODE_ENV && ( process.env.NODE_ENV ).trim().toLowerCase() == 'production' ) ? 'production' : 'development';

const http = require('http');
const url = require('url');
const fs = require('fs');
const express = require('express');
const geoip = require('geoip-country');
const app = express();
const bodyParser  = require('body-parser');
const useragent = require('express-useragent');
const helmet = require("helmet");
const logger = require('./config/winston');
const dummy = require('./js/dummy');
const chart = require('./js/chart');
const db = require('./config/mongo');
// const scheduler = require('./js/scheduler')

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
     const geo_name = geo==null?'KR':geo.country;
     logger.info(addr + " (" + geo_name + ")");
     res.render('index.html');
})
 
//---------------------------------------------//
 logger.info("Starting Web Application")
 app.listen(80, '0.0.0.0', function(){
     logger.info("Web Application Initialized");
})