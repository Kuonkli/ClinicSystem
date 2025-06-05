import React, {useEffect, useState} from 'react';
import UserIcon from "../assets/images/user-icon.png";
import "../styles/UserProfileStyles.css"
import {getUser, LogOut} from "../services/api";
import { useAlert } from "../services/AlertContext";
import {useNavigate} from "react-router-dom";

const UserProfileComponent = ({ user }) => {
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [profile, setProfile] = useState({});
    const showAlert = useAlert()

    useEffect(() => {
        fetchUserProfile().catch((err) => {
            console.log(err)})
    }, [])

    const fetchUserProfile = async () => {
        try {
            const res = await getUser()
            setProfile(res.data.user);
        } catch (err) {
            showAlert({
                status: err.response?.status,
                message: err.response?.data?.error
            })
        }
    }

    const handleLogOut = async () => {
        try {
            const res = await LogOut()
            if (res.status === 200) {
                navigate(`/auth`)
            }
        } catch (err) {
            showAlert({
                status: err.response?.status,
                message: err.response?.data?.error
            })
        }
    }



    return (
        <div className="user-profile-wrapper">
            <div
                className={`profile-toggle ${isProfileOpen ? 'active' : ''}`}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
                <img src={UserIcon || ''} alt="user" className="user-profile-image"/>
            </div>


            <div className={`profile-panel ${isProfileOpen ? 'open' : ''}`}>
                <div className="user-profile-header">
                    <h3>Профиль пользователя</h3>
                </div>

                <div className="profile-tabs">
                    <button
                        className={activeTab === 'profile' ? 'active' : ''}
                        onClick={() => setActiveTab('profile')}
                    >
                        Профиль
                    </button>
                    <button
                        className={activeTab === 'documents' ? 'active' : ''}
                        onClick={() => setActiveTab('documents')}
                    >
                        Фото
                    </button>
                </div>

                <div className="profile-content">
                    {activeTab === 'profile' ? (
                        <div className="profile-info-container">
                            <div className="profile-info">
                                <div className="info-item">
                                    <label>Имя:</label>
                                    <span>{profile.last_name} {profile.name} {profile.patronymic}</span>
                                </div>
                                <div className="info-item">
                                    <label>Email:</label>
                                    <span>{profile.email}</span>
                                </div>
                                <div className="info-item">
                                    <label>Телефон:</label>
                                    <span>{profile.phone}</span>
                                </div>
                            </div>
                            <button className="edit-btn">Редактировать</button>
                            <button className="logout-btn" onClick={handleLogOut}>Выйти</button>
                        </div>
                    ) : (
                        <div className="documents-section">
                            <h4>Фото</h4>
                            <div className="document-upload">
                                <input
                                    type="file"
                                    id="document-upload"
                                    multiple
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="document-upload" className="upload-btn">
                                    <i className="fas fa-cloud-upload-alt"></i> Загрузить документы
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfileComponent;