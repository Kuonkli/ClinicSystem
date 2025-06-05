import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    createAppointment,
    getAllDoctors, getAllServices, getDoctorAvailableDates,
    getDoctorAvailableTimes, getDoctorById,
    getDoctorServices, getDoctorsForService, getServiceById
} from '../services/api';
import { useAlert } from '../services/AlertContext';
import '../styles/NewAppointmentStyles.css';
import CalendarIcon from '../assets/images/calendar-icon.png';
import ClockIcon from '../assets/images/clock-icon.png';
import DoctorIcon from '../assets/images/card-doctor-icon.png';
import ServiceIcon from '../assets/images/services-icon-blue.png';
import BackIcon from '../assets/images/back-icon.png';
import DefaultDoctorIcon from "../assets/images/default-user-icon.png";
import UserProfileComponent from "../components/UserProfileComponent";

const NewAppointmentComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {showAlert} = useAlert();

    const getInitialSteps = (hasServiceId, hasDoctorId) => {
        if (hasDoctorId) {
            return [
                {step: 1, label: 'Выбор врача'},
                {step: 2, label: 'Выбор услуги'},
                {step: 3, label: 'Выбор даты и времени'},
                {step: 4, label: 'Подтверждение'}
            ];
        }
        return [
            {step: 1, label: 'Выбор услуги'},
            {step: 2, label: 'Выбор врача'},
            {step: 3, label: 'Выбор даты и времени'},
            {step: 4, label: 'Подтверждение'}
        ];
    };

    const params = new URLSearchParams(location.search);
    const serviceId = params.get('serviceId');
    const doctorId = params.get('doctorId');

    const [stepList, setStepList] = useState(getInitialSteps(!!serviceId, !!doctorId));
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedService, setSelectedService] = useState(null);

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [reason, setReason] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [services, setServices] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [availableDates, setAvailableDates] = useState([]);

    useEffect(() => {
        let initialStep = 1;

        if (serviceId && !doctorId) {
            initialStep = 2
            fetchServiceData(serviceId).then(service => {
                setSelectedService(service);
                fetchAllServices()
                fetchDoctorsForService(serviceId);
            });
        } else if (doctorId && !serviceId) {
            initialStep = 2
            fetchDoctorData(doctorId).then(doctor => {
                setSelectedDoctor(doctor);
                fetchAllDoctors()
                fetchDoctorServices(doctorId);
            });
        } else if (doctorId && serviceId) {
            initialStep = 3; // У нас всего 2 шага в этом случае
            Promise.all([
                fetchDoctorData(doctorId),
                fetchServiceData(serviceId)
            ]).then(([doctor, service]) => {
                setSelectedDoctor(doctor);
                setSelectedService(service);
                fetchAvailableDates(doctor.id, service.ID);
            });
        } else {
            fetchAllServices();
        }

        setCurrentStep(initialStep);
    }, [location.pathname]);

    const fetchAllServices = async () => {
        try {
            const response = await getAllServices('', '')
            setServices(response.data.services);
        } catch (error) {
            showAlert(
                error.response?.status,
                error.response?.data?.error
            );
        }
    };

    const fetchDoctorData = async (id) => {
        try {
            const response = await getDoctorById(id)
            return response.data.doctor
        } catch (error) {
            showAlert(
                error.response?.status,
                error.response?.data?.error
            );
            return null;
        }
    };

    const fetchServiceData = async (id) => {
        try {
            const response = await getServiceById(id);
            return response.data.service;
        } catch (error) {
            showAlert(
                error.response?.status,
                error.response?.data?.error
            );
            return null;
        }
    };

    const fetchDoctorServices = async (doctorId) => {
        try {
            const response = await getDoctorServices(doctorId)
            setServices(response.data.services);
        } catch (error) {
            showAlert(
                error.response?.status,
                error.response?.data?.error
            );
        }
    };

    const fetchDoctorsForService = async (serviceId) => {
        try {
            const response = await getDoctorsForService(serviceId);
            setDoctors(response.data.doctors);
        } catch (error) {
            showAlert(
                error.response?.status,
                error.response?.data?.error
            );
        }
    };

    const fetchAllDoctors = async () => {
        try {
            const response = await getAllDoctors("")
            setDoctors(response.data.doctors);
        } catch (error) {
            showAlert(
                error.response?.status,
                error.response?.data?.error
            );
        }
    };

    const handleSelectService = (service) => {
        setSelectedService(service);
        params.set('serviceId', service.ID);
        const currentStepIndex = stepList.findIndex(s => s.step === currentStep);
        const nextStep = stepList[currentStepIndex + 1]?.step || currentStep;

        setCurrentStep(nextStep);

        if (stepList.find(s => s.step === nextStep)?.label === 'Выбор врача') {
            fetchDoctorsForService(service.ID).then(() => {
                const queryString = params.toString();
                navigate(`/dashboard/appointments/new${queryString ? `?${queryString}` : ""}`)
            });
        } else if (stepList.find(s => s.step === nextStep)?.label === 'Выбор услуги') {
            fetchDoctorServices(selectedDoctor.id).then(() => {
                const queryString = params.toString();
                navigate(`/dashboard/appointments/new${queryString ? `?${queryString}` : ""}`)
            })
        } else {
            fetchAvailableDates(selectedDoctor.id, service.ID).then(() => {
                const queryString = params.toString();
                navigate(`/dashboard/appointments/new${queryString ? `?${queryString}` : ""}`)
            });
        }
    };

    const handleSelectDoctor = (doctor) => {
        setSelectedDoctor(doctor);
        params.set('doctorId', doctor.id);
        const currentStepIndex = stepList.findIndex(s => s.step === currentStep);
        const nextStep = stepList[currentStepIndex + 1]?.step || currentStep;

        setCurrentStep(nextStep);
        if (stepList.find(s => s.step === nextStep)?.label === 'Выбор даты и времени') {
            fetchAvailableDates(doctor.id, selectedService.ID).then(() => {
                const queryString = params.toString();
                navigate(`/dashboard/appointments/new${queryString ? `?${queryString}` : ""}`)
            });
        } else if (stepList.find(s => s.step === nextStep)?.label === 'Выбор услуги') {
            fetchDoctorServices(doctor.id).then(() => {
                const queryString = params.toString();
                navigate(`/dashboard/appointments/new${queryString ? `?${queryString}` : ""}`)
            })
        }
    };

    const goToPreviousStep = () => {
        const currentStepIndex = stepList.findIndex(s => s.step === currentStep);
        if (currentStepIndex > 0) {
            setCurrentStep(stepList[currentStepIndex - 1].step);
        }
    };

    const handleSelectDate = (date) => {
        const serverDate = new Date(date);
        serverDate.setHours(12, 0, 0, 0);
        setSelectedDate(serverDate);
        fetchAvailableTimes(selectedDoctor.id, selectedService.ID, serverDate);
    };

    const fetchAvailableDates = async (doctorId, serviceId) => {
        setIsLoading(true);
        try {
            const response = await getDoctorAvailableDates(doctorId, serviceId);
            console.log(response)
            const dates = response.data.available_dates.map(date => new Date(date));
            setAvailableDates(dates);

            // Установка ближайшей доступной даты по умолчанию
            if (dates.length > 0) {
                const today = new Date();
                const futureDates = dates.filter(date => date >= today);
                setSelectedDate(futureDates.length > 0 ? futureDates[0] : dates[dates.length - 1]);
            }
        } catch (error) {
            showAlert(
                error.response?.status,
                error.response?.data?.error
            );
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAvailableTimes = async (doctorId, serviceId, date) => {
        if (!date) return;

        setIsLoading(true);
        try {
            const formattedDate = date.toISOString().split('T')[0];
            const response = await getDoctorAvailableTimes(doctorId, serviceId, formattedDate)
            setAvailableSlots(response.data.available_slots);

            // Сброс выбранного времени при изменении даты
            setSelectedTime(null);
        } catch (error) {
            showAlert('error', 'Не удалось загрузить доступное время');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateAppointment = async () => {
        if (!selectedDoctor || !selectedService || !selectedDate || !selectedTime) {
            showAlert(400, 'Пожалуйста, заполните все поля');
            return;
        }

        setIsLoading(true);
        try {
            const appointmentData = {
                doctor_id: selectedDoctor.id,
                service_id: selectedService.ID,
                date: selectedDate.toISOString().split('T')[0],
                time: selectedTime,
                reason: reason
            };

            const response = await createAppointment(appointmentData);
            console.log(response)
            showAlert(200, 'Запись успешно создана!');
            navigate('/dashboard/appointments');
        } catch (error) {
            showAlert(error.response?.status, error.response?.data?.error || 'Не удалось создать запись');
        } finally {
            setIsLoading(false);
        }
    };

    const Calendar = ({ availableDates, selectedDate, onSelectDate }) => {
        const today = new Date();
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        const daysInMonth = endOfMonth.getDate();

        const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

        // Получение первого дня месяца
        const firstDayOfMonth = startOfMonth.getDay();
        const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        // Переход к предыдущему/следующему месяцу (без изменений)
        const prevMonth = () => {
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
        };

        const nextMonth = () => {
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
        };

        // Нормализация даты для сравнения (убираем время)
        const normalizeDate = (date) => {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            return d;
        };

        // Проверка доступности даты
        const isDateAvailable = (date) => {
            const normalizedDate = normalizeDate(date);
            return availableDates.some(availableDate => {
                return normalizeDate(availableDate).getTime() === normalizedDate.getTime();
            });
        };

        // Проверка, является ли дата сегодняшним днем
        const isToday = (date) => {
            return normalizeDate(date).getTime() === normalizeDate(today).getTime();
        };

        // Проверка, выбрана ли дата
        const isSelected = (date) => {
            return selectedDate && normalizeDate(date).getTime() === normalizeDate(selectedDate).getTime();
        };

        // Обработчик выбора даты
        const handleDateSelect = (date) => {
            // Корректируем дату перед отправкой
            const correctedDate = new Date(date);
            correctedDate.setHours(12, 0, 0, 0); // Устанавливаем полдень

            // Форматируем дату для сервера (YYYY-MM-DD)
            const formattedDate = correctedDate.toISOString().split('T')[0];

            // Вызываем callback с оригинальной датой (для отображения)
            onSelectDate(date, formattedDate);
        };

        // Генерация дней месяца
        const renderDays = () => {
            const days = [];

            // Пустые ячейки
            for (let i = 0; i < adjustedFirstDay; i++) {
                days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
            }

            // Дни месяца
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                const available = isDateAvailable(date);
                const todayClass = isToday(date) ? 'today' : '';
                const selectedClass = isSelected(date) ? 'selected' : '';
                const disabledClass = !available ? 'disabled' : '';

                days.push(
                    <div
                        key={`day-${day}`}
                        className={`calendar-day ${todayClass} ${selectedClass} ${disabledClass}`}
                        onClick={() => available && handleDateSelect(date)}
                    >
                        {day}
                        {isToday(date) && <span className="today-indicator">Сегодня</span>}
                    </div>
                );
            }

            return days;
        };

        return (
            <div className="custom-calendar">
                <div className="calendar-header">
                    <button onClick={prevMonth} className="calendar-nav-button">&lt;</button>
                    <h3>
                        {currentMonth.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={nextMonth} className="calendar-nav-button">&gt;</button>
                </div>

                <div className="calendar-weekdays">
                    {weekdays.map(day => (
                        <div key={day} className="weekday">{day}</div>
                    ))}
                </div>

                <div className="calendar-days-grid">
                    {renderDays()}
                </div>
            </div>
        );
    };

    const renderDoctorList = () => {
        return (
            <div className="doctors-list">
                {doctors.map(doctor => (
                    <div
                        key={doctor.id}
                        className={`doctor-card ${selectedDoctor?.id === doctor.id ? 'selected' : ''}`}
                        onClick={() => handleSelectDoctor(doctor)}
                    >
                        <div className="doctor-info">
                            <img
                                src={doctor.photo_url ? `http://localhost:8080/api/${doctor.photo_url}` : DefaultDoctorIcon || ''}
                                alt={doctor?.name}
                                className="doctor-image"
                            />
                            <div className="doctor-details">
                                <h4>{doctor?.last_name} {doctor?.name} {doctor?.patronymic}</h4>
                                <p className="specialty">{doctor?.specialty}</p>
                                <p className="experience">Опыт: {doctor?.experience} лет</p>
                                <p className="cabinet">Кабинет: {doctor?.cabinet}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderServicesList = () => {
        return (
            <div className="services-list">
                {services.map(service => (
                    <div
                        key={service.ID}
                        className={`service-card ${selectedService?.ID === service.ID ? 'selected' : ''}`}
                        onClick={() => handleSelectService(service)}
                    >
                        <img src={ServiceIcon} alt="Услуга" className="service-icon"/>
                        <div className="service-details">
                            <h4>{service?.name}</h4>
                            <p className="description">{service?.description}</p>
                            <div className="service-meta">
                            <span className="duration">
                                <img src={ClockIcon} alt="Длительность"/>
                                {service?.duration} мин
                            </span>
                                <span className={`price ${service.is_paid ? 'paid' : 'free'}`}>
                                {service?.is_paid ? `${service?.price} руб.` : 'Бесплатно'}
                            </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderSelectedServicePreview = () => {
        if (!selectedService) return null;

        return (
            <div className="selected-service-preview">
                <h4>Выбранная услуга:</h4>
                <div className="service-card selected">
                    <img src={ServiceIcon} alt="Услуга" className="service-icon"/>
                    <div className="service-details">
                        <h4>{selectedService.name}</h4>
                        <p className="description">{selectedService.description}</p>
                        <div className="service-meta">
                        <span className="duration">
                            <img src={ClockIcon} alt="Длительность"/>
                            {selectedService.duration} мин
                        </span>
                            <span className={`price ${selectedService.is_paid ? 'paid' : 'free'}`}>
                            {selectedService.is_paid ? `${selectedService.price} руб.` : 'Бесплатно'}
                        </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderSelectedDoctorPreview = () => {
        if (!selectedDoctor) return null;

        return (
            <div className="selected-doctor-preview">
                <h4>Выбранный врач:</h4>
                <div className="doctor-card selected">
                    <img
                        src={selectedDoctor.photo_url ? `http://localhost:8080/api/${selectedDoctor.photo_url}` : DefaultDoctorIcon || ''}
                        alt={selectedDoctor.name}
                        className="doctor-image"
                    />
                    <div className="doctor-details">
                        <h4>{selectedDoctor.last_name} {selectedDoctor.name} {selectedDoctor.patronymic}</h4>
                        <p className="specialty">{selectedDoctor.specialty}</p>
                        <p className="experience">Опыт: {selectedDoctor.experience} лет</p>
                        <p className="cabinet">Кабинет: {selectedDoctor.cabinet}</p>
                    </div>
                </div>
            </div>
        );
    };

    const renderStepContent = () => {
        const currentStepLabel = stepList.find(s => s.step === currentStep)?.label;

        switch(currentStepLabel) {
            case 'Выбор услуги':
                return (
                    <div className="step-content">
                        {renderSelectedDoctorPreview()}
                        <h3>Выберите услугу</h3>
                        {renderServicesList()}
                        <div className="navigation-buttons">
                            <button className="prev-button" onClick={goToPreviousStep}>
                                Назад
                            </button>
                            <button
                                className="next-button"
                                onClick={() => handleSelectService(selectedService)}
                                disabled={!selectedService}
                            >
                                Продолжить
                            </button>
                        </div>
                    </div>
                );
            case 'Выбор врача':
                return (
                    <div className="step-content">
                        {renderSelectedServicePreview()}
                        <h3>Выберите врача</h3>
                        {renderDoctorList()}
                        <div className="navigation-buttons">
                            <button className="prev-button" onClick={goToPreviousStep}>
                                Назад
                            </button>
                            <button
                                className="next-button"
                                onClick={() => handleSelectDoctor(selectedDoctor)}
                                disabled={!selectedDoctor}
                            >
                                Продолжить
                            </button>
                        </div>
                    </div>
                );
            case 'Выбор даты и времени':
                return (
                    <div className="step-content">
                        {renderSelectedServicePreview()}
                        {renderSelectedDoctorPreview()}
                        <h3>Выберите дату и время</h3>
                        <div className="date-time-selection">
                            <div className="calendar-section">
                                <h4>Доступные даты</h4>
                                {isLoading ? (
                                    <div className="loading">Загрузка доступных дат...</div>
                                ) : (
                                    <Calendar
                                        availableDates={availableDates}
                                        selectedDate={selectedDate}
                                        onSelectDate={handleSelectDate}
                                    />
                                )}
                            </div>

                            <div className="time-slots-section">
                                <h4>Доступное время</h4>
                                {isLoading ? (
                                    <div className="loading">Загрузка доступного времени...</div>
                                ) : selectedDate ? (
                                    <div className="time-slots-grid">
                                        {availableSlots.length > 0 ? (
                                            availableSlots.map(slot => (
                                                <button
                                                    key={slot}
                                                    className={`time-slot ${selectedTime === slot ? 'selected' : ''}`}
                                                    onClick={() => setSelectedTime(slot)}
                                                >
                                                    {slot}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="no-slots">
                                                На выбранную дату нет доступных временных слотов
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="select-date-prompt">
                                        Пожалуйста, выберите дату для просмотра доступного времени
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="reason-section">
                            <h4>Причина посещения (необязательно)</h4>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Опишите причину вашего визита..."
                                rows={3}
                            />
                        </div>
                        <div className="navigation-buttons">
                            <button className="prev-button" onClick={goToPreviousStep}>
                                Назад
                            </button>
                            <button
                                className="next-button"
                                onClick={() => setCurrentStep(currentStep + 1)}
                                disabled={!selectedTime}
                            >
                                Продолжить
                            </button>
                        </div>
                    </div>
                );
            case 'Подтверждение':
                return (
                    <div className="step-content confirmation">
                        <h3>Подтверждение записи</h3>
                        <div className="appointment-summary">
                            <div className="summary-item">
                                <img src={DoctorIcon} alt="Врач" />
                                <div>
                                    <h4>Врач</h4>
                                    <p>{selectedDoctor.last_name} {selectedDoctor.name} {selectedDoctor.patronymic}</p>
                                    <p>{selectedDoctor.specialty}</p>
                                </div>
                            </div>

                            <div className="summary-item">
                                <img src={ServiceIcon} alt="Услуга" />
                                <div>
                                    <h4>Услуга</h4>
                                    <p>{selectedService.name}</p>
                                    <p>{selectedService.duration} минут</p>
                                </div>
                            </div>

                            <div className="summary-item">
                                <img src={CalendarIcon} alt="Дата" />
                                <div>
                                    <h4>Дата и время</h4>
                                    <p>{selectedDate.toLocaleDateString('ru-RU', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long'
                                    })}</p>
                                    <p>{selectedTime}</p>
                                </div>
                            </div>

                            {reason && (
                                <div className="summary-item">
                                    <h4>Причина посещения</h4>
                                    <p>{reason}</p>
                                </div>
                            )}
                        </div>
                        <div className="confirmation-buttons">
                            <button className="edit-button" onClick={goToPreviousStep}>
                                Редактировать
                            </button>
                            <button
                                className="confirm-button"
                                onClick={handleCreateAppointment}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Создание записи...' : 'Подтвердить запись'}
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={"new-appointment-main-grid"}>
            <div className="new-appointment-container">
                <div className="appointment-header">
                    <button className="back-button" onClick={() => navigate(`/dashboard/appointments`)}>
                        <img src={BackIcon} alt="Назад" />
                        <span>Назад</span>
                    </button>
                    <h2>Новая запись на прием</h2>
                </div>

                <div className="appointment-steps">
                    {stepList.map(stepStruct => (
                        <div className={`step ${currentStep >= stepStruct.step ? 'active' : ''}`}>
                            <span>{stepStruct.step}. {stepStruct.label}</span>
                        </div>
                    ))}

                </div>

                <div className="appointment-content">
                    {renderStepContent()}
                </div>
            </div>
            <UserProfileComponent />
        </div>
    );
};

export default NewAppointmentComponent;