import React, {useEffect, useState} from 'react';
import '../styles/ServicesStyles.css';
import {useLocation, useNavigate} from "react-router-dom";
import ClockIcon from '../assets/images/clock-icon.png';
import MoneyIcon from '../assets/images/money-icon.png';
import SearchIcon from '../assets/images/search-icon.png';
import {useAlert} from "../services/AlertContext";
import {getAllServices} from "../services/api";

const ServicesComponent = () => {
    const navigate = useNavigate();
    const location = useLocation()
    const {showAlert} = useAlert()
    const [searchTerm, setSearchTerm] = useState('');
    const [sortPattern, setSortPattern] = useState('');
    const [activeTab, setActiveTab] = useState(null);
    const [services, setServices] = useState([])

    const fetchServices = async () => {
        try {
            const res = await getAllServices(searchTerm, sortPattern)
            setServices(res.data.services);
        } catch (err) {
            showAlert(
                err.response?.status,
                err.response?.data?.error
            )
        }
    }

    useEffect(() => {
        fetchServices()
    }, [location])

    const handleParamsChange = (sort, search) =>{
        const params = new URLSearchParams();

        if (sort && sort !== "newest") {
            params.set("sort", sort);
        }

        if (search) {
            params.set("search", search);
        }

        const queryString = params.toString();
        navigate(`/dashboard/services${queryString ? `?${queryString}` : ""}`)
    }

    const filteredServices = services.filter(service => {
        return (service.is_paid === false && activeTab === 'free')
            || (service.is_paid === true && activeTab === 'paid') || activeTab === null;
    });

    return (
        <div className="services-container">
            <div className="services-header">
                <h2>Услуги поликлиники</h2>
                <div className="services-controls">
                    <div className="services-search-container">
                        <input
                            type="text"
                            placeholder="Поиск услуг..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <button
                            className={"search-services-btn"}
                            onClick={() => handleParamsChange(sortPattern, searchTerm)}
                        >
                            <img src={SearchIcon || ''} alt="search" className="search-icon"/>
                        </button>

                    </div>
                </div>
            </div>
            <div className="services-tabs">
                <button
                    className={activeTab === 'free' ? 'active' : ''}
                    onClick={() => activeTab === 'free' ? setActiveTab(null) : setActiveTab('free')}
                >
                    Бесплатные
                </button>
                <button
                    className={activeTab === 'paid' ? 'active' : ''}
                    onClick={() => activeTab === 'paid' ? setActiveTab(null) :  setActiveTab('paid')}
                >
                    Платные
                </button>
            </div>
            <div className="services-grid">
                {filteredServices.length > 0 ? (
                    filteredServices.map(service => (
                        <div key={service.ID} className="service-card">
                            <div className="service-main-info">
                                <h3>{service.name}</h3>
                                <p className="service-description">{service.description}</p>
                                <div className="service-meta">
                                    <div className="meta-item">
                                        <img src={ClockIcon || ''} alt="duration" className="meta-icon"/>
                                        <span>{service.duration}</span>
                                    </div>
                                    <div className="meta-item">
                                        <img src={MoneyIcon || ''} alt="price" className="meta-icon"/>
                                        <span className={service.is_paid ? 'paid' : 'free'}>
                                            {service.is_paid ?  service.price + ' руб.' : 'Бесплатно' }
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="service-actions">
                                <button
                                    className="book-btn"
                                    onClick={() => navigate(`/dashboard/appointments/new?serviceId=${service.ID}`)}
                                >
                                    Записаться
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-results">
                        <p>Услуги по вашему запросу не найдены</p>
                        <button
                            className="reset-filters-btn"
                            onClick={() => {
                                setSearchTerm('');
                                setActiveTab(null)
                            }}
                        >
                            Сбросить фильтры
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServicesComponent;