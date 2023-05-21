const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');



// middleware 
app.use(express.json());
app.use(cors());


app.get('/', (req, res) => {
    res.send('Welcome')
})




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.crku76a.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        // make data base 
        const toysCollection = client.db('toysDB').collection('toys');

        // post to toysDB
        app.post('/allToys', async (req, res) => {
            const newToy = req.body
            const result = await toysCollection.insertOne(newToy);
            res.send(result);
        })

        // get from toyDB 
        app.get('/allToys', async (req, res) => {
            const result = await toysCollection.find().toArray()
            res.send(result)
        });

        // get data by category 
        app.get('/targetToys/:category', async (req, res) => {
            if (req.params.category == 'avengers' || req.params.category == 'guardians' || req.params.category == 'fantasticFour') {
                const result = await toysCollection.find({ subCategory: req.params.category }).toArray();
                return res.send(result);
            }
            const result = await toysCollection.find().toArray()
            res.send(result)
        })

        // get user specific data 
        app.get('/myToys', async (req, res) => {
            const sortText = req.query.text
            let query = {};
            if (req.query?.email) {
                query = { sellerEmail: req.query.email }
            }
            if(sortText =="Price: High To Low"){
                const result = await toysCollection.find(query).sort({price: -1}).toArray();
                return res.send(result);
            }
            else if(sortText =="Price: Low To High"){
                const result = await toysCollection.find(query).sort({price: 1}).toArray();
                return res.send(result);

            }
            const result = await toysCollection.find(query).toArray()
            res.send(result)
        })


        // get single toy 
        app.get('/allToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.findOne(query);
            res.send(result);
        })

        // delete toy 
        app.delete('/allToys/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.deleteOne(query);
            res.send(result);
        })

        // patch toys 
        app.patch('/allToys/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const body = req.body;
            const updateToy = {
                $set: {
                    ...body
                }
            };
            const result = await toysCollection.updateOne(filter, updateToy);
            res.send(result);
        })




        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);








app.listen(port, (req, res) => {
    console.log(`listening on ${port}`);
})