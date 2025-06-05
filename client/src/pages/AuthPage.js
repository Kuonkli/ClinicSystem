import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {useAlert} from "../services/AlertContext";
import axios from 'axios';
import '../styles/AuthPageStyles.css';

const AuthPage = () => {
    const location = useLocation();
    const { showAlert } = useAlert()
    const [isLoginForm, setIsLoginForm] = useState(location.state?.login || true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        last_name: '',
        patronymic: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/login', {
                email: formData.email,
                password: formData.password
            }, {
                withCredentials: true
            });

            if (response.status === 200) {
                navigate('/dashboard');
            }
        } catch (err) {
            console.log(err.response.data?.error);
            showAlert(
                err.response?.status,
                err.response?.data?.error || "Login error"
            );

        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:8080/signup', {
                name: formData.name,
                last_name: formData.last_name,
                phone: formData.phone,
                email: formData.email,
                password: formData.password,
                patronymic: formData.patronymic
            }, {
                withCredentials: true
            });

            if (response.status === 201) {
                navigate('/dashboard');
            }
        } catch (err) {
            showAlert(
                err.response?.status,
                err.response?.data?.error || "Registration error"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        if (isLoginForm) {
            handleLogin(e);
        } else {
            handleRegister(e);
        }
    };

    return (
        <div className="auth-container">
            <div className={`auth-card ${isLoginForm ? '' : 'double-column'}`}>
                <h2>{isLoginForm ? 'Вход в систему' : 'Регистрация'}</h2>

                <form onSubmit={handleSubmit}>
                    <div className={`auth-form ${isLoginForm ? '' : 'double-column'}`}>
                        {!isLoginForm && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="name">Имя</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        maxLength="200"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="last_name">Фамилия</label>
                                    <input
                                        type="text"
                                        id="last_name"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        required
                                        maxLength="200"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="patronymic">Отчество</label>
                                    <input
                                        type="text"
                                        id="patronymic"
                                        name="patronymic"
                                        value={formData.patronymic}
                                        onChange={handleChange}
                                        required
                                        maxLength="200"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone">Номер телефона</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </>
                        )}

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                maxLength="200"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Пароль</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength="8"
                                maxLength="72"
                            />
                        </div>
                    </div>

                    <div className="auth-buttons-block">
                        <button
                            type="submit"
                            className="auth-button"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Загрузка...' : isLoginForm ? 'Войти' : 'Зарегистрироваться'}
                        </button>
                        <button
                            type="button"
                            className="auth-home-button"
                            onClick={() => navigate('/')}
                            disabled={isLoading}
                        >
                            Назад
                        </button>
                    </div>
                </form>

                <div className="auth-switch">
                    {isLoginForm ? (
                        <p>
                            Еще нет аккаунта?{' '}
                            <button
                                type="button"
                                className="switch-button"
                                onClick={() => setIsLoginForm(false)}
                                disabled={isLoading}
                            >
                                Зарегистрируйтесь
                            </button>
                        </p>
                    ) : (
                        <p>
                            Уже есть аккаунт?{' '}
                            <button
                                type="button"
                                className="switch-button"
                                onClick={() => setIsLoginForm(true)}
                                disabled={isLoading}
                            >
                                Войдите
                            </button>
                        </p>
                    )}
                </div>
            </div>
            <div className="auth-background" />
        </div>
    );
};

export default AuthPage;