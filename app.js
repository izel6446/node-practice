process.env.NODE_ENV = ( process.env.NODE_ENV && ( process.env.NODE_ENV ).trim().toLowerCase() == 'production' ) ? 'production' : 'development';

const http = require('http');
const url = require('url');
const fs = require('fs');
const express = require('express');
const geoip = require('geoip-country');
const app = express();
const bodyParser  = require('body-parser');
const mongoose    = require('mongoose');
const Access = require('./model/access');
const User = require('./model/user');
const useragent = require('express-useragent');
const helmet = require("helmet");
const Util = require('./util')
const db = mongoose.connection;
const logger = require('./config/winston');

logger.info("Starting Web Application")

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


app.get('/', function(req, res){
     const addr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
     const geo = geoip.lookup(addr);
     const geo_name = geo==null?'PRIV':geo.country;
     logger.info(addr + " (" + geo_name + ")");
     res.render('index.html');
})

/**
 * Generate user
 */
app.get('/dummy/user', function(req, res){
     const user = new User();
     user.userid = Util.makeid(6, 3);
     user.age = Util.randomInt(5, 80);
     user.sex = Util.randomItem(['남','여']);
     user.region = Util.randomItem(['서울','경기','강원','충북','충남','전북','전남','경북','경남','대전','대구','부산','울산','광주','세종']),
     
     user.save(function(err){
          if(err){ 
              console.error(err);
              res.json({result: 1});
              return;
          }
  
          res.json({result: 0, data:user});
  
      });
})

/**
 * View all user list
 */
app.get('/dummy/user/list', function(req, res){
     User.find()
          .then(user => {
               res.status(200).json({
               result: 0,
               data: user
               })
          })
          .catch(err => {
            res.status(500).json({
              result: 1,
              message: err
            });
          });
})

/**
 * View all access list
 */
app.get('/dummy/access/list', function(req, res){
     Access.find().populate('user')
          .then(access => {
               res.status(200).json({
               result: 0,
               data: access
               })
          })
          .catch(err => {
            res.status(500).json({
               result: 1,
              message: err
            });
          });
})

/**
 * Generate access data
 */
app.get('/dummy/access', function(req, res){
     const stat = new Access();
     User.find().then(
          user => {
               const addr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
               const geo = geoip.lookup(addr);
               const geo_name = geo==null?'PRIV':geo.country;
               stat.geo = geo_name;
               stat.user = Util.randomItem(user)._id;
               stat.board = Util.randomItem([
                    '게임','패션','유머','스포츠','정치/사회','연예/방송','해외방송','주식',
                    '디지털/IT','지역','기업','정부/기관','미디어','여성','음악','예술','대학',
                    '쇼핑','정치인/유명인','이슈','교통/운송','밀리터리','여행/풍경','교육',
                    '수능','금융/재테크','생물','음식','취미/생활','만화/애니','영화/드라마','건강/심리'
               ]);
               stat.agent = {
                    os:       req.useragent.os, 
                    platform: req.useragent.platform, 
                    browser:  req.useragent.browser, 
                    version:  req.useragent.version
               };
          
               stat.save(function(err){
                    if(err){
                        console.error(err);
                        res.json({result: 0});
                        return;
                    }
                    res.json({result: 1, data:stat});
                });
          }
     )     
})

/**
 * View stat graph
 */
app.get('/chart/stat/:field', function(req, res){
     const field = req.params.field;
     const type = req.query.type || 'bar';
     Access.aggregate([
          {
               $lookup: {from:'users', localField:'user', foreignField:'_id', as: 'user'}
          },
          {
               $group:{"_id":"$"+field, value:{"$sum":1}}
          },{
               $sort:{"value":-1}
          }
     ], function(rr, ra){
          res.render('chart.html', {data:JSON.stringify(ra), option:JSON.stringify({type:type})});
     });
     
})

 //---------------------------------------------//
 app.listen(80, '0.0.0.0', function(){
     logger.info("Web Application Initialized");
})