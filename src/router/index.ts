import express from 'express';

import authentication from './authentication';
import users from './users';
import courses from './courses';
import registrations from './registrations';

const router = express.Router();

export default (): express.Router => {
    authentication(router);
    users(router);
    courses(router);
    registrations(router);

    return router;
};