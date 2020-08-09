require('dotenv').config();
const mongoose    = require('mongoose');
const logger = require('./winston');
const db = mongoose.connection;

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

const db_user = process.env.DB_USER;
const db_pwd = process.env.DB_PASSWORD;
const db_host = process.env.DB_HOST;
const db_database = process.env.DB_DATABASE;
if(db_user == null || db_pwd == null || db_host == null || db_database == null){
  logger.error("You must input db")
  logger.error(`DB_USER=${process.env.DB_USER}, DB_PASSWORD=[Entrypted], DB_HOST=${process.env.DB_HOST}, DB_DATABASE=${process.env.DB_DATABASE}`);
  process.exit(2);
}

logger.info("Connecting mongodb..")
mongoose.connect(`mongodb://${db_user}:${db_pwd}@${db_host}/${db_database}`, { useNewUrlParser: true });
// mongoose.connect('mongodb://13.125.232.120/stat', { useNewUrlParser: true });

module.exports = db;