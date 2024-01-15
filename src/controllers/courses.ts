import express from 'express';

import { getCourseOfferings, addCourseOffering, deleteCourseOffering, updateCourseOffering, getCourseById } from '../db/courses';
import { getRegistrations, addRegistration, deleteRegistration, updateRegistration, getRegistrationById, getRegistrationsByCourse } from '../db/registrations';

// ADD NEW COURSE OFFERING
export const addCourse = async(req: express.Request, res: express.Response) => {
    try {
        const { course_name, instructor_name, start_date, min_employees, max_employees } = req.body;

        if(!course_name || !instructor_name || !start_date || !min_employees || !max_employees) {
            return res.status(400).json({
                status: 400,
                message: "Request body missing required parameters.",
                data: {
                    failure: {
                        message: "Request body missing required parameters.",
                    }
                }
            });
        }

        const course_id = "OFFERING-" + course_name + "-" + instructor_name;

        const existingCourse = await getCourseById(course_id);

        if(existingCourse) {
            return res.status(400).json({
                status: 400,
                message: "Course already added to database.",
                data: {
                    failure: {
                        message: "Course already added to database.",
                    }
                }
            });
        }

        const current_employees = 0;

        const course = await addCourseOffering({
            course_id,
            course_name,
            instructor_name,
            start_date,
            min_employees,
            max_employees,
            current_employees,
        });

        return res.status(200).json({
            status: 200,
            message: "course added successfully",
            data: {
                success: {
                    course_id: course_id
                }
            }
        }).end();

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            status: 400,
            message: error,
            data: {
                failure: {
                    message: error,
                }
            }
        });
    }
}

// LIST ALL COURSE OFFERINGS
export const getAllCourses = async (req: express.Request, res: express.Response) => {
    try {
        const courses = await getCourseOfferings();
        return res.status(200).json(courses).end();

    } catch (error){
        console.log(error);
        return res.sendStatus(400);
    }
};

// DELETE COURSE OFFERING
export const deleteCourse = async(req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params;

        const deletedCourse = await deleteCourseOffering(id);
        const deletedCourseId = deletedCourse.course_id;

        // delete corresponding registrations
        const registrations = await getRegistrationsByCourse(deletedCourseId);
        registrations.forEach((registration) => {
            deleteRegistration(registration._id.toString());
        });

        return res.json(deletedCourse);
    } catch(error) {
        console.log(error);
        return res.sendStatus(400);
    }
};

// UPDATE NUMBER OF EMPLOYEES (incomplete)

// export const updateCourseEmployees = async (req: express.Request, res: express.Response) => {
//     try {
//         const { course_id, current_employees } = req.body;

//         if(!course_id || !current_employees) {
//             return res.status(400).json({
//                 status: 400,
//                 message: "Missing parameters.",
//                 data: {
//                     failure: {
//                         message: "Missing parameters."
//                     }
//                 }
//             });
//         }

//         const course = await getCourseById(course_id);

//         if(!course){
//             return res.status(400).json({
//                 status: 400,
//                 message: "Course does not exist in database.",
//                 data: {
//                     failure: {
//                         message: "Course does not exist in database."
//                     }
//                 }
//             });
//         }

//         course.current_employees = username;
//         await user.save();

//         return res.status(200).json(user).end();

//     } catch(error){
//         console.log(error);
//         return res.sendStatus(400);
//     }
// };