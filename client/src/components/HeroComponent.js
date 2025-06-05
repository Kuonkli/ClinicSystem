import React from "react";
import "../styles/HeroSectionStyles.css"
import HeroDoctorImage from "../assets/images/hero-doc.png";
import HeroBackgroundImage from "../assets/images/hero-back.png";
import {useNavigate} from "react-router-dom";
import dashboardLayout from "../pages/DashboardLayout";

const HeroComponent = () => {
    const navigate = useNavigate();

    return (
        <section id="home" className="hero-section">
            <div className="container">
                <div className="hero-background">
                    <div className="hero-content">
                        <h1>Медицинская информационная система</h1>
                        <p className="hero-text">
                            Современное решение для записи на прием, ведения медицинских карт и управления клиникой.
                            Быстро, удобно и безопасно.
                        </p>
                        <button
                            className="hero-button-appointment"
                            onClick={() => navigate("/dashboard/appointments")}
                        >
                            Записаться на прием
                        </button>
                        <button
                            className="hero-button-account"
                            onClick={() => navigate("/dashboard")}
                        >
                            Личный кабинет
                        </button>
                    </div>
                    <div className={"hero-live-image"}>
                        <img className={"hero-live-image-doctor"} src={HeroDoctorImage || ''} alt={"hero"}/>
                        <img className={"hero-live-image-background"} src={HeroBackgroundImage || ''} alt={"hero"}/>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HeroComponent