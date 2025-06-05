import React, { useState, useEffect, useRef } from 'react';
import { useAlert } from '../services/AlertContext';
import axios from 'axios';
import '../styles/DocumentsStyles.css';

import PassportIcon from '../assets/images/passport-icon.png';
import OmsIcon from '../assets/images/oms-icon.png';
import SnilsIcon from '../assets/images/snils-icon.png';
import EditIcon from '../assets/images/edit-icon.png'
import UploadIcon from '../assets/images/upload-icon.png';
import DeleteIcon from '../assets/images/delete-icon.png';
import OptionsIcon from '../assets/images/options-dots-icons.png';
import CancelIcon from '../assets/images/cancel-icon.png';
import GerbIcon from '../assets/images/gerb-icon.png';
import CustomSelect from "./CustomSelectComponent";
import {EditDocuments, getDocuments} from "../services/api";
import {Link} from "react-router-dom";

const DocumentsComponent = () => {
    const { showAlert } = useAlert();
    const genderOptions = [
        { value: 'Мужской', label: 'Мужской' },
        { value: 'Женский', label: 'Женский' }
    ];

    const [activeTab, setActiveTab] = useState('passport');
    const [isPreviewPassport, setIsPreviewPassport] = useState(false);
    const [isPreviewOms, setIsPreviewOms] = useState(false);
    const [isPreviewSnils, setIsPreviewSnils] = useState(false);
    const [isEditing, setIsEditing] = useState(false)
    const [documents, setDocuments] = useState({
        passport: [],
        oms: [],
        snils: []
    });
    const [formData, setFormData] = useState({
        passport: {},
        oms: {},
        snils: {}
    });
    const [isLoading, setIsLoading] = useState(false);

    const fileInputRefs = {
        passport: useRef(null),
        oms: useRef(null),
        snils: useRef(null)
    };

    const fetchDocuments = async () => {
        try {
            setIsLoading(true);
            const response = await getDocuments();

            const formattedData = {
                passport: response.data.passport || {},
                oms: response.data.oms || {},
                snils: response.data.snils || {}
            };

            setFormData(formattedData);

            setDocuments({
                passport: response.data.passport?.scan_url ? [response.data.passport.scan_url] : [],
                oms: response.data.oms?.scan_url ? [response.data.oms.scan_url] : [],
                snils: response.data.snils?.scan_url ? [response.data.snils.scan_url] : []
            });

            setIsPreviewPassport(response.data.passport)
            setIsPreviewOms(response.data.oms)
            setIsPreviewSnils(response.data.snils)
        } catch (error) {
            showAlert({
                status: error.response?.status,
                message: error.response?.data?.error || 'Ошибка загрузки документов'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments()
    }, []);

    const handleFileChange = (docType, e) => {
        const files = Array.from(e.target.files);
        if (files.some(file => file.size > 5 * 1024 * 1024)) {
            showAlert({ status: 400, message: 'Каждый файл должен быть меньше 5MB' });
            return;
        }

        setDocuments(prev => ({
            ...prev,
            [docType]: [...prev[docType], ...files].slice(0, docType === 'snils' ? 2 : 3)
        }));
    };

    const handleRemoveFile = (docType, index) => {
        setDocuments(prev => ({
            ...prev,
            [docType]: prev[docType].filter((_, i) => i !== index)
        }));
    };

    const handleInputChange = (docType, field, value) => {
        setFormData(prev => ({
            ...prev,
            [docType]: { ...prev[docType], [field]: value }
        }));
    };

    const handleSubmit = async (docType) => {
        try {
            setIsLoading(true);
            const formDataToSend = new FormData();

            for (const [key, value] of Object.entries(formData[docType])) {
                console.log(key, value)
                if (value !== undefined && value !== null) {
                    formDataToSend.append(key, value);
                }
            }
            // Добавляем файлы
            documents[docType].forEach(file => {
                if (typeof file !== 'string') { // Только новые файлы, не URL
                    formDataToSend.append('files', file);
                }
            });

            const response = await EditDocuments(formDataToSend, docType);
            console.log(response)
            showAlert( response.status, 'Документы успешно сохранены' );
            await fetchDocuments();
        } catch (error) {
            showAlert(
                error.response?.status,
                error.response?.data?.error || 'Ошибка сохранения документов'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const renderPassportForm = () => (
        Object.keys(formData.passport).length && isPreviewPassport ?  (
            <div className="document-preview">
                <div className="preview-header">
                    <h3>Паспорт</h3>
                    <button
                        className="edit-preview-btn"
                        onClick={() => setIsPreviewPassport(false)}
                    >
                        Детали
                    </button>
                </div>

                <div className="preview-card">
                    <div className={"preview-info-section"}>
                        <div className="preview-col">
                            <span className="passport-series-number-preview">
                                {formData.passport.series} {formData.passport.number}
                            </span>
                        </div>

                        <div className="preview-col">
                            <span className="preview-label">Кем выдан</span>
                            <span className="preview-value">
                                {formData.passport.issued_by}
                            </span>
                        </div>

                        <div className={"preview-row"}>
                            <div className="preview-col">
                                <span className="preview-label">Дата выдачи</span>
                                <span className="preview-value">
                                {new Date(formData.passport.issued_date).toLocaleDateString()}
                            </span>
                            </div>
                            <div className="preview-col">
                                <span className="preview-label">Код подразделения</span>
                                <span className="preview-value">
                                {formData.passport.unit_code}
                            </span>
                            </div>
                        </div>

                        <div className="preview-col">
                            <span className="preview-label">ФИО</span>
                            <span className="preview-value">
                                {formData.passport.last_name} {formData.passport.first_name} {formData.passport.patronymic}
                            </span>
                        </div>

                        <div className={"preview-row"}>
                            <div className="preview-col">
                                <span className="preview-label">Пол</span>
                                <span className="preview-value">
                            {formData.passport.gender}
                        </span>
                            </div>

                            <div className="preview-col">
                                <span className="preview-label">Дата рождения</span>
                                <span className="preview-value">
                            {new Date(formData.passport.birth_date).toLocaleDateString()}
                        </span>
                            </div>
                        </div>

                        <div className="preview-col">
                            <span className="preview-label">Место рождения:</span>
                            <span className="preview-value">
                                {formData.passport.birth_place}
                            </span>
                        </div>
                    </div>

                    <div className={"preview-img-section"}>
                        <img src={GerbIcon || ''} alt={"gerb"}/>
                    </div>
                </div>
                {documents.passport.length > 0 && (
                    <div className="preview-files">
                        <span className="preview-label">Прикрепленные файлы:</span>
                        <div className="file-previews">
                            {documents.passport.map((file, index) => (
                                <div key={index} className="file-preview-item">
                                    {typeof file === 'string' ? (
                                        <Link to={file} target={"_blank"}>
                                            Файл {file.split('/').at(-1)}
                                        </Link>
                                    ) : (
                                        <span>Файл {index + 1}: {file}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        ) : (
            <div className="document-form">
                <div className={"document-form-header"}>
                    <div className={"edit-document-wrapper"}>
                        <h3>Паспорт</h3>
                        <button
                            className={"edit-preview-btn"}
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? (
                                <img src={CancelIcon || ''} alt={'cancel'}/>
                            ) : (
                                <img src={EditIcon || ''} alt={'edit'}/>
                            )}

                        </button>
                    </div>
                    { Object.keys(formData.oms).length > 0 ? (
                        <button
                            className="edit-preview-btn"
                            onClick={() => setIsPreviewPassport(true)}
                        >
                            Предпросмотр
                        </button>
                    ) : null}
                </div>
                <div className="row-groups-wrapper">
                    <div className="documents-form-group row-form-group">
                        <label>Серия:</label>
                        <input
                            type="text"
                            value={formData.passport?.series}
                            onChange={(e) => handleInputChange('passport', 'series', e.target.value)}
                            maxLength="4"
                            placeholder="1234"
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="documents-form-group row-form-group">
                        <label>Номер:</label>
                        <input
                            type="text"
                            value={formData.passport?.number}
                            onChange={(e) => handleInputChange('passport', 'number', e.target.value)}
                            maxLength="6"
                            placeholder="567890"
                            disabled={!isEditing}
                        />
                    </div>
                </div>

                <div className="documents-form-group">
                    <label>Кем выдан:</label>
                    <input
                        type="text"
                        value={formData.passport?.issued_by}
                        onChange={(e) => handleInputChange('passport', 'issued_by', e.target.value)}
                        disabled={!isEditing}
                    />
                </div>
                <div className="row-groups-wrapper">
                    <div className="documents-form-group row-form-group">
                        <label>Дата выдачи:</label>
                        <input
                            type="date"
                            value={formData.passport?.issued_date}
                            onChange={(e) => handleInputChange('passport', 'issued_date', e.target.value)}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="documents-form-group row-form-group">
                        <label>Код подразделения:</label>
                        <input
                            type="text"
                            placeholder="123-456"
                            value={formData.passport?.unit_code}
                            onChange={(e) => handleInputChange('passport', 'unit_code', e.target.value)}
                            disabled={!isEditing}
                        />
                    </div>
                </div>
                <div className="documents-form-group">
                    <label>Фамилия:</label>
                    <input
                        type="text"
                        value={formData.passport?.last_name}
                        onChange={(e) => handleInputChange('passport', 'last_name', e.target.value)}
                        disabled={!isEditing}
                    />
                </div>
                <div className="documents-form-group">
                    <label>Имя:</label>
                    <input
                        type="text"
                        value={formData.passport?.first_name}
                        onChange={(e) => handleInputChange('passport', 'first_name', e.target.value)}
                        disabled={!isEditing}
                    />
                </div>
                <div className="documents-form-group">
                    <label>Отчество:</label>
                    <input
                        type="text"
                        value={formData.passport?.patronymic}
                        onChange={(e) => handleInputChange('passport', 'patronymic', e.target.value)}
                        disabled={!isEditing}
                    />
                </div>
                <div className="row-groups-wrapper">
                    <div className="documents-form-group row-form-group">
                        <label>Пол:</label>
                        {isEditing ? (
                            <CustomSelect
                                className={"gender-select"}
                                value={formData.passport?.gender}
                                options={genderOptions}
                                onChange={(option) => handleInputChange('passport', 'gender', option.label)}
                                placeholder={'Пол'}
                            />
                        ) : (
                            <span className={"gender-select-placeholder"}>
                                {formData.passport?.gender}
                            </span>
                        )}

                    </div>
                    <div className="documents-form-group row-form-group">
                        <label>Дата рождения:</label>
                        <input
                            type="date"
                            value={formData.passport?.birth_date}
                            onChange={(e) => handleInputChange('passport', 'birth_date', e.target.value)}
                            disabled={!isEditing}
                        />
                    </div>
                </div>
                <div className="documents-form-group">
                    <label>Место рождения:</label>
                    <input
                        type="text"
                        value={formData.passport?.birth_place}
                        onChange={(e) => handleInputChange('passport', 'birth_place', e.target.value)}
                        disabled={!isEditing}
                    />
                </div>
                {isEditing ? (
                    <>
                        <div className="file-upload">
                            {documents.passport.length < 3 && (
                                <label className="file-upload-label">
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => handleFileChange('passport', e)}
                                        hidden
                                        multiple
                                        ref={fileInputRefs.passport}
                                        key={`passport-input-${documents.passport.length}`}
                                    />
                                    <div className="upload-documents-btn">
                                        <img src={UploadIcon} alt="upload"/>
                                        {documents.passport.length > 0 ? 'Добавить еще файлы' : 'Загрузить сканы паспорта'}
                                    </div>
                                </label>
                            )}
                            <div className="files-info">
                                {documents.passport.map((file, index) => (
                                    <div key={index} className="file-item">
                                        {typeof file === 'string' ? (
                                            <Link to={file} target="_blank">
                                                Просмотреть файл {file.split('/').at(-1)}
                                            </Link>
                                        ) : (
                                            <span>{file.name}</span>
                                        )}
                                        <button
                                            className="delete-file-btn"
                                            onClick={() => handleRemoveFile('passport', index)}
                                        >
                                            <img src={DeleteIcon} alt="Удалить"/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="file-upload-note">Можно загрузить до 3 файлов (развороты с фото и пропиской)</div>
                        </div>
                        <button
                            className="save-documents-btn"
                            onClick={() => handleSubmit('passport')}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Сохранение...' : 'Сохранить паспортные данные'}
                        </button>
                    </>
                ) : null}
            </div>
        )
    );

    const renderOmsForm = () => (
        Object.keys(formData.oms).length > 0 && isPreviewOms ? (
            <div className="document-preview">
                <div className="preview-header">
                    <h3>Полис ОМС</h3>
                    <button
                        className="edit-preview-btn"
                        onClick={() => setIsPreviewOms(false)}
                    >
                        Детали
                    </button>
                </div>

                <div className="preview-card">
                    <div className={"preview-info-section"}>
                        <div className="preview-col">
                            <span className="passport-series-number-preview">
                                {formData.oms.number}
                            </span>
                        </div>

                        <div className="preview-col">
                            <span className="preview-label">ФИО</span>
                            <span className="preview-value">
                            {formData.oms.last_name} {formData.oms.first_name} {formData.oms.patronymic}
                        </span>
                        </div>

                        <div className={"preview-row"}>
                            <div className="preview-col">
                                <span className="preview-label">Пол</span>
                                <span className="preview-value">
                                {formData.oms.gender}
                            </span>
                            </div>
                            <div className="preview-col">
                                <span className="preview-label">Дата рождения</span>
                                <span className="preview-value">
                                {new Date(formData.oms.birth_date).toLocaleDateString()}
                            </span>
                            </div>
                        </div>

                        <div className="preview-col">
                            <span className="preview-label">Страховая компания</span>
                            <span className="preview-value">
                            {formData.oms.insurance_company}
                        </span>
                        </div>

                        <div className="preview-col">
                            <span className="preview-label">Регион страхования</span>
                            <span className="preview-value">
                            {formData.oms.insurance_region}
                        </span>
                        </div>
                    </div>

                    <div className={"preview-img-section"}>
                        <img src={GerbIcon || ''} alt={"gerb"}/>
                    </div>
                </div>
                {documents.oms.length > 0 && (
                    <div className="preview-files">
                        <span className="preview-label">Прикрепленные файлы:</span>
                        <div className="file-previews">
                            {documents.oms.map((file, index) => (
                                <div key={index} className="file-preview-item">
                                    {typeof file === 'string' ? (
                                        <Link to={file} target={"_blank"}>
                                            Файл {file.split('/').at(-1)}
                                        </Link>
                                    ) : (
                                        <span>Файл {index + 1}: {file.name}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        ) : (
            <div className="document-form">
                <div className={"document-form-header"}>
                    <div className={"edit-document-wrapper"}>
                        <h3>Полис ОМС</h3>
                        <button
                            className={"edit-preview-btn"}
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? (
                                <img src={CancelIcon || ''} alt={'cancel'}/>
                            ) : (
                                <img src={EditIcon || ''} alt={'edit'}/>
                            )}

                        </button>
                    </div>
                    { Object.keys(formData.oms).length > 0 ? (
                        <button
                            className="edit-preview-btn"
                            onClick={() => setIsPreviewOms(true)}
                        >
                            Предпросмотр
                        </button>
                    ) : null}
                </div>
                <div className="documents-form-group">
                    <label>Номер полиса:</label>
                    <input
                        type="text"
                        value={formData.oms?.number}
                        onChange={(e) => handleInputChange('oms', 'number', e.target.value)}
                        placeholder="1234567890123456"
                        disabled={!isEditing}
                    />
                </div>
                <div className="row-groups-wrapper">
                    <div className="documents-form-group row-form-group">
                        <label>Фамилия:</label>
                        <input
                            type="text"
                            value={formData.oms?.last_name}
                            onChange={(e) => handleInputChange('oms', 'last_name', e.target.value)}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="documents-form-group row-form-group">
                        <label>Имя:</label>
                        <input
                            type="text"
                            value={formData.oms?.first_name}
                            onChange={(e) => handleInputChange('oms', 'first_name', e.target.value)}
                            disabled={!isEditing}
                        />
                    </div>
                </div>
                <div className="documents-form-group">
                    <label>Отчество:</label>
                    <input
                        type="text"
                        value={formData.oms?.patronymic}
                        onChange={(e) => handleInputChange('oms', 'patronymic', e.target.value)}
                        disabled={!isEditing}
                    />
                </div>
                <div className="row-groups-wrapper">
                    <div className="documents-form-group row-form-group">
                        <label>Пол:</label>
                        {isEditing ? (
                            <CustomSelect
                                className={"gender-select"}
                                value={formData.oms?.gender}
                                options={genderOptions}
                                onChange={(option) => handleInputChange('oms', 'gender', option.label)}
                                placeholder={'Пол'}
                            />
                        ) : (
                            <span className={"gender-select-placeholder"}>
                                {formData.oms?.gender}
                            </span>
                        )}
                    </div>
                    <div className="documents-form-group row-form-group">
                        <label>Дата рождения:</label>
                        <input
                            type="date"
                            value={formData.oms?.birth_date?.slice(0, 10)}
                            onChange={(e) => handleInputChange('oms', 'birth_date', e.target.value)}
                            disabled={!isEditing}
                        />
                    </div>
                </div>
                <div className="documents-form-group">
                    <label>Страховая компания:</label>
                    <input
                        type="text"
                        value={formData.oms?.insurance_company}
                        onChange={(e) => handleInputChange('oms', 'insurance_company', e.target.value)}
                        placeholder="Название страховой компании"
                        disabled={!isEditing}
                    />
                </div>
                <div className="documents-form-group">
                    <label>Регион страхования:</label>
                    <input
                        type="text"
                        value={formData.oms?.insurance_region}
                        onChange={(e) => handleInputChange('oms', 'insurance_region', e.target.value)}
                        placeholder="Регион страхования"
                        disabled={!isEditing}
                    />
                </div>
                {isEditing ? (
                    <>
                        <div className="file-upload">
                            {documents.oms.length < 3 && (
                                <label className="file-upload-label">
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => handleFileChange('oms', e)}
                                        hidden
                                        multiple
                                        ref={fileInputRefs.oms}
                                        key={`oms-input-${documents.oms.length}`}
                                    />
                                    <div className="upload-documents-btn">
                                        <img src={UploadIcon} alt="upload"/>
                                        {documents.oms.length > 0 ? 'Добавить еще файлы' : 'Загрузить сканы полиса'}
                                    </div>
                                </label>
                            )}
                            <div className="files-info">
                                {documents.oms.map((file, index) => (
                                    <div key={index} className="file-item">
                                        {typeof file === 'string' ? (
                                            <a href={file} target="_blank" rel="noopener noreferrer">
                                                Просмотреть файл {file.split('/').at(-1)}
                                            </a>
                                        ) : (
                                            <span>{file.name}</span>
                                        )}
                                        <button
                                            className="delete-file-btn"
                                            onClick={() => handleRemoveFile('oms', index)}
                                        >
                                            <img src={DeleteIcon} alt="Удалить"/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="file-upload-note">Можно загрузить до 3 файлов (лицевая и обратная сторона)</div>
                        </div>
                        <button
                            className="save-documents-btn"
                            onClick={() => handleSubmit('oms')}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Сохранение...' : 'Сохранить данные полиса'}
                        </button>
                    </>
                ) : null}
            </div>
        )
    );

    const renderSnilsForm = () => (
        Object.keys(formData.snils).length && isPreviewSnils ? (
            <div className="document-preview">
                <div className="preview-header">
                    <h3>СНИЛС</h3>
                    <button
                        className="edit-preview-btn"
                        onClick={() => setIsPreviewSnils(false)}
                    >
                        Детали
                    </button>
                </div>

                <div className="preview-card">
                    <div className={"preview-info-section"}>
                        <div className="preview-col">
                            <span className="passport-series-number-preview">
                            {formData.snils.number}
                        </span>
                        </div>

                        <div className="preview-col">
                            <span className="preview-label">ФИО</span>
                            <span className="preview-value">
                            {formData.snils.last_name} {formData.snils.first_name} {formData.snils.patronymic}
                        </span>
                        </div>

                        <div className={"preview-row"}>
                            <div className="preview-col">
                                <span className="preview-label">Пол</span>
                                <span className="preview-value">
                                {formData.snils.gender}
                            </span>
                            </div>
                            <div className="preview-col">
                                <span className="preview-label">Дата рождения</span>
                                <span className="preview-value">
                                {new Date(formData.snils.birth_date).toLocaleDateString()}
                            </span>
                            </div>
                        </div>
                    </div>

                    <div className={"preview-img-section"}>
                        <img src={GerbIcon || ''} alt={"gerb"}/>
                    </div>
                </div>
                {documents.snils.length > 0 && (
                    <div className="preview-files">
                        <span className="preview-label">Прикрепленные файлы:</span>
                        <div className="file-previews">
                            {documents.snils.map((file, index) => (
                                <div key={index} className="file-preview-item">
                                    {typeof file === 'string' ? (
                                        <Link to={file} target={"_blank"}>
                                            Файл {file.split('/').at(-1)}
                                        </Link>
                                    ) : (
                                        <span>Файл {index + 1}: {file.name}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        ) : (
            <div className="document-form">
                <div className={"document-form-header"}>
                    <div className={"edit-document-wrapper"}>
                        <h3>СНИЛС</h3>
                        <button
                            className={"edit-preview-btn"}
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? (
                                <img src={CancelIcon || ''} alt={'cancel'}/>
                            ) : (
                                <img src={EditIcon || ''} alt={'edit'}/>
                            )}
                        </button>
                    </div>
                    { Object.keys(formData.snils).length > 0 ? (
                        <button
                            className="edit-preview-btn"
                            onClick={() => setIsPreviewSnils(true)}
                        >
                            Предпросмотр
                        </button>
                    ) : null}
                </div>
                <div className="documents-form-group">
                    <label>Номер СНИЛС:</label>
                    <input
                        type="text"
                        value={formData.snils?.number}
                        onChange={(e) => handleInputChange('snils', 'number', e.target.value)}
                        placeholder="123-456-789 01"
                        disabled={!isEditing}
                    />
                </div>
                <div className="row-groups-wrapper">
                    <div className="documents-form-group row-form-group">
                        <label>Фамилия:</label>
                        <input
                            type="text"
                            value={formData.snils?.last_name}
                            onChange={(e) => handleInputChange('snils', 'last_name', e.target.value)}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="documents-form-group row-form-group">
                        <label>Имя:</label>
                        <input
                            type="text"
                            value={formData.snils?.first_name}
                            onChange={(e) => handleInputChange('snils', 'first_name', e.target.value)}
                            disabled={!isEditing}
                        />
                    </div>
                </div>

                <div className="documents-form-group">
                    <label>Отчество:</label>
                    <input
                        type="text"
                        value={formData.snils?.patronymic}
                        onChange={(e) => handleInputChange('snils', 'patronymic', e.target.value)}
                        disabled={!isEditing}
                    />
                </div>
                <div className="row-groups-wrapper">
                    <div className="documents-form-group row-form-group">
                        <label>Пол:</label>
                        {isEditing ? (
                            <CustomSelect
                                className={"gender-select"}
                                value={formData.snils?.gender}
                                options={genderOptions}
                                onChange={(option) => handleInputChange('snils', 'gender', option.label)}
                                placeholder={'Пол'}
                            />
                        ) : (
                            <span className={"gender-select-placeholder"}>
                            {formData.snils?.gender}
                        </span>
                        )}
                    </div>
                    <div className="documents-form-group row-form-group">
                        <label>Дата рождения:</label>
                        <input
                            type="date"
                            value={formData.snils?.birth_date?.slice(0, 10)}
                            onChange={(e) => handleInputChange('snils', 'birth_date', e.target.value)}
                            disabled={!isEditing}
                        />
                    </div>
                </div>
                {isEditing ? (
                    <>
                        <div className="file-upload">
                            {documents.snils.length < 2 && (
                                <label className="file-upload-label">
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => handleFileChange('snils', e)}
                                        hidden
                                        multiple
                                        ref={fileInputRefs.snils}
                                        key={`snils-input-${documents.snils.length}`}
                                    />
                                    <div className="upload-documents-btn">
                                        <img src={UploadIcon} alt="upload"/>
                                        {documents.snils.length > 0 ? 'Добавить еще файлы' : 'Загрузить скан СНИЛС'}
                                    </div>
                                </label>
                            )}
                            <div className="files-info">
                                {documents.snils.map((file, index) => (
                                    <div key={index} className="file-item">
                                        {typeof file === 'string' ? (
                                            <a href={file} target="_blank" rel="noopener noreferrer">
                                                Просмотреть файл {file.split('/').at(-1)}
                                            </a>
                                        ) : (
                                            <span>{file.name}</span>
                                        )}
                                        <button
                                            className="delete-file-btn"
                                            onClick={() => handleRemoveFile('snils', index)}
                                        >
                                            <img src={DeleteIcon} alt="Удалить"/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="file-upload-note">Можно загрузить до 2 файлов</div>
                        </div>
                        <button
                            className="save-documents-btn"
                            onClick={() => handleSubmit('snils')}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Сохранение...' : 'Сохранить данные СНИЛС'}
                        </button>
                    </>
                ) : null}
            </div>
        )
    );

    return (
        <div className="documents-container">
            <div className="documents-tabs">
                <button
                    className={activeTab === 'passport' ? 'active' : ''}
                    onClick={() => {
                        setIsPreviewPassport(Object.keys(formData.passport).length > 0)
                        setIsEditing(false)
                        setActiveTab('passport')
                    }}
                >
                    <img src={PassportIcon} alt="passport"/>
                    Паспорт
                </button>
                <button
                    className={activeTab === 'oms' ? 'active' : ''}
                    onClick={() => {
                        setIsPreviewOms(Object.keys(formData.passport).length > 0)
                        setIsEditing(false)
                        setActiveTab('oms')
                    }}
                >
                    <img src={OmsIcon} alt="oms"/>
                    Полис ОМС
                </button>
                <button
                    className={activeTab === 'snils' ? 'active' : ''}
                    onClick={() => {
                        setIsPreviewSnils(Object.keys(formData.passport).length > 0)
                        setIsEditing(false)
                        setActiveTab('snils')
                    }}
                >
                    <img src={SnilsIcon} alt="snils"/>
                    СНИЛС
                </button>
            </div>

            <div className="documents-content">
                {activeTab === 'passport' && renderPassportForm()}
                {activeTab === 'oms' && renderOmsForm()}
                {activeTab === 'snils' && renderSnilsForm()}
            </div>
        </div>
    );
};

export default DocumentsComponent;