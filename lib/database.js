var mysql = require('mysql')
var connection = mysql.createConnection({
    host:'localhost',
    user: 'root',
    password: 'Lime0874!!',
    // port: 3306,
    database: 'travel_app'
});
module.exports = connection;
// connection.connect();

// connection.query('SELECT * FROM testTable', function(err, results, fields) {
//   if (err) {
//     console.log(err);
//   }
//   console.log(results);
// });

// connection.end();
