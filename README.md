const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://user_name:password@cluster0.h3rvg.mongodb.net/db_name?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});