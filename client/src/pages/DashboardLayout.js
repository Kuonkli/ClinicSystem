import React, {useEffect, useState} from 'react';
import {NavLink, Outlet, useParams} from 'react-router-dom';
import {getUser} from "../services/api";
import {useAlert} from "../services/AlertContext";
import '../styles/DashboardStyles.css';
import HomeIcon from "../assets/images/home-icon.png"
import AppointmentsIcon from "../assets/images/appointments-icon.png"
import DoctorIcon from "../assets/images/doctor-icon.png"
import ServicesIcon from "../assets/images/services-icon.png"
import DocumentsIcon from "../assets/images/documents-icon.png"
import UserHomeComponent from "../components/UserHomeComponent";
import AppointmentsComponent from "../components/AppointmentsComponent";
import DoctorsListComponent from "../components/DoctorsListComponent";
import ServicesComponent from "../components/ServicesComponent";
import UserProfileComponent from "../components/UserProfileComponent";
import DocumentsComponent from "../components/DocumentsComponent";

const DashboardLayout = () => {
    const showAlert = useAlert();
    const params = useParams()

    return (
        <div className="dashboard-container">
            <nav className="sidebar">
                <ul className="sidebar-menu">
                    <li>
                        <NavLink to={`/dashboard`} end>
                            <img src={HomeIcon || ''} alt="home" />
                            <span>Главная</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={`/dashboard/appointments`}>
                            <img src={AppointmentsIcon || ''} alt="appointments"/>
                            <span>Записи</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={`/dashboard/doctors`}>
                            <img src={DoctorIcon || ''} alt="doctors"/>
                            <span>Врачи</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={`/dashboard/services`}>
                            <img src={ServicesIcon || ''} alt="services"/>
                            <span>Услуги</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={`/dashboard/documents`}>
                            <img src={DocumentsIcon || ''} alt={"documents"}/>
                            <span>Документы</span>
                        </NavLink>
                    </li>
                </ul>
            </nav>

            <main className="main-content">
                {params.content === 'appointments' ? (
                    <AppointmentsComponent />
                ) : params.content === 'doctors' ? (
                    <DoctorsListComponent />
                ) : params.content === 'services' ? (
                    <ServicesComponent />
                ) : params.content === 'documents' ? (
                    <DocumentsComponent />
                ) : (
                    <UserHomeComponent />
                )}
            </main>

            <UserProfileComponent />
        </div>
    );
};

export default DashboardLayout;