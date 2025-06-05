import React, { useState, useRef, useEffect } from 'react';
import '../styles/CustomSelectStyles.css'

const CustomSelect = ({
                          options,
                          value,
                          onChange,
                          placeholder = "Выберите...",
                          className = ""
                      }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleOptionClick = (option) => {
        onChange(option);
        setIsOpen(false);
    };

    const selectedOption = options.find(opt => opt.value === value) || { label: placeholder };

    return (
        <div
            className={`custom-select ${className} ${isOpen ? 'open' : ''}`}
            ref={selectRef}
        >
            <div
                className="custom-select-header"
                onClick={() => setIsOpen(!isOpen)}
            >
        <span className="custom-select-current">
          {selectedOption.label}
        </span>
                <span className="custom-select-arrow">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
            </div>

            {isOpen && (
                <div className="custom-select-options">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`custom-select-option ${value === option.value ? 'selected' : ''}`}
                            onClick={() => handleOptionClick(option)}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;