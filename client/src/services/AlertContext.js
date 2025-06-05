import React, { createContext, useState, useContext } from "react";
import { AlertBox } from "../components/AlertBox";

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
    const [alert, setAlert] = useState({
        status: "",
        message: "",
        visible: false
    });

    const showAlert = (status, message) => {
        setAlert({ status, message, visible: true });
        setTimeout(() => {
            setAlert({status: "", message: "", visible: false});
        }, 3000);
    };

    return (
        <AlertContext.Provider value={{
            alert,
            showAlert,
        }}>
            {children}
            {alert.visible && <AlertBox status={alert.status} message={alert.message} />}
        </AlertContext.Provider>
    );
};