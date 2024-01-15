import express from 'express';

import { getRegistrations, addRegistration, deleteRegistration, updateRegistration, getRegistrationById, getRegistrationsByCourse } from '../db/registrations';
import { getCourseById } from '../db/courses';

// ADD NEW REGISTRATION
export const register = async(req: express.Request, res: express.Response) => {
    try {
        const { employee_name, email, course_id } = req.body;
        req.params.course_id = course_id;

        if(!employee_name || !email || !course_id) {
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

        const course = await getCourseById(course_id);

        if(!course) {
            return res.status(403).json({
                status: 403,
                message: "Course not in database.",
                data: {
                    failure: {
                        message: "Course not in database.",
                    }
                }
            });
        }

        const registration_id = employee_name + "-" + course_id;

        const existingRegistration = await getRegistrationById(registration_id);

        if(existingRegistration) {
            return res.status(400).json({
                status: 400,
                message: "Registration already added to database.",
                data: {
                    failure: {
                        message: "Registration already added to database.",
                    }
                }
            });
        }

        if (course.current_employees + 1 > course.max_employees){
            return res.status(403).json({
                status: 403,
                message: "Maximum employees reached.",
                data: {
                    failure: {
                        message: "Maximum employees reached.",
                    }
                }
            });
        }

        // min_employees condition must be implemented here

        const status = "PENDING";

        const registration = await addRegistration({
            registration_id,
            employee_name,
            email,
            course_id,
            status
        });

        course.current_employees += 1;
        await course.save();

        return res.status(200).json({
            status: 200,
            message: "successfully registered for " + course_id,
            data: {
                success: {
                    registration_id: registration_id,
                    status: "ACCEPTED"
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

// LIST ALL REGISTRATIONS
export const getAllRegistrations = async (req: express.Request, res: express.Response) => {
    try {
        const registrations = await getRegistrations();
        return res.status(200).json(registrations).end();

    } catch (error){
        console.log(error);
        return res.sendStatus(400);
    }
};

// CANCEL REGISTRATION
export const cancelRegistration = async(req: express.Request, res: express.Response) => {
    try {
        const { registration_id } = req.params;

        if(!registration_id){
            return res.status(400).json({
                status: 400,
                message: "Missing parameters.",
                data: {
                    failure: {
                        message: "Missing parameters."
                    }
                }
            });
        }

        const registration = await getRegistrationById(registration_id);

        if(!registration) {
            return res.status(400).json({
                status: 400,
                message: "Registration does not exist in database.",
                data: {
                    failure: {
                        message: "Registration does not exist in database."
                    }
                }
            });
        }

        if (registration.status === "ACCEPTED"){
            return res.status(400).json({
                status: 400,
                message: "Course already alloted to given registration. Cancellation not possible.",
                data: {
                    failure: {
                        registration_id: registration.registration_id,
                        course_id: registration.course_id,
                        status: "CANCEL_REJECTED"
                    }
                }
            });
        } else {
            const id = registration._id.toString();
            const deletedRegistration = await deleteRegistration(id);
            
            const course_id = registration.course_id;
            const course = await getCourseById(course_id);

            if(course.current_employees - 1 < 0){
                course.current_employees = 0;
            } else {
                course.current_employees -= 1;
            }

            await course.save();

            return res.status(200).json({
                status: 200,
                message: "Successfully cancelled registration for " + course.course_name,
                data: {
                    success: {
                        registration_id: registration.registration_id,
                        course_id: registration.course_id,
                        status: "CANCEL_ACCEPTED"
                    }
                }
            });
        }
        
    } catch(error) {
        console.log(error);
        return res.sendStatus(400);
    }
};

// ALLOT COURSES
export const viewAllotment= async(req: express.Request, res: express.Response) => {
    try {
        const { course_id } = req.params;

        if(!course_id) {
            return res.status(400).json({
                status: 400,
                message: "Missing parameters.",
                data: {
                    failure: {
                        message: "Missing parameters."
                    }
                }
            });
        }

        const registrations = await getRegistrationsByCourse(course_id);

        if(!registrations) {
            return res.status(400).json({
                status: 400,
                message: "No registrations for given course_id.",
                data: {
                    failure: {
                        message: "No registrations for given course_id."
                    }
                }
            });
        } else {
            registrations.forEach( async (registration) => {
                if(registration.status != "ACCEPTED"){
                    const reg = await getRegistrationById(registration.registration_id);
                    reg.status = "ACCEPTED"; 
                    await reg.save();
                }
            });

            const registrationsUpdated = await getRegistrationsByCourse(course_id);

            return res.status(200).json({
                status: 200,
                message: "successfully alloted course to registered employees.",
                data: {
                    success: registrationsUpdated,
                }
            });
        }

    } catch (error) {
        return res.status(400).json({
            status: 400,
            message: error,
            data: {
                failure: {
                    message: error
                }
            }
        });
    }
};

// FORCE DELETE REGISTRATION
export const removeRegistration = async(req: express.Request, res: express.Response) => {
    try {
        const { registration_id } = req.params;

        if(!registration_id){
            return res.status(400).json({
                status: 400,
                message: "Missing parameters.",
                data: {
                    failure: {
                        message: "Missing parameters."
                    }
                }
            });
        }

        const registration = await getRegistrationById(registration_id);

        if(!registration) {
            return res.status(400).json({
                status: 400,
                message: "Registration does not exist in database.",
                data: {
                    failure: {
                        message: "Registration does not exist in database."
                    }
                }
            });
        }

        const id = registration._id.toString();
        const deletedRegistration = await deleteRegistration(id);
        
        const course_id = registration.course_id;
        const course = await getCourseById(course_id);

        if(course){
            if(course.current_employees - 1 < 0){
                course.current_employees = 0;
            } else {
                course.current_employees -= 1;
            }

            await course.save();
        }

        return res.status(200).json({
            status: 200,
            message: "Successfully deleted registration with id: " + registration.registration_id, 
            data: {
                success: {
                    registration_id: registration.registration_id,
                    course_id: registration.course_id,
                    status: "DELETED"
                }
            }
        }); 
    } catch(error) {
        console.log(error);
        return res.sendStatus(400);
    }
};