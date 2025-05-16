import React from 'react';
import {Link, useNavigate} from 'react-router-dom';
import '../styles/HomePageStyles.css';
import HeroComponent from "../components/HeroComponent";
import OnlineIcon from "../assets/images/online-icon.png";
import MedCardIcon from "../assets/images/med-card-icon.png";
import NotificationIcon from "../assets/images/notification-icon.png";
import SecurityIcon from "../assets/images/security-icon.png";

const HomePage = () => {
    const navigate = useNavigate();

    const handleAppointment = () => {
        navigate('/appointment');
    };

    const AnchorScroll = (id) => {
        const element = document.getElementById(id);
        const yOffset = -80;
        const y = element.getBoundingClientRect().top + window.scrollY + yOffset;

        window.scrollTo({ top: y, behavior: 'smooth' });
    }

    return (
        <div className="home-page">
            <header className="header">
                <div className="container">
                    <div className="logo">
                        <i className="fas fa-shield-alt logo-icon"></i>
                        <span>Поликлиника №1</span>
                    </div>
                    <nav className="nav">
                        <ul>
                            <li><button onClick={() => AnchorScroll('home')}>Главная</button></li>
                            <li><button onClick={() => AnchorScroll('features')}>Возможности</button></li>
                            <li><button onClick={() => AnchorScroll('services')}>Услуги</button></li>
                            <li><button onClick={() => AnchorScroll('doctors')}>Врачи</button></li>
                            <li><button onClick={() => AnchorScroll('contact')}>Контакты</button></li>
                        </ul>
                    </nav>
                    <div className="auth-buttons">
                        <button className="btn btn-login">Войти</button>
                        <button className="btn btn-primary">Регистрация</button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <HeroComponent />

            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="container">
                    <h2 className="section-title">Наши возможности</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <img className={"feature-images"} src={OnlineIcon || ''} alt={"online"}/>
                            </div>
                            <h3>Онлайн-запись</h3>
                            <p>Запишитесь на прием в удобное время без очередей</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <img className={"feature-images"} src={MedCardIcon || ''} alt={"card"}/>
                            </div>
                            <h3>Электронные карты</h3>
                            <p>Все медицинские данные в одном месте</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <img className={"feature-images"} src={NotificationIcon || ''} alt={"notifications"}/>
                            </div>
                            <h3>Напоминания</h3>
                            <p>Уведомления о предстоящих визитах</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <img className={"feature-images"} src={SecurityIcon || ''} alt={"security"}/>
                            </div>
                            <h3>Безопасность</h3>
                            <p>Ваши данные защищены</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="services-section">
                <div className="container">
                    <h2 className="section-title">Медицинские услуги</h2>
                    <div className="services-grid">
                        <div className="service-card">
                            <h3>Терапия</h3>
                            <p>Консультация терапевта, диагностика и лечение заболеваний</p>
                            <button className="btn btn-outline">Подробнее</button>
                        </div>
                        <div className="service-card">
                            <h3>Хирургия</h3>
                            <p>Консультация хирурга и плановые операции</p>
                            <button className="btn btn-outline">Подробнее</button>
                        </div>
                        <div className="service-card">
                            <h3>Педиатрия</h3>
                            <p>Профилактика и лечение детских заболеваний</p>
                            <button className="btn btn-outline">Подробнее</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Doctors Section */}
            <section id="doctors" className="doctors-section">
                <div className="container">
                    <h2 className="section-title">Наши врачи</h2>
                    <div className="doctors-grid">
                        <div className="doctor-card">
                            <div className="doctor-image">
                                <i className="fas fa-user-md"></i>
                            </div>
                            <h3>Др. Иванова</h3>
                            <p className="specialty">Терапевт</p>
                            <div className="rating">
                                {[1, 2, 3, 4].map((star) => (
                                    <i key={star} className="fas fa-star"></i>
                                ))}
                                <i className="fas fa-star-half-alt"></i>
                            </div>
                            <button className="btn btn-outline">Записаться</button>
                        </div>
                        <div className="doctor-card">
                            <div className="doctor-image">
                                <i className="fas fa-user-md"></i>
                            </div>
                            <h3>Др. Петров</h3>
                            <p className="specialty">Хирург</p>
                            <div className="rating">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <i key={star} className="fas fa-star"></i>
                                ))}
                            </div>
                            <button className="btn btn-outline">Записаться</button>
                        </div>
                        <div className="doctor-card">
                            <div className="doctor-image">
                                <i className="fas fa-user-md"></i>
                            </div>
                            <h3>Др. Сидорова</h3>
                            <p className="specialty">Педиатр</p>
                            <div className="rating">
                                {[1, 2, 3, 4].map((star) => (
                                    <i key={star} className="fas fa-star"></i>
                                ))}
                                <i className="far fa-star"></i>
                            </div>
                            <button className="btn btn-outline">Записаться</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="contact" className="footer">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-column">
                            <h3>О клинике</h3>
                            <ul>
                                <li><Link to="#">О нас</Link></li>
                                <li><Link to="#">Лицензии</Link></li>
                                <li><Link to="#">Вакансии</Link></li>
                            </ul>
                        </div>
                        <div className="footer-column">
                            <h3>Пациентам</h3>
                            <ul>
                                <li><Link to="#">Услуги</Link></li>
                                <li><Link to="#">Врачи</Link></li>
                                <li><Link to="#">Цены</Link></li>
                            </ul>
                        </div>
                        <div className="footer-column">
                            <h3>Контакты</h3>
                            <ul>
                                <li>г. Москва, ул. Медицинская, 15</li>
                                <li>+7 (495) 123-45-67</li>
                                <li>info@polyclinic.ru</li>
                            </ul>
                        </div>
                        <div className="footer-column">
                            <h3>Режим работы</h3>
                            <ul>
                                <li>Пн-Пт: 08:00 - 20:00</li>
                                <li>Сб: 09:00 - 18:00</li>
                                <li>Вс: выходной</li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-bottom">
                    <div className="social-links">
                            <Link to="#"><i className="fab fa-facebook-f"></i></Link>
                            <Link to="#"><i className="fab fa-instagram"></i></Link>
                        </div>
                        <p className="copyright">&copy; 2025 Поликлиника №1. Все права защищены.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;