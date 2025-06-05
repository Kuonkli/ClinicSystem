import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import '../styles/DoctorsListStyles.css';
import DefaultDoctorIcon from '../assets/images/default-user-icon.png';
import RatingStars from "./RatingStars";
import AddAppointment from '../assets/images/add-doctor-appointment.png';
import SearchIcon from "../assets/images/search-icon.png";
import {getAllDoctors} from "../services/api";
import {useAlert} from "../services/AlertContext";
import CustomSelect from "./CustomSelectComponent";

const DoctorsListComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Все');
    const [doctors, setDoctors] = useState([])
    const showAlert = useAlert()

    const categories = [{value: 'Все', label: 'Все'}, ...new Set(doctors.map(doctor => ({
        value: doctor.specialty,
        label: doctor.specialty
    })))];

    const handleCardClick = (id) => {
        navigate(`/dashboard/doctors/${id}`);
    };

    const handleViewProfile = (e, id) => {
        e.stopPropagation();
        navigate(`/dashboard/doctors/${id}`);
    };

    const fetchDoctors = async () => {
        try {
            const res = await getAllDoctors(searchTerm)
            console.log(res)
            setDoctors(res.data.doctors);
        } catch (err) {
            console.log(err)
            showAlert(
                err.response?.status,
                err.response?.data?.error
            )
        }
    }

    useEffect(() => {
        fetchDoctors().then(() => console.log(doctors))
    }, [location])

    const filteredDoctors = doctors.filter(doctor => {return doctor.specialty === selectedCategory || selectedCategory === 'Все'})

    return (
        <div className="doctors-container">
            <div className="doctors-header">
                <h2>Наши врачи</h2>
                <div className="doctors-controls">
                    <div className="doctors-search-container">
                        <input
                            type="text"
                            placeholder="Поиск врача..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="doctors-search-input"
                        />
                        <button
                            className={"search-doctors-btn"}
                            onClick={() => navigate(`/dashboard/doctors?search=${searchTerm}`)}
                        >
                            <img src={SearchIcon || ''} alt="search" className="doctors-search-icon"/>
                        </button>
                    </div>
                    <div className="category-filter">
                        <CustomSelect
                            value={selectedCategory}
                            onChange={(option) => setSelectedCategory(option.value)}
                            options={categories}
                            placeholder = "Все"
                        />
                    </div>
                </div>
            </div>

            <div className="doctors-grid">
                {filteredDoctors.map(doctor => (
                    <div
                        key={doctor.ID}
                        className="doctor-card"
                        onClick={() => handleCardClick(doctor.id)}
                    >
                        <div className="doctor-info">
                            <h3>{doctor.last_name} {doctor.name} {doctor.patronymic}</h3>
                            <p className="doctor-specialty">{doctor.specialty}</p>

                            <div className="doctor-meta">
                                <div className="doctor-experience">
                                    <span>Опыт: {doctor.experience} лет</span>
                                </div>

                                <div className="doctor-cabinet">
                                    <span>{doctor.cabinet}</span>
                                </div>

                                <div className="doctor-rating">
                                    <RatingStars rating={doctor.avg_rating} doctorId={doctor.id}/>
                                    <span className="rating-number">{doctor.avg_rating.toFixed(1)}</span>
                                    <span className="reviews-count">({doctor.review_count} отзывов)</span>
                                </div>

                            </div>

                            <div className="doctor-actions">
                                <button
                                    className="view-profile-btn"
                                    onClick={(e) => handleViewProfile(e, doctor.id)}
                                >
                                    <span>Профиль врача</span>
                                </button>
                                <button
                                    className="book-appointment-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/dashboard/appointments/new?doctorId=${doctor.id}`);
                                    }}
                                >
                                    <img src={AddAppointment || ''} alt={'add'}/>
                                    Записаться
                                </button>
                            </div>
                        </div>

                        <div className="doctor-image-container">
                            <img src={doctor.photo_url ? `http://localhost:8080/api/${doctor.photo_url}` : DefaultDoctorIcon || ''} alt={doctor.name} className="doctor-image" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DoctorsListComponent;