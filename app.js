'use strict';

// [START gae_node_request_example]
const express = require('express');

const app = express();


//DISK DATABASE
const sqlite3 = require('sqlite3').verbose();
// create a new database file users.db or open existing users.db
const ip_db = new sqlite3.Database('./Database/ip.db', (err) => {
  if (err) {
      console.error(err.message);
  }
  console.log('Connected to the ip.db database.');
});

ip_db.run('CREATE TABLE IF NOT EXISTS ip(ip_address text)', (err) => {
  if (err) {
    console.log(err);
    throw err;
  }
});

app.get('/setip/:ip', (req, res) => {
  if(!req.params.ip){
    res.status(404).send("please specify ip").end();
    return;
  }
  const ip = req.params.ip;
  ip_db.serialize(() => {
    ip_db.run('DELETE FROM ip');
    ip_db.run('INSERT INTO ip(ip_address) VALUES(?)', [ip],function(err) { 
			if (err) {							
				console.log("error during insert to inventory:"+err);							
			}
		});
  });

  
  res.status(200).send('ip set : '+ip).end();

});

async function getIP(){
  return new Promise(resolve => {
		try{
			ip_db.all(`SELECT * FROM ip`, (err, rows) => {
			  if (err) {
          resolve({ok:false, data:err});
          return;
        }
        if(rows) {
          if( rows.length == 0){
            resolve( {ok:true, data:'no ip set'});
          }else{
            resolve( {ok:true, data:rows[0].ip_address});
          }
        
        }else {
          resolve( {ok:true, data:'no ip set'});
        }
			  });
		  } catch(error){
			 resolve( {ok:false, data:error})
		  }
	});
}

app.get('/getip', (req, res) => {

  getIP().then(result=>{
    if(result.ok){
      res.status(200).send('ip set : '+result.data).end();
    }else{
      res.status(200).send('error : '+result.data).end();
    }
  });

});

app.get('/', (req, res) => {
  getIP().then(result=>{
    if(result.ok){
      res.status(200).send('<html><script>window.location.href="http://' +result.data+ '"</script></html>');
    }else{
      res.status(200).send('error : '+result.data).end();
    }
});

app.get('/r1', (req, res) => {
  res.redirect('185.110.110.191/');
});
app.get('/r2', (req, res) => {
  res.status(200).send('<html><script>window.location.href="185.110.110.191/"</script></html>');
});
app.get("/r3", (req, res) => {
  res.status(200).send('<html><script>window.location.href="185.110.110.191"</script></html>');
});
app.get("/r4", (req, res) => {
  res.status(200).send('<html><script>window.location.href="http://185.110.110.191"</script></html>');
});
app.get("/r5", (req, res) => {
  getIP().then(result=>{
    if(result.ok){
      res.status(200).send('<html><script>window.location.href="http://' +result.data+ '"</script></html>');
    }else{
      res.status(200).send('error : '+result.data).end();
    }
  });

 

})


// Start the server
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END gae_node_request_example]

module.exports = app;