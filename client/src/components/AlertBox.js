import ErrorIcon from "../assets/images/alert-error-icon.png";
import SuccessIcon from "../assets/images/alert-success-icon.png";
import "../styles/AlertBoxStyles.css"

export const AlertBox = ({ status, message }) => {
    const getStatusClass = () => {
        if (status >= 200 && status < 300) {
            return "alert-success";
        } else {
            return "alert-error";
        }
    };

    return (
        <div className={`alert-container ${getStatusClass()}`}>
            <span className="alert-message">{message}</span>
            {getStatusClass() === "alert-success" ? (
                <img src={SuccessIcon || ''} alt={"success"} />
            ) : (
                <img src={ErrorIcon || ''} alt={"error"} />
            )}
        </div>
    );
};