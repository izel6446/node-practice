const express = require('express');
const router = express.Router();
const User = require('../model/user');
const Access = require('../model/access');
const Util = require('./node-util')
const logger = require('../config/winston');
const geoip = require('geoip-country');
const moment = require('../config/moment')

/**
 * Generate user
 */
router.get('/user', function(req, res){
  const user = new User();
  user.userid = Util.makeid(6, 3);
  user.age = Util.randomAge();
  user.sex = Util.randomItem(['남','여']);
  user.region = Util.randomItem(['서울','경기','강원','충북','충남','전북','전남','경북','경남','대전','대구','부산','울산','광주','세종']),
  
  user.save(function(err){
       if(err){ 
           logger.error(err);
           res.json({result: -1});
           return;
       }

       res.json({result: 1, data:user});

   });
})

/**
* View user by userid
*/
router.get('/user/find/:id', function(req, res){
     const id = req.params.id;
     User.find({userid:id})
          .then(user => {
               res.status(200).json({
               result: 1,
               data: user
               })
          })
          .catch(err => {
            res.status(500).json({
              result: -1,
              message: err
            });
          });
   })

/**
* View all user list
*/
router.get('/user/list', function(req, res){
  User.find()
       .then(user => {
            res.status(200).json({
            result: user.length,
            data: user
            })
       })
       .catch(err => {
         res.status(500).json({
           result: -1,
           message: err
         });
       });
})

/**
* View all access list
*/
router.get('/access/list', function(req, res){
  // timestamp
  // start default 1 month ago
  const start = typeof req.query.start === "undefined" ? moment().subtract(1, 'M') : moment(req.query.start);
  // end default now
  const end = typeof req.query.end === "undefined" ? moment() : moment(req.query.end);

  Access.find(
          {
               $and:[
                    {
                    'timestamp':{$gte: start.toDate()}
                    }, {
                    'timestamp':{$lt: end.toDate()}
                    }
               ]
          }
     ).populate('user')
       .then(access => {
            res.status(200).json({
            result: access.length,
            data: access
            })
       })
       .catch(err => {
         res.status(500).json({
            result: -1,
           message: err
         });
       });
})

/**
* Generate access data
*/
router.get('/access', function(req, res){
  const stat = new Access();
  User.find().then(
       user => {
            // const addr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const addr = Util.randomIpv4();
            const geo = geoip.lookup(addr);
            const geo_code = geo==null?'KR':geo.country;
            stat.timestamp = Date.now();
            stat.client = {
                 geo: geo_code,
                 ip: addr
            }
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
                     logger.error(err);
                     res.json({result: -1});
                     return;
                 }
                 res.json({result: 1, data:stat});
             });
       }
  )     
})

module.exports = router;