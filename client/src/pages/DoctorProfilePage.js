import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAlert } from "../services/AlertContext";
import '../styles/DoctorProfileStyles.css';
import DefaultDoctorIcon from '../assets/images/default-user-icon.png';
import ExperienceIcon from "../assets/images/experience-icon.png"
import OfficeIcon from "../assets/images/office-icon.png"
import CalendarIcon from '../assets/images/calendar-icon.png';
import ReviewIcon from '../assets/images/review-icon.png';
import BackIcon from '../assets/images/back-icon.png';
import EditIcon from '../assets/images/edit-icon.png';
import DeleteIcon from '../assets/images/delete-icon.png';
import RatingStars from "../components/RatingStars";
import UserProfileComponent from "../components/UserProfileComponent";
import {addReview, updateReview, deleteReview, getDoctorById} from "../services/api";
import AppointmentsComponent from "../components/AppointmentsComponent";
import ServiceIcon from "../assets/images/services-icon-blue.png";
import ClockIcon from "../assets/images/clock-icon.png";

const DoctorProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('about');
    const [doctor, setDoctor] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [userReview, setUserReview] = useState(null)
    const [services, setServices] = useState([])
    const [reviewText, setReviewText] = useState('');
    const [isEditing, setIsEditing] = useState(false)
    const [hoverRating, setHoverRating] = useState(0);
    const [selectedRating, setSelectedRating] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { showAlert } = useAlert()

    const fetchDoctor = async () => {
        try {
            const res = await getDoctorById(id)

            setDoctor(res.data.doctor);
            setReviews(res.data.reviews);
            setUserReview(res.data.user_review)
            setServices(res.data.services)

            if (res.data.user_review) {
                setReviewText(res.data.user_review.comment);
                setSelectedRating(res.data.user_review.rating);
            }
        } catch (err) {
            showAlert(
                err.response?.status,
                err.response?.data?.error
            )
        }
    }

    useEffect(() => {
        fetchDoctor()
    }, [id]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        const review = {
            rating: selectedRating,
            comment: reviewText
        };

        try {
            if (userReview) {
                if (userReview.comment === reviewText && userReview.rating === selectedRating) {
                    cancelEditing()
                    return
                }
                const updatedReview = {
                    rating: selectedRating,
                    comment: reviewText
                };

                await updateReview(userReview.ID, updatedReview);

                showAlert(200, 'Отзыв успешно обновлен');
            } else {
                await addReview(id, review);
                showAlert(200, 'Отзыв успешно добавлен');
            }
            cancelEditing()
            await fetchDoctor();
        } catch (err) {
            showAlert(
                err.response?.status,
                err.response?.data?.error
            );
        }
    };

    const handleDeleteReview = async () => {
        if (!window.confirm("Вы уверены, что хотите удалить этот отзыв?")) return;

        try {
            await deleteReview(userReview.ID);
            setUserReview(null);
            setSelectedRating(0)
            setReviewText('')
            await fetchDoctor();
            setIsModalOpen(false)
            showAlert(200, "Отзыв успешно удален");
        } catch (err) {
            showAlert(
                err.response?.status,
                err.response?.data?.error || "Ошибка при удалении отзыва"
            );
        }
    };

    const cancelEditing = () => {
        if (userReview) {
            setReviewText(userReview.comment);
            setSelectedRating(userReview.rating);
        } else {
            setReviewText('');
            setSelectedRating(0);
        }
        setIsModalOpen(false);
    };

    useEffect(() => {
        if (isModalOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, [isModalOpen])

    if (!doctor) {
        return <div className="profile-loading">Загрузка...</div>;
    }

    return (
        <div className={`doctor-profile-page`}>
            <div className={`doctor-profile-main-grid`}>
                <div className={`profile-container`}>
                    <button className="nav-back-btn" onClick={() => navigate(-1)}>
                        <img src={BackIcon || ''} alt="Назад"/>
                        Назад
                    </button>

                    <section className="profile-header">
                        <div className="profile-avatar">
                            <img
                                src={doctor.photo_url ? `http://localhost:8080/api/${doctor.photo_url}` : DefaultDoctorIcon || ''}
                                alt={doctor.name}/>
                        </div>
                        <div className="doctor-profile-info">
                            <h1>{doctor.last_name} {doctor.name} {doctor.patronymic}</h1>
                            <p className="profile-specialty">{doctor.specialty}</p>

                            <div className="rating-container">
                                <RatingStars rating={doctor.avg_rating}/>
                                <span className="rating-value">{doctor.avg_rating.toFixed(1)}</span>
                                <span className="rating-count">({doctor.review_count} отзывов)</span>
                            </div>

                            <div className="profile-meta">
                                <img src={ExperienceIcon || ''} alt={"exp"}/>
                                <span>Опыт работы: {doctor.experience} лет</span>
                            </div>

                            <div className="profile-meta">
                                <img src={OfficeIcon || ''} alt={"office"}/>
                                <span>Кабинет: {doctor.cabinet} </span>
                            </div>

                            <div className="schedule-info">
                                <img src={CalendarIcon || ''} alt="Расписание"/>
                                <span>{doctor.cabinet}</span>
                            </div>

                            <button
                                className="doctor-profile-primary-btn"
                                onClick={() => navigate(`/dashboard/appointments/new?doctorId=${doctor.id}`)}
                            >
                                Записаться на прием
                            </button>
                        </div>
                    </section>

                    <nav className="profile-nav">
                        <button
                            className={`nav-btn ${activeTab === 'about' ? 'active' : ''}`}
                            onClick={() => setActiveTab('about')}
                        >
                            О враче
                        </button>
                        <button
                            className={`nav-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            Отзывы
                        </button>
                    </nav>

                    <main className="profile-content">
                        {activeTab === 'about' && (
                            <>
                                <section className="about-content">
                                    <h2>Описание</h2>
                                    <p>{doctor.description}</p>
                                </section>
                                <section className="services-content">
                                    <h2>Предоставляемые услуги</h2>
                                    <div className="doctor-profile-services-list">
                                        {services.map(service => (
                                            <div
                                                key={service.ID}
                                                className={`doctor-profile-service-card selected`}
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
                                                <button
                                                    className="doctor-profile-secondary-btn"
                                                    onClick={() => navigate(`/dashboard/appointments/new?doctorId=${doctor.id}&serviceId=${service.ID}`)}
                                                >
                                                    Записаться
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </>

                        )}

                        {activeTab === 'reviews' && (
                            <div className="reviews-list">
                                <div className={"reviews-list-header"}>
                                    <h2>Отзывы пациентов ({reviews.length})</h2>
                                    <button
                                        onClick={() => {
                                            window.scrollTo(0, 0)
                                            setIsModalOpen(true)
                                        }}
                                        className={"open-review-form-btn"}
                                    >
                                        {userReview ? 'Изменить отзыв' : 'Оставить отзыв'}
                                    </button>
                                </div>
                                {userReview ? (
                                    <article key={userReview.ID} className={"user-review review-item"}>
                                        <header className="review-header">
                                                <span className="review-author">
                                                    {userReview.User?.last_name} {userReview.User?.name}
                                                </span>
                                                <span className="review-date">
                                                    {new Date(userReview.CreatedAt).toLocaleDateString()}
                                                </span>
                                            <div className="review-stars">
                                                <RatingStars rating={userReview?.rating}/>
                                            </div>
                                        </header>
                                        <p className="review-body">{userReview.comment}</p>
                                    </article>
                                ) : null}
                                {reviews.length > 0 ? (
                                    reviews.filter(r => !userReview || r.ID !== userReview.ID).map(review => (
                                        <article key={review.ID} className="review-item">
                                            <header className="review-header">
                                                <span className="review-author">
                                                    {review.User?.last_name} {review.User?.name}
                                                </span>
                                                <span className="review-date">
                                                    {new Date(review.CreatedAt).toLocaleDateString()}
                                                </span>
                                                <div className="review-stars">
                                                    <RatingStars rating={review.rating}/>
                                                </div>
                                            </header>
                                            <p className="review-body">{review.comment}</p>
                                        </article>
                                    ))
                                ) : (
                                    <p className="no-reviews">Пока нет отзывов</p>
                                )}
                            </div>
                        )}
                    </main>
                </div>
                <UserProfileComponent/>
            </div>
            {isModalOpen ? (
                <div className={`review-form-wrapper`}>
                    <div className={`review-form-background`}
                         onClick={cancelEditing}
                    />
                    <div className={"add-review-form"}>
                        <div className={"close-review-modal-container"}>
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="close-review-modal-icon"
                                onClick={cancelEditing}
                            >
                                <path
                                    d="M18 6L6 18"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M6 6L18 18"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <div className="review-meta">
                            <div className="stars-select-container">
                                {[1, 2, 3, 4, 5].map((index) => (
                                    <span
                                        key={index}
                                        className={`star ${index <= (hoverRating || selectedRating) ? 'filled' : ''}`}
                                        onMouseEnter={() => setHoverRating(index)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => index === selectedRating ?
                                            setSelectedRating(0) : setSelectedRating(index)}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                        </div>
                        <textarea
                            className={"review-text"}
                            placeholder={"Напишите отзыв..."}
                            value={reviewText}
                            onChange={(e) => {
                                setReviewText(e.target.value);
                            }}
                        />
                        <div className="review-actions">
                            <button onClick={handleSubmitReview} className="leave-review-btn">
                                <img src={ReviewIcon || ''} alt="Редактировать"/>
                                Отправить
                            </button>
                            {userReview ? (
                                <button onClick={handleDeleteReview} className="delete-review-comment-btn">
                                    <img src={DeleteIcon || ''} alt="Удалить"/>
                                    Удалить
                                </button>
                            ) : (
                                <button
                                    className={"delete-review-comment-btn"}
                                    onClick={cancelEditing}
                                >
                                    Отмена
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ) : null}

        </div>
    );
};

export default DoctorProfilePage;