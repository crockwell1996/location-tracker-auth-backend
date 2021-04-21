const express = require("express");
const bodyParser = require("body-parser");
const db = require("./app/models");
const dbConfig = require("./app/config/db.config");
const cors = require("cors");
const { MetadataService } = require("aws-sdk");
require('dotenv').config();
    /*async function determineHost () {
        const meta = new MetadataService();
        await meta.request('/latest/meta-data/public-ipv4', (err, data) => {
            if (err) {
                console.log('No AWS metadata found.');
                console.log(`Falling back on default domain - ${process.env.URL_LOC_ORIGIN}.`);
                return process.env.URL_LOC_ORIGIN;
            }
            else {
                console.log(`Successfully retrieved metadata - public-ipv4: ${data}.`);
                return `http://${data}:8081`;
            }
        });
    }*/
const path = __dirname + '/app/views/';

const app = express();

app.use(express.static(path));

const corsOptions = {
    origin: process.env.URL_HOST_ORIGIN,
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Location Tracker Auth application." });
});

const Role = db.role;

let connectString = '';
if (dbConfig.DBENV === 'local') {
    connectString = `mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`;
} else if (dbConfig.DBENV === 'production') {
    connectString =
        `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.huxko.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
} else {
    console.log(`No valid db env referenced: "${dbConfig.DBENV}."`);
    console.log('Terminating program.');
}

db.mongoose
    .connect(`${connectString}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log(`Successfully connected to ${dbConfig.DBENV} MongoDB.`);
        initial();
    })
    .catch(err => {
        console.error("Connection error", err);
        process.exit();
    });


app.get('/', function (req,res) {
    res.sendFile(path + "index.html");
});

// routes
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

function initial() {
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            new Role({
                name: "user"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'user' to roles collection");
            });

            new Role({
                name: "moderator"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'moderator' to roles collection");
            });

            new Role({
                name: "admin"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'admin' to roles collection");
            });
        }
    });
}
