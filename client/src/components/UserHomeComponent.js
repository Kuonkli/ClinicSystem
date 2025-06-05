import React, {useEffect, useState} from 'react';
import '../styles/UserHomeStyles.css'
import CardDoctorIcon from '../assets/images/card-doctor-icon.png'
import OfficeIcon from '../assets/images/office-icon.png'
import CalendarIcon from '../assets/images/calendar-icon.png'
import ViewSeparateIcon from '../assets/images/view-separate-icon.png'
import DefaultUserIcon from '../assets/images/default-user-icon.png'
import PhoneIcon from '../assets/images/phone-icon.png'
import HospitalImage from '../assets/images/hospital-image.png'
import {useNavigate} from "react-router-dom";
import {getAllDoctors, getNearestAppointment} from "../services/api";
import {useAlert} from "../services/AlertContext";
import DefaultDoctorIcon from "../assets/images/default-user-icon.png";

const UserHomeComponent = () => {
    const navigate = useNavigate();
    const [nearestAppointment, setNearestAppointment] = useState(null);
    const { showAlert } = useAlert()

    useEffect( () => {
        fetchNearestAppointment()
    }, []);

    const fetchNearestAppointment = async () => {
        try {
            const response = await getNearestAppointment()
            setNearestAppointment(response.data.appointment);
        } catch (err) {
            showAlert(
                err.response?.status,
                err.response?.data?.error
            )
        }
    }

    return (
        <div className="dashboard-grid">
            {/* Карточка следующей записи */}
            <div className="dashboard-card home-grid-item-1 appointment-card">
                {nearestAppointment ? (
                    <>
                        <div className={"card-header"}>
                            <h3>Следующая запись</h3>
                            <button className={"view-separate-button"}
                                    onClick={() => navigate(`/dashboard/appointments`)}>
                                <img src={ViewSeparateIcon || ''} alt={"view"}/>
                            </button>
                        </div>
                        <div className="doctor-profile">
                            <div className={"appointment-information-group"}>
                                <h4 className={"appointment-title"}>{nearestAppointment.service.name}</h4>
                                <span className={`status-badge ${nearestAppointment.status.replace(/\s+/g, '-')}`}>
                                {(() => {
                                    switch ('confirmed') {
                                        case 'confirmed':
                                            return 'подтверждена'
                                        case 'completed':
                                            return 'завершена'
                                        case 'cancelled':
                                            return 'отменена'
                                        default:
                                            return 'ожидает подтверждения'
                                    }
                                })()}
                                </span>
                            </div>

                            <div className="appointment-info">
                                <div className={"appointment-doctor-info"}>
                                    <div>
                                        <div className={"appointment-information-group"}>
                                            <img src={CardDoctorIcon || ''} alt={"doctor"}
                                                 className={"appointment-icon"}/>
                                            <p className="doctor">
                                                {nearestAppointment.doctor.User.last_name} {nearestAppointment.doctor.User.name} {nearestAppointment.doctor.User.patronymic}
                                            </p>
                                        </div>
                                        <div className={"appointment-information-group"}>
                                            <img src={OfficeIcon || ''} alt={"office"} className={"appointment-icon"}/>
                                            <p className="office">{nearestAppointment.doctor.cabinet}</p>
                                        </div>
                                    </div>
                                    <img
                                        src={
                                            nearestAppointment.doctor.User.photo_url ?
                                                `http://localhost:8080/api/${nearestAppointment.doctor.User.photo_url}` :
                                                DefaultDoctorIcon || ''
                                        }
                                         alt="Фото врача"
                                         className="dashboard-appointment-doctor-photo"
                                    />
                                </div>
                                <div className={"appointment-date-time"}>
                                    <img src={CalendarIcon || ''} alt="calendar" className={"appointment-icon"}/>
                                    <div>
                                        <p className="date">{new Date(nearestAppointment.appointment_date).toLocaleString('ru-RU', {day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        <p className="time">{nearestAppointment.start_time} - {nearestAppointment.end_time}</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </>
                ) : (
                    <div>
                        <span></span>
                    </div>
                )}
            </div>

            {/* Карточка рецептов */}
            <div className="dashboard-card home-grid-item-2">
                <div className={"card-header"}>
                    <h3>Рецепты</h3>
                    <button className={"view-separate-button"}>
                        <img src={ViewSeparateIcon || ''} alt={"view"}/>
                    </button>
                </div>
                <div className="prescription-item">
                    <p className="med-name">Аспирин</p>
                    <p className="med-dosage">100 мг - ежедневно утром</p>
                </div>
            </div>

            {/* Карточка поликлиники */}
            <div className="dashboard-card home-grid-item-3 clinic-card">
                <div className={"card-header"}>
                    <h3>Поликлиника №1</h3>
                </div>

                <div className={"chief-doctor-card"}>
                    <div className={"chief-doctor-info"}>
                        <h4>Главный врач:</h4>
                        <div className={"clinic-information-group"}>
                            <img src={CardDoctorIcon || ''} alt={"doctor"} className={"appointment-icon"}/>
                            <p>Петров Сергей Васильевич</p>
                        </div>
                        <div className={"clinic-information-group"}>
                            <img src={PhoneIcon || ''} alt={"doctor"} className={"appointment-icon"}/>
                            <p>Телефон: +7 (123) 456-78-90</p>
                        </div>
                    </div>
                    <img src={DefaultUserIcon || ''} alt="Фото врача" className="dashboard-appointment-doctor-photo"/>
                </div>

                <div className={"clinic-information-group"}>
                    <div className="clinic-info-section">
                        <h4>Расписание:</h4>
                        <p>Пн-Пт: 08:00 - 20:00</p>
                        <p>Сб: 09:00 - 15:00</p>
                        <p>Вс: выходной</p>
                    </div>
                    <div className="clinic-info-section">
                        <h4>Адрес:</h4>
                        <p>г. Москва, ул. Медицинская, д. 15</p>
                        <p>Метро: "Здоровье"</p>
                    </div>
                </div>
                <img src={HospitalImage || ''} alt={"clinic"} className={"hospital-image"}/>
            </div>
        </div>
    )
}

export default UserHomeComponent