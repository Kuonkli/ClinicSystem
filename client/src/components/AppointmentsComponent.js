import React, { useState, useEffect } from 'react';
import '../styles/AppointmentsStyles.css';
import CardDoctorIcon from '../assets/images/card-doctor-icon.png';
import OfficeIcon from '../assets/images/office-icon.png';
import CalendarIcon from '../assets/images/calendar-icon.png';
import DefaultDoctorIcon from '../assets/images/default-user-icon.png';
import ViewSeparateIcon from '../assets/images/view-separate-icon.png';
import MedicalBookIcon from '../assets/images/blue-docs-icon.png';
import ChevronIcon from '../assets/images/chevron-icon.png';
import TicketIcon from '../assets/images/ticket-icon.png';
import { useNavigate } from "react-router-dom";
import {getUserAppointments, cancelAppointment, rescheduleAppointment, getTicket} from "../services/api";
import { useAlert } from "../services/AlertContext";

const AppointmentsComponent = () => {
    const [expandedAppointment, setExpandedAppointment] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { showAlert } = useAlert();

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await getUserAppointments();
                setAppointments(response.data.appointments);
            } catch (err) {
                showAlert(
                    err.response?.status,
                    err.response?.data?.error || 'Не удалось загрузить записи'
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    const toggleExpand = (id) => {
        setExpandedAppointment(expandedAppointment === id ? null : id);
    };

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    };

    const formatTimeRange = (startTime, endTime) => {
        return `${startTime} - ${endTime}`;
    };

    const handleCancelAppointment = async (appointmentId) => {
        try {
            await cancelAppointment(appointmentId);
            setAppointments(appointments.map(app =>
                app.ID === appointmentId ? { ...app, status: 'cancelled' } : app
            ));
            showAlert('success', 'Запись успешно отменена');
        } catch (err) {
            showAlert(
                err.response?.status,
                err.response?.data?.error || 'Не удалось отменить запись'
            );
        }
    };

    const handleRescheduleAppointment = (appointmentId) => {

    };

    const handleGenerateTicket = async (appointmentId) => {
        try {
            const response = await getTicket(appointmentId)
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ticket_${appointmentId}.docx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            showAlert(
                err.response?.status,
                err.response?.data?.error || 'Не удалось скачать талон'
            );
        }
    }

    const handleViewMedicalRecord = (recordId) => {
        navigate(`/dashboard/documents/medical-records/${recordId}`);
    };

    if (isLoading) {
        return (
            <div className="appointments-container">
                <div className="loading">Загрузка записей...</div>
            </div>
        );
    }

    return (
        <div className="appointments-container">
            <div className="appointments-header">
                <h2>Мои записи</h2>
                <button
                    className="new-appointment-btn"
                    onClick={() => navigate('/dashboard/appointments/new')}
                >
                    Новая запись
                </button>
            </div>

            {appointments.length === 0 ? (
                <div className="no-appointments">
                    <p>У вас нет активных записей</p>
                </div>
            ) : (
                <div className="appointments-list">
                    {appointments.map(appointment => {
                        const isExpanded = expandedAppointment === appointment.ID;
                        const isCompleted = appointment.status === 'completed';
                        const isCancelled = appointment.status === 'cancelled';

                        return (
                            <div
                                key={appointment.ID}
                                className={`appointment-card ${isExpanded ? 'expanded' : ''} ${isCancelled ? 'cancelled' : ''}`}
                            >
                                <div
                                    className="card-main-content"
                                    onClick={() => !isCancelled && toggleExpand(appointment.ID)}
                                >
                                    <div className="card-header">
                                        <h3>{appointment.service.name}</h3>
                                        <span className={`status-badge ${appointment.status.replace(/\s+/g, '-')}`}>
                                            {(() => {
                                                switch (appointment.status) {
                                                    case 'confirmed': return 'подтверждена';
                                                    case 'completed': return 'завершена';
                                                    case 'cancelled': return 'отменена';
                                                    default: return 'ожидает';
                                                }
                                            })()}
                                        </span>
                                    </div>

                                    <div className="appointment-brief-info">
                                        <div className="time-info">
                                            <div className="appointment-information-group">
                                                <img src={CalendarIcon} alt="calendar" className="appointment-icon"/>
                                                <div>
                                                    <p className="date">{formatDate(appointment.appointment_date)}</p>
                                                    <p className="time">
                                                        {formatTimeRange(appointment.start_time, appointment.end_time)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="appointment-doctor-info">
                                            <div>
                                                <div className="appointment-information-group">
                                                    <img src={CardDoctorIcon} alt="doctor" className="appointment-icon"/>
                                                    <p>{appointment.doctor.User.last_name} {appointment.doctor.User.name} {appointment.doctor.User.patronymic}</p>
                                                    <button
                                                        className="view-doctor-button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/dashboard/doctors/${appointment.doctor.ID}`);
                                                        }}
                                                    >
                                                        <img src={ViewSeparateIcon} alt="view"/>
                                                    </button>
                                                </div>
                                                <div className="appointment-information-group">
                                                    <img src={OfficeIcon} alt="office" className="appointment-icon"/>
                                                    <p>{appointment.doctor.cabinet}</p>
                                                </div>
                                            </div>
                                            <img
                                                src={appointment.doctor.User.photo_url ?
                                                    `http://localhost:8080/api/${appointment.doctor.User.photo_url}` : DefaultDoctorIcon || ''}
                                                alt="Фото врача"
                                                className="doctor-photo"
                                            />
                                        </div>

                                        {!isCancelled && (
                                            <div className="expand-icon">
                                                <img src={ChevronIcon} alt={isExpanded ? 'close' : 'open'}/>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {isExpanded && !isCancelled && (
                                    <div className="appointment-details">
                                        {appointment.notes && (
                                            <div className="detail-section">
                                                <h4>Примечания:</h4>
                                                <p>{appointment.notes}</p>
                                            </div>
                                        )}

                                        {isCompleted && appointment.medical_record && (
                                            <>
                                                <div className="detail-section">
                                                    <h4>Диагноз:</h4>
                                                    <p>{appointment.medical_record.diagnosis}</p>
                                                </div>

                                                <div className="detail-section">
                                                    <h4>Рекомендации:</h4>
                                                    <p>{appointment.medical_record.recommendations}</p>
                                                </div>

                                                {appointment.medical_record.medications && appointment.medical_record.medications.length > 0 && (
                                                    <div className="detail-section">
                                                        <h4>Назначенные препараты:</h4>
                                                        <ul className="medications-list">
                                                            {appointment.medical_record.medications.map((med, idx) => (
                                                                <li key={idx}>
                                                                    <strong>{med.name}</strong> - {med.dosage} ({med.duration})
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                <div className="actions">
                                                    <button
                                                        className="medical-record-btn"
                                                        onClick={() => handleViewMedicalRecord(appointment.medical_record.id)}
                                                    >
                                                        <img src={MedicalBookIcon} alt="medical book" className="action-icon"/>
                                                        Посмотреть в медкнижке
                                                    </button>
                                                </div>
                                            </>
                                        )}

                                        {!isCompleted && (
                                            <div className={"appointment-actions-wrapper"}>
                                                <div className="appointment-actions">
                                                    <button
                                                        className="cancel-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCancelAppointment(appointment.ID);
                                                        }}
                                                    >
                                                        Отменить запись
                                                    </button>
                                                    <button
                                                        className="reschedule-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRescheduleAppointment(appointment.id);
                                                        }}
                                                    >
                                                        Перенести запись
                                                    </button>
                                                </div>
                                                {appointment.status === 'confirmed' ? (
                                                    <button
                                                        className="medical-record-btn"
                                                        onClick={() => handleGenerateTicket(appointment.ID)}
                                                    >
                                                        <img src={TicketIcon} alt="ticket"
                                                             className="action-icon"/>
                                                        Скачать талон
                                                    </button>
                                                    ) : null
                                                }
                                            </div>

                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AppointmentsComponent;