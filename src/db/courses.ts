import mongoose from 'mongoose';

const CourseOfferingSchema = new mongoose.Schema({
    course_id: { type: String, required: true },
    course_name: { type: String, required: true },
    instructor_name: { type: String, required: true },
    start_date: { type: String, required: true },
    min_employees: { type: Number, required: true },
    max_employees: { type: Number, required: true },
    current_employees: { type: Number, required: true },
});

export const CourseOfferingModel = mongoose.model('CourseOffering', CourseOfferingSchema);

export const getCourseOfferings = () => CourseOfferingModel.find();
export const getCourseById = (course_id: string) => CourseOfferingModel.findOne({ course_id });
export const addCourseOffering = (values: Record<string, any>) => new CourseOfferingModel(values).save().then((course) => course.toObject());
export const deleteCourseOffering = (id: string) => CourseOfferingModel.findOneAndDelete({ _id: id });
export const updateCourseOffering = (course_id: string, values: Record<string, any>) => CourseOfferingModel.findByIdAndUpdate(course_id, values);