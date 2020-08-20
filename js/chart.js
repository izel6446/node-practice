const express = require('express');
const router = express.Router();
const Access = require('../model/access');
const logger = require('../config/winston');
const moment = require('../config/moment')

const client = {key:'클라이언트', data:[{key:"client.geo", value:"지역 코드"}, {key:"client.ip", value:"IP"}]}
const agent = {key:'에이전트', data:[{key:"agent.os", value:"OS"}, {key:"agent.platform", value:"플랫폼"}, {key:"agent.browser", value:"브라우저"}, {key:"agent.version", value:"버전"}]}
const board = {key:'게시판', data:[{key:"board", value:"게시판"}]}
const user = {key:'사용자', data:[{key:"user.userid", value:"사용자 ID"}, {key:"user.age", value:"연령"}, {key:"user.sex", value:"성별"}, {key:"user.region", value:"지역"}]}
  
const statList = [client, agent, board, user]

function getValue(key) {
  return statList.flatMap(x=>x.data).find(y=>y.key===key).value;
}

router.post('/stat/list', function(req, res){
  res.send(statList);
})

/**
 * View stat time graph
 */
router.get('/stat/time', function(req, res){
     const isDataOnly = req.query.dataonly != null;
     const type = req.query.type || 'bar';
     // timestamp
     // start default 1 month ago
     const start = typeof req.query.start === "undefined" ? moment().subtract(1, 'M') : moment(req.query.start);
     // end default now
     const end = typeof req.query.end === "undefined" ? moment() : moment(req.query.end);
      
     Access.aggregate([
          {
             $match:{ 
                  $and:[
                       {'timestamp':{$gte: start.toDate()}}, {'timestamp':{$lt: end.toDate()}}
                  ]
               }
          }, {
               $group:{
               _id:{"date":{$dateToString:
                    {format:"%Y-%m-%d %H", date:"$timestamp", timezone:"+09"}
                           }
               }, value:{$sum:1}
          }
          }, {
               $sort:{"_id.date":1}
          }
     ]).then(function(result){
          let data = {};
          logger.debug(JSON.stringify(result))
          if (result.length !== 0 && result[0]._id != null && typeof result[0]._id !== "undefined"){
               data = result;
          }
          if(isDataOnly) {
               res.send(data);
          } else {
          res.render('chart.html', {data:JSON.stringify(data), option:JSON.stringify({type:type, isTimegraph:true})});
          }
     });
   })

/**
 * View stat field graph
 */
router.get('/stat/:field', function(req, res){
  const isDataOnly = req.query.dataonly != null;
  const field = req.params.field;
  const type = req.query.type || 'bar';
  // sort key [value or _id]
  const sort_key = req.query.sort_key || 'value';
  // sort value [-1:desc or 1:asc]
  const sort_value = req.query.sort_value || "-1";
  const limit = req.query.limit || "10";
  // timestamp
  // start default 1 month ago
  const start = typeof req.query.start === "undefined" ? moment().subtract(1, 'M') : moment(req.query.start);
  // end default now
  const end = typeof req.query.end === "undefined" ? moment() : moment(req.query.end);

  const sort_object = {};
  sort_object[sort_key] = sort_value*1;

  Access.aggregate([
       {
            $lookup: {
                 from:'users', 
                 localField:'user', 
                 foreignField:'_id', 
                 as: 'user'
               }
       }, {
          $match:{ 
               $and:[
                    {
                       'timestamp':{$gte: start.toDate()}
                    }, {
                       'timestamp':{$lt: end.toDate()}
                    }
              ]
             }
       }, {
            $group:{
                 "_id":"$"+field, 
                 value:{"$sum":1}
               }
       }, {
            $sort:sort_object
       }, {
            $limit:limit*1
       }
  ]).then(function(result){
       let data = {};
       logger.debug(JSON.stringify(result))
       if (result.length !== 0 && result[0]._id != null && typeof result[0]._id[0] !== "undefined"){
            data = result;
       }
       if(isDataOnly) {
            res.send(data);
       } else {
       res.render('chart.html', {data:JSON.stringify(data), option:JSON.stringify({type:type, title:getValue(field)})});
       }
  });
})

module.exports = router;