'use strict';

// [START gae_node_request_example]
const express = require('express');

const app = express();


/*
// Imports the Google Cloud client library.
const {Storage} = require('@google-cloud/storage');

// Instantiates a client. If you don't specify credentials when constructing
// the client, the client library will look for credentials in the
// environment.
const storage = new Storage();
// Makes an authenticated API request.
async function listBuckets() {
  try {
    const results = await storage.getBuckets();

    const [buckets] = results;

    console.log('Buckets:');
    buckets.forEach(bucket => {
      console.log(bucket.name);
    });
  } catch (err) {
    console.error('ERROR:', err);
  }
}
listBuckets();
*/

///////////// DATASTORE ////////////////////
//const crypto = require('crypto');
app.enable('trust proxy');
// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GOOGLE_CLOUD_PROJECT environment variable. See
// https://github.com/GoogleCloudPlatform/google-cloud-node/blob/master/docs/authentication.md
// These environment variables are set automatically on Google App Engine
const {Datastore} = require('@google-cloud/datastore');
// Instantiate a datastore client
const datastore = new Datastore();


async function deleteIpObjects(){
  let query = datastore.createQuery('ip').limit(10);
  const [ress] =  await  datastore.runQuery(query);
  if(ress.length >0){
    const keys = ress.map(r=>{return r[datastore.KEY]});
    const transaction = datastore.transaction();
    await transaction.run(function(err) {
      if (err) {}
      else{
        // Delete a entities.
        transaction.delete(keys);
        transaction.commit(function(err) {
          if (!err) {}
        });
      }
    });
  }
}

async function setIP(ip){
  await deleteIpObjects();
	//save to datatore
	return datastore.save({
		key: datastore.key('ip'),
		data: {ip_address:ip},
  });
  
}

app.get('/setip/:ip', async (req, res) => {
  if(!req.params.ip){
    res.status(404).send("please specify ip").end();
    return;
  }
  const ip = req.params.ip;
  try{
    await setIP(ip);
    res.status(200).send('ip set : '+ip).end();
  }catch(err){
    res.status(200).send('error : '+err).end();
  }

});

async function getAllIP(){
  let query = datastore.createQuery('ip').limit(10);
  const [ress] =  await  datastore.runQuery(query);
  return ress;
}

async function getIP(){
  let query = datastore.createQuery('ip').limit(10);
  const [ress] =  await  datastore.runQuery(query);
  if(ress.length==0){
    return "empty";
  }else{
    return (ress[ress.length -1]).ip_address;
  }
	//const obj = ress[0];
	//return obj.ip_address;
}

app.get('/getip', async (req, res) => {
  try{
    const ip= await getIP();
    res.status(200).send('ip is : '+ ip).end();
  }catch(err){
    res.status(200).send('err : '+ err).end();
  }
});

app.get('/getgrow', async (req, res) => {
  try{
    const ip= await getIP();
    res.status(200).send('http://' +ip+ '/grow').end();
  }catch(err){
    res.status(200).send('err : '+ err).end();
  }
  
});


app.get('/', async (req, res) => {
  try{
    const ip= await getIP();
    res.status(200).send('<html><script>function go(){window.location.href="http://' +ip + '";} \n'+
    'function go2(){window.location.href="http://' +ip + '/grow";} '+
    '</script><button onclick="go()">Go To ip:'+ip+'</button><button onclick="go2()">Go To grow:'+ip+'/grow</button></html>');
  }catch(err){
    res.status(200).send('err : '+ err).end();
  }
});

app.get('/direct', async (req, res) => {
  try{
    const ip= await getIP();
    res.status(200).send('<html><script>window.location.href="http://' +ip+ '"</script></html>');
  }catch(err){
    res.status(200).send('err : '+ err).end();
  }
});

app.get('/list', async (req, res) => {
  try{
    const ips= await getAllIP();
    res.json(ips).end();
  }catch(err){
    res.status(200).send('err : '+ err).end();
  }
});


// Start the server
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END gae_node_request_example]

module.exports = app;


/*
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



*/