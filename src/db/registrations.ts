import mongoose from 'mongoose';

const RegistrationSchema = new mongoose.Schema({
    registration_id: { type: String, required: true },
    employee_name: { type: String, required: true },
    email: { type: String, required: true },
    course_id: { type: String, required: true },
    status: { type: String, required: true },
});

export const RegistrationModel = mongoose.model('Registration', RegistrationSchema);

export const getRegistrations = () => RegistrationModel.find();
export const getRegistrationsByCourse = (course_id: string) => RegistrationModel.find({ course_id: course_id }).sort({ registration_id: 1 }); // sorted by registration_id
export const getRegistrationById = (registration_id: string) => RegistrationModel.findOne({ registration_id: registration_id });
export const addRegistration = (values: Record<string, any>) => new RegistrationModel(values).save().then((registration) => registration.toObject());
export const deleteRegistration = (id: string) => RegistrationModel.findOneAndDelete({ _id: id });
export const updateRegistration = (registration_id: string, values: Record<string, any>) => RegistrationModel.findByIdAndUpdate(registration_id, values);