
//Create an empty object to store ss event Connections
const connectedClients = {};

//Controller function for the sse endpoint
export const sseController = (req, res) => {
    const { userId } = req.params;
    console.log('New client Connected', userId)

    //set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    //Add the client's response object to the connection object
    connectedClients[userId] = res;

    //send an initial event to confirm connection
    res.write('log: Connected to SSE');

    //Handle client disconnection
    req.on('close', () => {
        //Remove the clients response object from the connections array
        delete connectedClients[userId];
        console.log('Client disconnected');
    })
}