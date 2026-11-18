 
import express from 'express'
import { Collection, MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config'
import cors from 'cors'
import { createRemoteJWKSet, jwtVerify } from 'jose';


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
  const bookingCollection = db.collection('bookings');  // collection . 

  //* middleware 
    const verifyToken  = async (req, res, next ) =>{

    const authHeader  = req.headers.authorization ;
    // console.log(authHeader);

    if(!authHeader ){
         return res.status(401).send({msg: 'Unauthorized!'}) ;
    }
    const token =  authHeader.split(" ")[1] ;
    if(!token){
      return res.status(401).send({msg: 'Unauthorized!'})
    }
   

    // verify part : 
    const JWKS = createRemoteJWKSet( new URL('http://localhost:3000/api/auth/jwks')) ;


    
    try {
          const {payload} = await jwtVerify(token, JWKS) ;
          console.log(payload);
          next()
    } catch (error) {
      res.status(500).send({msg: 'Server Error!'})
    }



}

 app.get( ('/'),(req, res)=> {
    res.send({message: 'server is running !'})
 })

app.post(('/add-destination'), verifyToken,  async (req, res)=> {
 
    const data = req.body ;

    const result = await destinationCollection.insertOne(data) ;
    console.log(result);

    res.send( result) ;
})




app.get(('/destination'),async(req, res)=> {
        const result = await destinationCollection.find().toArray()
        res.send(result);
})


app.get('/featured-destination', async (req, res)=> {
    const result = await destinationCollection.find().limit(5).toArray() ;
    res.send(result) ;
})

app.get(('/destination/:id'), verifyToken, async (req, res)=> {

    const id = req.params ;
    const destinationResult = await destinationCollection.findOne({_id: new ObjectId(id)})
     res.send(destinationResult)
})

app.patch('/destination/:id', verifyToken, async (req, res)=> {
   const {id} =  req.params ;
   const updatedData =  req.body; 
  const result = await destinationCollection.updateOne(
    {_id: new ObjectId(id)},
    {$set : updatedData}
  )

   res.send(result)

})

app.delete('/destination/:id', verifyToken,  async (req, res)=> {
    const {id} = req.params ;
    const result = await destinationCollection.deleteOne({_id: new ObjectId(id)}) ;
    res.json(result);
    console.log(result);

})


app.post('/bookingDestination' , verifyToken, async(req, res)=> {
        const data = req.body;
        const result = await bookingCollection.insertOne(data) ;
        res.send(result)
})

// my booking api : 

app.get('/my-booking/:email' , verifyToken,   async (req, res)=> {
     const {email} =  req.params ;
     const result = await bookingCollection.find({userEmail: email}).toArray() ;
     res.send(result)

})

app.delete('/my-booking-cancel/:id', verifyToken,  async (req, res)=> {

    const {id} = req.params ;
    const result = await bookingCollection.deleteOne({_id : id});
   
    res.send(result)
})


 app.listen( PORT, ()=> {
    console.log(`backend server is running ${PORT}`);
 })



