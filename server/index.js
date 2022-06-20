const keys = require('./keys')
// Express app setup
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express() // create express app

app.use(cors()) // cross origin sharing that allows make request from one domain(react app is running onto a different domain/port the Express API hosted on)
app.use(bodyParser.json()) //parse incoming react app and turn the body of the post request into JSON value

// Postgres client setup
const {Pool} = require('pg')
const pgClient = new Pool ({
    user: keys.pgUser,
    host: keys.pgHost,
    port: keys.pgPort,
    database: keys.pgDatabase,
    password: keys.pgPassword
})

// create table houses all indices the user insert after connection is made
pgClient.on('connect', (client) => {
    client
      .query('CREATE TABLE IF NOT EXISTS values (number INT)')
      .catch((err) => console.error(err))
  })

// Redis client setup
const redis = require('redis')
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
})

// create a standalone connection as publisher as redis plays a role of publisher and subscriber
const redisPublisher = redisClient.duplicate()

// Express route handlers
app.get('/', (req, res) =>
{
    res.send('Hi!')
} )

// route to retreive all submitted values in database
app.get('/values/all', async (req, res) =>
{
    const values = await pgClient.query('SELECT * FROM values')
    res.send(values.rows)
})

// route to get all indices along with calculated values stored in redis
app.get('/values/current', async(req, res) => {
    redisClient.hgetall('values', (err, values) =>
    {
        res.send(values)
    })
})

// route to get new submitted value from react app
app.post('/values', async(req, res) => {
    const index = req.body.index
    if (parseInt(index) > 20)
    {
        return res.status(422).send('Index too high')
    }
    // take that index and store in redis and worker wil get the value and calculate
    redisClient.hset('values', index, 'Nothing yet')
    redisPublisher.publish('insert', index) // publish that inserted index to worker and replace string 'Nothing yet'
    pgClient.query('INSERT INTO values (number) VALUES($1)', [index])
    res.send({working: true})
})

app.listen(5000, err => { 
    console.log('Listening')
})




