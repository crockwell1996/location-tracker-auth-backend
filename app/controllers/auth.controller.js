const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;

let jwt = require("jsonwebtoken");
let bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
        locations: []
    });

    user.save((err, user) => {
        if (err) {
            return res.status(500).send({message: err});
        } else {
            User.estimatedDocumentCount((err, count) => {
                if (err) {
                    res.status(500).send({message: err});
                } else {
                    if (count === 1) {
                        // If first user, make admin
                        Role.find({name: {$in: ['admin','user']}}, (err, roles) => {
                            if (!err) {
                                user.roles = roles.map(roleObj => roleObj._id);
                                user.save(saveErr => {
                                    if (saveErr) {
                                        return res.status(500).send({message: err});
                                    }
                                    res.send({message: "User was registered successfully!"});
                                });
                            } else {
                                return res.status(500).send({message: err});
                            }
                        });
                    } else {
                        // New subsequent users get user role on signup
                        Role.findOne({name: "user"}, (err, role) => {
                            if (err) {
                                return res.status(500).send({message: err});
                            }
                            user.roles = [role._id];
                            user.save(err => {
                                if (err) {
                                    res.status(500).send({message: err});
                                    return;
                                }
                                res.send({message: "User was registered successfully!"});
                            });
                        });
                    }
                }
            });
        }
    });
}

exports.signin = (req, res) => {
    User.findOne({
        username: req.body.username
    })
        .populate("roles", "-__v")
        .exec((err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }

            if (!user) {
                return res.status(404).send({ message: "User Not found." });
            }

            let passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );

            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Invalid Password!"
                });
            }

            let token = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: 86400 // 24 hours
            });

            let authorities = [];
            // Store user roles in array to present in response body
            for (let i = 0; i < user.roles.length; i++) {
                authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
            }

            let locations = [];
            // Store user locations in array to present in response body
            for (let i = 0; i < user.locations.length; i++) {
                locations.push(user.locations[i]);
            }

            res.status(200).send({
                id: user._id,
                username: user.username,
                email: user.email,
                roles: authorities,
                accessToken: token,
                locations: locations,
            });
        });
};
