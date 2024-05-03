const redis = require('redis');
const client = redis.createClient({
    host:'localhost',
    port: 6379
})


// Handle connection and error events
// client.on('connect', () => {
//     console.log('Connected to Redis server');
// });

// client.on('error', (error) => {
//     console.error('Redis error:', error);
// });

module.exports = client;