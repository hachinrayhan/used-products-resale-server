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

// function verifyJWT(req, res, next) {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//         return res.status(401).send('unauthorized access');
//     }
//     const token = authHeader.split(' ')[1];

//     jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
//         if (err) {
//             return res.status(403).send({ message: 'forbidden access' });
//         }
//         req.decoded = decoded;
//         next();
//     })
// }

async function run() {
    try {
        //Collections
        const usersCollection = client.db('buy&sell').collection('users');

        //admin verification : have to use after verifyJWT
        // const verifyAdmin = async (req, res, next) => {
        //     const decodedEmail = req.decoded.email;
        //     const query = { email: decodedEmail };
        //     const user = await usersCollection.findOne(query);
        //     if (user?.role !== 'admin') {
        //         return res.status(403).send({ message: 'forbidden access' })
        //     }
        //     next();
        // }

        //get appointmentOptions
        // app.get('/appointmentOptions', async (req, res) => {
        //     const date = req.query.date;
        //     const query = {};
        //     const cursor = optionsCollection.find(query);
        //     const options = await cursor.toArray();

        //     //get appointmentOptions on a particular date
        //     const bookingQuery = { appointmentDate: date }
        //     const allBooked = await bookingsCollection.find(bookingQuery).toArray();

        //     options.forEach(option => {
        //         const bookedOption = allBooked.filter(booked => booked.treatment === option.name);

        //         const bookedOptionSlots = bookedOption.map(oneBookedOption => oneBookedOption.slot);
        //         const remainingSlots = option.slots.filter(slot => !bookedOptionSlots.includes(slot));
        //         option.slots = remainingSlots;
        //     })

        //     res.send(options);
        // })

        //get options name only (specialty)
        // app.get('/specialty', async (req, res) => {
        //     const query = {};
        //     const result = await optionsCollection.find(query).project({ name: 1 }).toArray();
        //     res.send(result);
        // })

        //create a doctors api
        // app.post('/doctors', verifyJWT, verifyAdmin, async (req, res) => {
        //     const doctor = req.body;
        //     const result = await doctorsCollection.insertOne(doctor);
        //     res.send(result);
        // })

        //find all the added doctors
        // app.get('/doctors', verifyJWT, verifyAdmin, async (req, res) => {
        //     const query = {};
        //     const doctors = await doctorsCollection.find(query).toArray();
        //     res.send(doctors);
        // })

        //delete a doctor
        // app.delete('/doctors/:id', verifyJWT, verifyAdmin, async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const result = await doctorsCollection.deleteOne(query);
        //     res.send(result);
        // })

        //get bookings by email
        // app.get('/bookings', verifyJWT, async (req, res) => {
        //     const email = req.query.email;
        //     const decodedEmail = req.decoded.email;

        //     if (email !== decodedEmail) {
        //         return res.status(403).send({ message: 'forbidden access' })
        //     }

        //     const query = { email: email };
        //     const bookings = await bookingsCollection.find(query).toArray();
        //     res.send(bookings);
        // })

        //Create Bookings
        // app.post('/bookings', async (req, res) => {
        //     const booking = req.body;
        //     const query = {
        //         email: booking.email,
        //         appointmentDate: booking.appointmentDate,
        //         treatment: booking.treatment
        //     }
        //     const alreadyBooked = await bookingsCollection.find(query).toArray();
        //     if (alreadyBooked.length) {
        //         const message = `You have already an appointment for ${booking.treatment} on ${booking.appointmentDate}`
        //         return res.send({ acknowledged: false, message })
        //     }
        //     const result = await bookingsCollection.insertOne(booking);
        //     res.send(result);
        // })

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
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

        //getUsers
        // app.get('/users', async (req, res) => {
        //     const query = {}
        //     const users = await usersCollection.find(query).toArray();
        //     res.send(users);
        // })

        //updateUsersRole
        // app.put('/users/admin/:id', verifyJWT, verifyAdmin, async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: ObjectId(id) }
        //     const options = { upsert: true };
        //     const updatedDoc = {
        //         $set: {
        //             role: 'admin'
        //         }
        //     };
        //     const result = await usersCollection.updateOne(filter, updatedDoc, options);
        //     res.send(result);
        // })

        //check admin or not
        // app.get('/users/admin/:email', async (req, res) => {
        //     const email = req.params.email;
        //     const query = { email };
        //     const user = await usersCollection.findOne(query);
        //     res.send({ isAdmin: user?.role === 'admin' });
        // })

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