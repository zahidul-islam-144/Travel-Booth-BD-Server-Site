const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0kaol.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('Travel-Booth-BD');
        const travelPackagesCollection = database.collection('travel-packages');
        const bookingCollection = database.collection('all-bookings');
 
        // post package data in server
        app.post('/travel-booth-bd/travel-packages', async (req, res) =>{
        // res.send('hitted the post api...');
        const package = req.body;
        const result = await travelPackagesCollection.insertOne(package);
        res.json(package);
        // console.log("got the data: ", package);
        })

        //  read packages data from server
        app.get('/travel-booth-bd/travel-packages', async (req, res) => {
            const cursor = travelPackagesCollection.find({})
            const package = await cursor.toArray();
            res.send(package);
        })

        // read selected package data (see details btn)
        app.get('/travel-booth-bd/travel-packages/:id', async (req, res) => {
            const id = req.params.id;
            console.log(req);
            const query = {_id: ObjectId(id)}
            const selectedPackage = await travelPackagesCollection.findOne(query);
            res.send(selectedPackage);
        })

        // post in the server of book-now data
        app.post('/travel-booth-bd/book-now/', async (req, res) => {
            res.send('got the booking data...')
            const bookingData = req.body;
            console.log('body: ',bookingData);
            const result = await bookingCollection.insertOne(bookingData);
            // console.log('result: ',result);
            res.json(result);
        }) 

        // see all bookings by logged in email
        app.get('/travel-booth-bd/all-bookings/:email', async (req, res) => {
            const loggedEmail = req.params.email;
            const query = {Booked_Email:loggedEmail}
            const myAllBookings = await bookingCollection.find(query).toArray();
            console.log(myAllBookings);
            res.send(myAllBookings);
        })

        // see all bookings of all logged users
        app.get('/travel-booth-bd/all-bookings', async (req, res) => {
            const cursor = bookingCollection.find({})
            const allBookings = await cursor.toArray();
            res.send(allBookings);
        })
        // getting request data to update selected field
        app.get('/travel-booth-bd/select-bookings/:bookingId', async (req, res) => {
            const selectBooking = req.params.bookingId;
            const query = {_id: ObjectId(selectBooking)};
            const result = await bookingCollection.findOne(query);
            res.send(result);
            // console.log(selectBooking);
            // console.log(query);
        })

        // posting updated data to the server by 
        app.put('/travel-booth-bd/update-bookings/:bookingId', async (req, res) => {
            const updateBookingId = req.params.bookingId;
            console.log('server site: ',updateBookingId);
            const updatedInfo = req.body;
            console.log('server site:',updatedInfo)
            const filter = {_id: ObjectId(updateBookingId)};
            const options = { upsert: true };
            const updateDoc = {
                $set:{
                    confirmData:{
                    Contact_Number: updatedInfo.Contact_Number,
                    Person_Num_Adults: updatedInfo.Person_Num_Adults,
                    Person_Num_Kids: updatedInfo.Person_Num_Kids
                    }
                }
            }
            const result = await bookingCollection.updateOne(filter, updateDoc, options)
            res.send(result)
            // res.send('updating...')
            console.log('updated data...of this id: ', updateBookingId)
        })

        // delete booking 
        app.delete('/travel-booth-bd/delete-booking/:bookingId', async (req, res) => {
            console.log(req)
            const deleteBookingId = req.params.bookingId;
            console.log(deleteBookingId);
            const query = {_id: ObjectId(deleteBookingId)}
            console.log(query);
            const result = await bookingCollection.deleteOne(query);
            res.json(result);
        })
    } 
  

    finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);

  app.get("/", (req, res) => {
    res.send("Running with the travel-booth-bd server ...");
  });

  app.listen(port, () => {
    console.log("App listening from http://localhost:", port);
})