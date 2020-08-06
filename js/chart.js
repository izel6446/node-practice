const express = require('express');
const router = express.Router();
const Access = require('../model/access');
const logger = require('../config/winston');

router.use(function log(req, res, next){
  const query = JSON.stringify(req.query);
  const params = JSON.stringify(req.params);
  logger.info(`Chart | Q=${query}, P=${params}`);
  next();
});

/**
 * View stat graph
 */
router.get('/stat/:field', function(req, res){
  const field = req.params.field;
  const type = req.query.type || 'bar';
  // sort key [value or _id]
  const sort_key = req.query.sort_key || 'value';
  // sort value [-1:desc or 1:asc]
  const sort_value = req.query.sort_value || "-1";
  const limit = req.query.limit || "10";

  const sort_object = {};
  sort_object[sort_key] = sort_value*1;

  Access.aggregate([
       {
            $lookup: {from:'users', localField:'user', foreignField:'_id', as: 'user'}
       }, {
            $group:{"_id":"$"+field, value:{"$sum":1}}
       }, {
            $sort:sort_object
       }, {
            $limit:limit*1
       }
  ]).then(function(result){
       let data = {};
       logger.debug(JSON.stringify(result))
       if (result[0]._id != null && typeof result[0]._id[0] !== "undefined"){
            data = result;
       } res.render('chart.html', {data:JSON.stringify(data), option:JSON.stringify({type:type})});
  });
})

module.exports = router;