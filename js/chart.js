const express = require('express');
const router = express.Router();
const Access = require('../model/access');
const logger = require('../config/winston');
const moment = require('../config/moment')

/**
 * View stat graph
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
       res.render('chart.html', {data:JSON.stringify(data), option:JSON.stringify({type:type})});
       }
  });
})

module.exports = router;