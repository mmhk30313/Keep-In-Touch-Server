const all_paths = [
    require('../api/routes/root'),
    require('../api/routes/upload'),
    require('../api/routes/signup-login/signup-login'),
    require('../api/routes/user/user'),
    require('../api/routes/user/user_role'),
    require('../api/routes/vehicle/tow_category'),
    require('../api/routes/vehicle/vehicle')
];

module.exports = all_paths;
