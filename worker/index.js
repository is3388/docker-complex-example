const keys = require('./keys') // file stores hostname and port for connecting to redis
const redis = require('redis')

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000 // reconnect in 1 sec if loose connection
})

// if send regular commands to Redis while in subscriber mode, just open another connection with a new client for subscribing a channel for a standalone connection
const sub = redisClient.duplicate()

function fib(index)
{
    if (index < 2)
    return 1
    return fib(index - 1) + fib(index - 2)
}

// subscription to watch redis for get new index in, calcultate the value and insert into hash value database
// message is index
sub.on('message', (channel, message) =>
{
    redisClient.hset('values', message, fib(parseInt(message)))
})

// subscription subscribe to insert event
sub.subscribe('insert')