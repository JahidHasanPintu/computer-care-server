const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

//middleware
app.use(cors());
app.use(express.json());


// database connection 


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ham2h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



// Getting all taskd 

async function run(){
    try{
        await client.connect();
        const taskCollection = client.db('todoApp').collection('tasks');
        const partsCollection = client.db('computer_parts').collection('parts');
        const orderCollection = client.db('computer_parts').collection('orders');
        const reviewCollection = client.db('computer_parts').collection('reviews');
        const profileCollection = client.db('computer_parts').collection('profile');
        const userCollection = client.db('computer_parts').collection('user');
        const paymentCollection = client.db('computer_parts').collection('payments');


        app.get('/tasks',async(req,res)=>{
            const query = {};
            const cursor = taskCollection.find(query);
            const tasks = await cursor.toArray();
            res.send(tasks);
        });

        // Getting sigle tasks 
        app.get('/tasks/:id', async(req, res) =>{
            const id = req.params.id;
            const query={_id: ObjectId(id)};
            const tasks = await taskCollection.findOne(query);
            res.send(tasks);
        });

         // POST api or adding a new task
         app.post('/tasks', async(req, res) =>{
            const newtasks = req.body;
            const result = await taskCollection.insertOne(newtasks);
            res.send(result);
        });

         // DELETE or removing a task
         app.delete('/tasks/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await taskCollection.deleteOne(query);
            res.send(result);
        });

        // update complete status
        app.put('/tasks/:id', async(req, res) =>{
            const id = req.params.id;
            const updatedTasks = req.body;
            const filter = {_id: ObjectId(id)};
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    isComplete: updatedTasks.isComplete,
                    
                    
                }
            };
            const result = await taskCollection.updateOne(filter, updatedDoc, options);
            res.send(result);

        })

    }
    finally{

    }
}
run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('Computer Care server is listening')
});

app.listen(port, ()=>{
    console.log('Computer Care server is running on port 5000');
})