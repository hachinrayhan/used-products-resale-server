const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.j7l4khx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//verify jwt
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        //Collections
        const usersCollection = client.db('buy&sell').collection('users');
        const productsCollection = client.db('buy&sell').collection('products');
        const bookingsCollection = client.db('buy&sell').collection('bookings');


        //add a product api
        app.post('/products', async (req, res) => {     //verifyJWT, verifyAdmin,
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result);
        })

        //get all products by category name
        app.get('/category/:name', async (req, res) => {
            const name = req.params.name;
            const query = { category: name };
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        })

        //get sellerProducts by sellerEmail
        app.get('/products', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' })
            }

            const query = { sellerEmail: email };
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        })

        //Create Bookings
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        })

        //get bookings by email
        app.get('/bookings', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' })
            }

            const query = { buyerEmail: email };
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        })

        //Generate a jwt token
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '7d' });
                return res.send({ accessToken: token })
            }
            res.status(403).send({ accessToken: '' })
        })

        //Create user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const savedUser = await usersCollection.find(query).toArray();
            if (savedUser.length) {
                if (savedUser.length === 1) {
                    if (savedUser[0].user_type !== user.user_type) {
                        const result = await usersCollection.insertOne(user);
                        res.send(result);
                    }
                    return;
                }
                return;
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

        //getSellers
        app.get('/users/sellers', verifyJWT, async (req, res) => {
            const query = { user_type: 'Seller' }
            const sellers = await usersCollection.find(query).toArray();
            res.send(sellers);
        })

        //getBuyers
        app.get('/users/buyers', verifyJWT, async (req, res) => {
            const query = { user_type: 'Buyer' }
            const buyers = await usersCollection.find(query).toArray();
            res.send(buyers);
        })

        //update product status
        app.put('/products/status/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    status: 'booked'
                }
            };
            const result = await productsCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        //check userType
        app.get('/users/type/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            const user_type = user.user_type;
            res.send({ user_type });
        })

    }
    finally {

    }
}
run().catch(err => console.log(err))

app.get('/', async (req, res) => {
    res.send('BuyAndSell server is running');
})

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})