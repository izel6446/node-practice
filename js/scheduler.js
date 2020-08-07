const schedule = require('node-schedule');
const request = require('request')
const logger = require('../config/winston');


const scheduler = schedule.scheduleJob('* * * * * *', function(){
  request(
    {
       uri: "http://localhost/dummy/access", 
       method: "GET", 
       timeout: 10000, 
       followRedirect: true, 
       maxRedirects: 10 
    }, function(error, response, body) { 
         if(error) logger.error(error);
       });
});

module.exports = scheduler;