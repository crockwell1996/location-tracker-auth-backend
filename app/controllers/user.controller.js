exports.allAccess = (req, res) => {
    res.status(200).send("Public Content.");
};

exports.userApp = (req, res) => {
    res.status(200).send("User Content.");
};

exports.adminApp = (req, res) => {
    res.status(200).send("Admin Content.");
};

exports.moderatorApp = (req, res) => {
    res.status(200).send("Moderator Content.");
};
