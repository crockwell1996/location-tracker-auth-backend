const db = require("../models");
const User = db.user;

exports.allAccess = (req, res) => {
    res.status(200).send("Public Content.");
};

exports.userApp = (req, res) => {
    res.status(200).send("User Content.");
};

exports.userAppLocations = (req, res) => {
    User.findOne({
        username: req.body.username
    }).exec((err, user) => {
        if (err) {
            res.status(500).send({message: err});
            return;
        }
        res.status(200).send({
            username: user.username,
            locations: user.locations,
        });
    });
};

exports.userAppLocation = (req, res) => {
    User.findOne({
        username: req.body.username
    }).exec((err, user) => {
        if (err) {
            res.status(500).send({message: err});
            return;
        }
        if (req.method === "POST") {
            if (req.body.location) {
                user.locations.push(req.body.location);
                user.save(err => {
                    if (err) {
                        res.status(500).send({message: err});
                        return;
                    }
                    res.send({message: "Location was saved successfully!"});
                });
            }
        }
        if (req.method === "DELETE") {
            if (req.body.location.id) {
                // Check if location (by id) exists.
                if(!user.locations.filter((location) => location._id.toString() === req.body.location.id).length) {
                    res.send({message: `Location with id: ${req.body.location.id} does not exist.`});
                    return;
                }
                user.locations = user.locations.filter((location) => {
                    return location._id.toString() !== req.body.location.id;
                });
                user.save(err => {
                    if (err) {
                        res.status(500).send({message: err});
                        return;
                    }
                    res.send({message: `Location with id: ${req.body.location.id} was deleted successfully!`});
                });
            }
        }

    });
}

exports.userAppUsername = (req, res) => {
    User.findOne({
        username: req.body.username
    }).exec((err, user) => {
        if (err) {
            res.status(500).send({message: err});
            return;
        }
        if (req.body.newUsername) {
            User.findOne({
                username: req.body.newUsername
            }).exec((err, innerUser) => {
                if (err) {
                    res.status(500).send({message: err});
                    return;
                } else if (innerUser) {
                    res.send({message: `The username ${req.body.newUsername} is not available.`});
                } else if (!innerUser) {
                    user.username = req.body.newUsername;
                    user.save(err => {
                        if (err) {
                            res.status(500).send({message: err});
                            return;
                        }
                        res.send({message: `Username was updated from ${req.body.username} to ${req.body.newUsername}.`});
                    });
                }
            });
        }
    });
}

exports.adminApp = (req, res) => {
    res.status(200).send("Admin Content.");
};

exports.moderatorApp = (req, res) => {
    res.status(200).send("Moderator Content.");
};
