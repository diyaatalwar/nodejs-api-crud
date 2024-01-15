import express from 'express';

import { getAllRegistrations, register, cancelRegistration, viewAllotment, removeRegistration } from '../controllers/registrations';

export default (router: express.Router) => {
    router.get('/registrations', getAllRegistrations);
    router.post('/add/register/:course_id', register);
    router.delete('/cancel/:registration_id', cancelRegistration);
    router.post('/allot/:course_id', viewAllotment);
    router.delete('/delete/registration/:registration_id', removeRegistration);
}