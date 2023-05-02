import express from 'express'; // Import express module
import { PORT, MongoDB_URL } from './config/App Config/General Config'; // Import PORT from General Config
import os from 'os'; // Import os module
import cluster from 'cluster'; // Import cluster module
const Service = express(); // Create express app

// import all Middlewares
import MongoDB_Connect from './config/DB Config/MongoDB'; // Import MongoDB_Connect middleware

// Import Routes Manager
import Router_Manager from './Router/Router Manager'; // Import Router_Manager

// Create cluster
// get number of cpus
let numCPUs: number = os.cpus().length; // Get number of cpus
if (cluster.isPrimary) {
    while (numCPUs > 0) {
        cluster.fork(); // Create cluster for each cpu
        numCPUs--; // Decrement numCPUs
    }

    cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork(); // Create new cluster if one dies
    }); // Listen for exit event
} else {
    // link all Middleware & Routes to the main app
    Service.use(Router_Manager); // Link Router_Manager to the main app
    Service.use(express.static('public')); // Link public folder to the main app

    // Serving static files made by React
    Service.get('*', (req, res) => {
        console.log(req.url);
        res.sendFile('index.html', { root: 'public' });
    });

    // Start server
    Service.listen(PORT, async () => {
        await MongoDB_Connect({ MongoDB_URL }); // Connect to MongoDB database when server starts
        console.log(`API Server is running on port ${PORT}`);
    });
}