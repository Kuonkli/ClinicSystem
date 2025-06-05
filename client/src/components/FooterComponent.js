import React from 'react';
import {Link} from "react-router-dom";
import "../styles/FooterStyles.css"

const FooterComponent = () => {

    return (
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
    )
}

export default FooterComponent;