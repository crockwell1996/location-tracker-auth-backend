const db = require("../models");
const User = db.user;
const Role = db.role;

exports.allAccess = (req, res) => {
    res.status(200).send("Public Content.");
};

exports.userApp = (req, res) => {
    res.status(200).send("User Content.");
};

exports.userAppLocations = (req, res) => {
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            res.status(500).send({message: err});
            return;
        }
        res.status(200).send({
            // username: user.username,
            locations: user.locations,
        });
    });
};

exports.userAppLocation = (req, res) => {
    User.findById(req.userId).exec((err, user) => {
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
            } else {
                res.status(500).send({message: "No location to send."});
            }
        }
        if (req.method === "DELETE") {
            if (req.body.id) {
                // Check if location (by id) exists.
                if(!user.locations.filter((location) => location._id.toString() === req.body.id).length) {
                    res.status(500).send({message: `Location with id: ${req.body.id} does not exist.`});
                    return;
                }
                user.locations = user.locations.filter((location) => {
                    return location._id.toString() !== req.body.id;
                });
                user.save(err => {
                    if (err) {
                        res.status(500).send({message: err});
                        return;
                    }
                    res.send({message: `Location with id: ${req.body.id} was deleted successfully!`});
                });
            } else {
                res.status(500).send({message: "No location id to send for deletion."});
            }
        }
    });
}

exports.userAppUsername = (req, res) => {
    User.findById(req.userId).exec((err, user) => {
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
                    return res.status(400).send({message: `The username "${req.body.newUsername}" is not available.`});
                } else if (!innerUser) {
                    const originalUsername = user.username;
                    user.username = req.body.newUsername;
                    user.save(err => {
                        if (err) {
                            res.status(500).send({message: err});
                            return;
                        }
                        res.send({
                            message:
                                `Username was updated from "${originalUsername}" to "${req.body.newUsername}."
                                \n\nPlease log out and sign back in with your new username.`
                        });
                    });
                }
            });
        }
    });
}

exports.adminApp = (req, res) => {
    res.status(200).send("Admin Content.");
};

exports.adminAppRoles = (req, res) => {
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            res.status(500).send({message: err});
            return;
        }
        if (req.method === "GET") {
            User.find({
                roles: {$exists: true}
            }, {
                _id: 1,
                username: 1,
                roles: 1
            })
                .populate("roles", "-__v")
                .exec((err, users) => {
                    if (err) {
                        return res.status(500).send({message: err});
                    }
                    // Empty object stores assignable roles and users.
                    const responseObj = {};
                    Role.find(
                        {name: {$in: ["admin","user"]}},
                        {"__v": 0}
                    ).exec((err, roles) => {
                        if (err) {
                            return res.status(500).send({message: err});
                        }
                        responseObj.users = users;
                        responseObj.roles = roles;
                        res.send(responseObj);
                    });
                });
        }
        if (req.method === "PUT") {
            const roleData = req.body.users;
            if (roleData) {
                let successResponse = '';
                roleData.forEach((userObj) => {
                    User.findById(userObj.id.trim())
                        .populate("roles", "-__v")
                        .exec((err, user) => {
                            if (err) {
                                return res.status(500).send({message: err});
                            } else if (user) {
                                Role.find(
                                    {name: {$in: ["admin","user"]}}
                                ).exec((roleErr, roleRes) => {
                                    if (roleErr) {
                                        return res.status(500).send({message: err});
                                    }
                                    const newUserRoles = [];
                                    roleRes.forEach((roleDoc) => {
                                        userObj.roles.forEach((roleObj) => {
                                            if (roleObj.selected && (roleDoc.name === roleObj.name)) {
                                                newUserRoles.push(roleDoc._id);
                                            }
                                        });
                                    });
                                    const currentRoles = user.roles.map((roleObj) => roleObj._id);
                                    //Check if assigned roles are different than current roles
                                    if (!(JSON.stringify(currentRoles.sort()) === JSON.stringify(newUserRoles.sort()))) {
                                        user.roles = newUserRoles;
                                        user.save(err => {
                                            if (err) {
                                                return res.status(500).send({message: err});
                                            }
                                            successResponse += `User: ${user.username} roles updated to: ${newUserRoles}\n`;
                                        });
                                    }
                                });
                            } else {
                                successResponse += `No user found by username: ${req.body.username}\n`;
                            }
                        });
                });
                res.send({message: successResponse});
            }
        }
    });
};

exports.moderatorApp = (req, res) => {
    res.status(200).send("Moderator Content.");
};
