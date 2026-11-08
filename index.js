 
import express from 'express'
import { Collection, MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config'
import cors from 'cors'


 const app = express() ;
 const PORT = 8000 ;
 app.use(cors())
 app.use(express.json())   // client theke data patchina undefined asteche, ty permition dite hobe. 

 


  
 const client = new MongoClient(process.env.MONGODB_URL);


export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

  const mongoClient = await connectToMongoDB()
  const db = mongoClient.db('wanderlast');  // create database 
  const destinationCollection = db.collection('destination')  // collection .
  


 app.get( ('/'),(req, res)=> {
    res.send({message: 'server is running !'})
 })

app.post(('/add-destination'), async (req, res)=> {
 
    const data = req.body ;

    const result = await destinationCollection.insertOne(data) ;
    console.log(result);

    res.send( result) ;
})




app.get(('/destination'),async(req, res)=> {
        const result = await destinationCollection.find().toArray()
        res.send(result);
})

app.get(('/destination/:id'), async (req, res)=> {
     const id = req.params ;
    const destinationResult = await destinationCollection.findOne({_id: new ObjectId(id)})
     res.send(destinationResult)
})

app.patch('/destination/:id',async (req, res)=> {
   const {id} =  req.params ;
   const updatedData =  req.body; 
  const result = await destinationCollection.updateOne(
    {_id: new ObjectId(id)},
    {$set : updatedData}
  )

   res.send(result)

})

app.delete('/destination/:id', async (req, res)=> {
    const {id} = req.params ;
    const result = await destinationCollection.deleteOne({_id: new ObjectId(id)}) ;
    res.json(result);
    console.log(result);

})



 app.listen( PORT, ()=> {
    console.log(`backend server is running ${PORT}`);
 })



