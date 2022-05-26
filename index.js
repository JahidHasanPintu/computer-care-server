const express = require('express')
const app = express()
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const port = process.env.PORT || 5000
require('dotenv').config()
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

//middleware
app.use(express.json())
app.use(cors())

function verifyJwt(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded //je data ta token er moddhe ase sheta amra  decoded er moddhe pabo
        next()
    });
}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nkdwi.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const partsCollection = client.db('bicycles_manufacturer').collection('parts');
        const orderCollection = client.db('bicycles_manufacturer').collection('orders');
        const reviewCollection = client.db('bicycles_manufacturer').collection('reviews');
        const profileCollection = client.db('bicycles_manufacturer').collection('profile');
        const userCollection = client.db('bicycles_manufacturer').collection('user');
        const paymentCollection = client.db('bicycles_manufacturer').collection('payments');

        app.get('/part', async (req, res) => {
            const query = {}
            const cursor = partsCollection.find(query)
            const parts = await cursor.toArray()
            res.send(parts)
        })

        //single id data load
        app.get('/part/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const part = await partsCollection.findOne(query)
            res.send(part)
        })

        // My order API 
        app.get('/myorder', verifyJwt, async (req, res) => {
            const email = req.query.customerEmail
            const decodedEmail = req.decoded.email
            if (email === decodedEmail) {
                const query = { customerEmail: email }
                const cursor = orderCollection.find(query)
                const parts = await cursor.toArray()
                res.send(parts)
            }
            else {
                return res.status(403).send({ message: 'forbidden access' })
            }
        })

        app.get('/myorder/:id', verifyJwt, async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const order = await orderCollection.findOne(query)
            res.send(order)
        })


        //order place api:
        app.post('/part', async (req, res) => {
            const order = req.body
            const result = await orderCollection.insertOne(order)
            res.send(result)
        })

         //update api:
         app.put('/part/:id', async (req, res) => {
            const id = req.params.id
            const updatePart = req.body
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updatedoc = {
                $set: {
                    AvailableQuantity: updatePart.AvailableQuantity
                }
            }
            const result = await partsCollection.updateOne(filter, updatedoc, options)
            res.send(result)
        })
        //review post  backend api:
        app.post('/addreview', async (req, res) => {
            const newReview = req.body
            const result = await reviewCollection.insertOne(newReview)
            res.send(result)
        })