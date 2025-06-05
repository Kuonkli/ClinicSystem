import React from 'react';
import {Link, useNavigate} from 'react-router-dom';
import '../styles/HomePageStyles.css';
import HeroComponent from "../components/HeroComponent";
import OnlineIcon from "../assets/images/online-icon.png";
import MedCardIcon from "../assets/images/med-card-icon.png";
import NotificationIcon from "../assets/images/notification-icon.png";
import SecurityIcon from "../assets/images/security-icon.png";
import DefaultUserIcon from "../assets/images/default-user-icon.png"
import FooterComponent from "../components/FooterComponent";

const HomePage = () => {
    const navigate = useNavigate();

    const AnchorScroll = (id) => {
        const element = document.getElementById(id);
        const yOffset = -80;
        const y = element.getBoundingClientRect().top + window.scrollY + yOffset;

        window.scrollTo({ top: y, behavior: 'smooth' });
    }

    return (
        <div className="medconnect-home">
            <header className="medconnect-header">
                <div className="medconnect-container">
                    <div className="medconnect-logo">
                        <span>Поликлиника №1</span>
                    </div>
                    <nav className="medconnect-nav">
                        <ul className="medconnect-nav-list">
                            <li><button onClick={() => AnchorScroll('home')}>Главная</button></li>
                            <li><button onClick={() => AnchorScroll('features')}>Возможности</button></li>
                            <li><button onClick={() => AnchorScroll('services')}>Услуги</button></li>
                            <li><button onClick={() => AnchorScroll('doctors')}>Врачи</button></li>
                            <li><button onClick={() => AnchorScroll('contact')}>Контакты</button></li>
                        </ul>
                    </nav>
                    <div className="medconnect-auth-buttons">
                        <button className="medconnect-btn medconnect-btn-login" onClick={() => navigate(`/auth`, { state: {login: true} })}>Войти</button>
                        <button className="medconnect-btn medconnect-btn-primary" onClick={() => navigate(`/auth`, { state: {login: false} })}>Регистрация</button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <HeroComponent />

            {/* Features Section */}
            <section id="features" className="medconnect-features">
                <div className="medconnect-container">
                    <h2 className="medconnect-section-title">Наши возможности</h2>
                    <div className="medconnect-features-grid">
                        <div className="medconnect-feature-card">
                            <div className="medconnect-feature-icon">
                                <img className="medconnect-feature-img" src={OnlineIcon || ''} alt={"online"}/>
                            </div>
                            <h3>Онлайн-запись</h3>
                            <p>Запишитесь на прием в удобное время без очередей</p>
                        </div>
                        <div className="medconnect-feature-card">
                            <div className="medconnect-feature-icon">
                                <img className="medconnect-feature-img" src={MedCardIcon || ''} alt={"card"}/>
                            </div>
                            <h3>Электронные карты</h3>
                            <p>Все медицинские данные в одном месте</p>
                        </div>
                        <div className="medconnect-feature-card">
                            <div className="medconnect-feature-icon">
                                <img className="medconnect-feature-img" src={NotificationIcon || ''} alt={"notifications"}/>
                            </div>
                            <h3>Напоминания</h3>
                            <p>Уведомления о предстоящих визитах</p>
                        </div>
                        <div className="medconnect-feature-card">
                            <div className="medconnect-feature-icon">
                                <img className="medconnect-feature-img" src={SecurityIcon || ''} alt={"security"}/>
                            </div>
                            <h3>Безопасность</h3>
                            <p>Ваши данные защищены</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="medconnect-services">
                <div className="medconnect-container">
                    <h2 className="medconnect-section-title">Медицинские услуги</h2>
                    <div className="medconnect-services-grid">
                        <div className="medconnect-service-card">
                            <h3>Терапия</h3>
                            <p>Консультация терапевта, диагностика и лечение заболеваний</p>
                            <button className="medconnect-btn medconnect-btn-outline">Подробнее</button>
                        </div>
                        <div className="medconnect-service-card">
                            <h3>Хирургия</h3>
                            <p>Консультация хирурга и плановые операции</p>
                            <button className="medconnect-btn medconnect-btn-outline">Подробнее</button>
                        </div>
                        <div className="medconnect-service-card">
                            <h3>Педиатрия</h3>
                            <p>Профилактика и лечение детских заболеваний</p>
                            <button className="medconnect-btn medconnect-btn-outline">Подробнее</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Doctors Section */}
            <section id="doctors" className="medconnect-doctors">
                <div className="medconnect-container">
                    <h2 className="medconnect-section-title">Наши врачи</h2>
                    <div className="medconnect-doctors-grid">
                        <div className="medconnect-doctor-card">
                            <div className="medconnect-doctor-image">
                                <img src={DefaultUserIcon} alt={"doctor"}/>
                            </div>
                            <h3>Др. Иванова</h3>
                            <p className="medconnect-specialty">Терапевт</p>
                            <div className="medconnect-rating">
                                {[1, 2, 3, 4].map((star) => (
                                    <i key={star} className="fas fa-star"></i>
                                ))}
                                <i className="fas fa-star-half-alt"></i>
                            </div>
                            <button className="medconnect-btn medconnect-btn-outline">Записаться</button>
                        </div>
                        <div className="medconnect-doctor-card">
                            <div className="medconnect-doctor-image">
                                <img src={DefaultUserIcon} alt={"doctor"}/>
                            </div>
                            <h3>Др. Петров</h3>
                            <p className="medconnect-specialty">Хирург</p>
                            <div className="medconnect-rating">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <i key={star} className="fas fa-star"></i>
                                ))}
                            </div>
                            <button className="medconnect-btn medconnect-btn-outline">Записаться</button>
                        </div>
                        <div className="medconnect-doctor-card">
                            <div className="medconnect-doctor-image">
                                <img src={DefaultUserIcon} alt={"doctor"}/>
                            </div>
                            <h3>Др. Сидорова</h3>
                            <p className="medconnect-specialty">Педиатр</p>
                            <div className="medconnect-rating">
                                {[1, 2, 3, 4].map((star) => (
                                    <i key={star} className="fas fa-star"></i>
                                ))}
                                <i className="far fa-star"></i>
                            </div>
                            <button className="medconnect-btn medconnect-btn-outline">Записаться</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <FooterComponent />
        </div>
    );
};

export default HomePage;