import express from 'express';

import { addCourse, deleteCourse, getAllCourses } from '../controllers/courses';

export default (router: express.Router) => {
    router.get('/courses', getAllCourses);
    router.post('/add/courseOffering', addCourse);
    router.delete('/delete/courseOffering/:id', deleteCourse);
}