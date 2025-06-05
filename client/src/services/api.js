import axios from 'axios';

const api = axios.create({
    baseURL: `http://localhost:8080/api`
});

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                await refreshToken();
                return api(originalRequest);
            } catch (err) {
                window.location.href = `/auth`;
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

const refreshToken = () => axios.post(`http://localhost:8080/refresh`, {}, { withCredentials: true });
export const LogOut = () => api.post(`/logout`, {}, { withCredentials: true });

export const getUser = () => api.get(`/user`, {withCredentials: true});


export const getAllDoctors = (searchTerm) => api.get(`/doctors?search=${searchTerm}`, {withCredentials: true});
export const getDoctorById = (id) => api.get(`/doctors/${id}`, {withCredentials: true});
export const getDoctorsForService = (id) => api.get(`/service/${id}/doctors`, {withCredentials: true});
export const getDoctorAvailableDates = (doctorId, serviceId) => api.get(`/doctors/${doctorId}/dates?service_id=${serviceId}`, {withCredentials: true});
export const getDoctorAvailableTimes = (doctorId, serviceId, date) => api.get(
    `/doctors/${doctorId}/slots?service_id=${serviceId}&date=${date}`, {withCredentials: true});

export const getAllServices = (searchTerm, sortPattern) => api.get(`/services?search=${searchTerm}&sort=${sortPattern}`, {withCredentials: true});
export const getServiceById = (id) => api.get(`/services/${id}`, {withCredentials: true})
export const getDoctorServices = (doctorId) => api.get(`/doctor/${doctorId}/services`, {withCredentials: true});

export const addReview = (id, review) => api.post(`/reviews/add/${id}`, review , { withCredentials: true });
export const updateReview = (reviewId, review) => api.put(`/reviews/edit/${reviewId}`, review, { withCredentials: true });
export const deleteReview = (reviewId) => api.delete(`/reviews/delete/${reviewId}`, { withCredentials: true });

export const getDocuments = () => api.get(`/documents`, {withCredentials: true});
export const EditDocuments = (formDataToSend, docType) => api.put(
    `/documents/edit/${docType}`,
    formDataToSend,
    {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
    }
);

export const getNearestAppointment = () => api.get(`/appointments/nearest`, {withCredentials: true});
export const getUserAppointments = () => api.get(`/appointments`, {withCredentials: true});
export const createAppointment = (appointmentData) => api.post(`/appointments/add`,
    appointmentData, { withCredentials: true });
export const cancelAppointment = (id, newDate, newTime) => api.put(`/appointments/${id}/cancel`,
    {date: newDate, time: newTime}, {withCredentials: true});
export const rescheduleAppointment = (id) => api.put(`/appointments/${id}/reschedule`,
    {},  {withCredentials: true});
export const getTicket = (appointmentId) => api.get(`/appointments/${appointmentId}/ticket`, {
    responseType: 'blob',
    withCredentials: true
});