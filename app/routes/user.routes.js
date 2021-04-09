const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/api/test/all", controller.allAccess);

    app.get("/api/test/user", [authJwt.verifyToken], controller.userApp);

    app.get("/api/test/user/locations", [authJwt.verifyToken], controller.userAppLocations);

    app.post("/api/test/user/location", [authJwt.verifyToken], controller.userAppLocation);

    app.delete("/api/test/user/location", [authJwt.verifyToken], controller.userAppLocation);

    app.put("/api/test/user/username", [authJwt.verifyToken], controller.userAppUsername);

    app.get(
        "/api/test/mod",
        [authJwt.verifyToken, authJwt.isModerator],
        controller.moderatorApp
    );

    app.get(
        "/api/test/admin",
        [authJwt.verifyToken, authJwt.isAdmin],
        controller.adminApp
    );

    app.get(
        "/api/test/admin/manageroles",
        [authJwt.verifyToken, authJwt.isAdmin],
        controller.adminAppRoles
    );

    app.put(
        "/api/test/admin/manageroles",
        [authJwt.verifyToken, authJwt.isAdmin],
        controller.adminAppRoles
    );
};
