import './App.css';
import React from "react";
import HomePage from "./pages/HomePage";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import DashboardLayout from "./pages/DashboardLayout";
import {AlertProvider} from "./services/AlertContext";
import DoctorProfileComponent from "./pages/DoctorProfilePage";
import DoctorProfilePage from "./pages/DoctorProfilePage";
import NewAppointmentPage from "./pages/NewAppointmentPage";

function App() {
    return (
        <AlertProvider>
            <Router>
                <Routes>
                    <Route path={`/`} element={<HomePage />} />
                    <Route path={`/auth`} element={<AuthPage />} />
                    <Route path={`/dashboard`} element={<DashboardLayout />} />
                    <Route path={`/dashboard/:content`} element={<DashboardLayout />} />
                    <Route path={`/dashboard/doctors/:id`} element={<DoctorProfilePage />} />
                    <Route path={`/dashboard/appointments/new`} element={<NewAppointmentPage />} />
                </Routes>
            </Router>
        </AlertProvider>
    );
}

export default App;
