package controllers

import (
	"ClinicSystem/database"
	"ClinicSystem/models"
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"gorm.io/gorm"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type CreateAppointmentRequest struct {
	DoctorID  uint   `json:"doctor_id" binding:"required"`
	ServiceID uint   `json:"service_id" binding:"required"`
	Date      string `json:"date" binding:"required"`
	Time      string `json:"time" binding:"required"`
	Reason    string `json:"reason"`
}

func AddAppointment(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req CreateAppointmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var doctor models.Doctor
	if err := database.DB.First(&doctor, req.DoctorID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Doctor not found"})
		return
	}

	var service models.Service
	if err := database.DB.First(&service, req.ServiceID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Service not found"})
		return
	}

	appointmentDate, err := time.Parse("2006-01-02 15:04", req.Date+" "+req.Time)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date or time format"})
		return
	}

	if appointmentDate.Before(time.Now()) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Appointment time cannot be in the past"})
		return
	}

	if !isTimeSlotAvailable(req.DoctorID, req.Date, req.Time, service.Duration) {
		c.JSON(http.StatusConflict, gin.H{"error": "Time slot is not available"})
		return
	}

	duration := time.Duration(service.Duration) * time.Minute
	endTime := appointmentDate.Add(duration)

	appointment := models.Appointment{
		UserID:          userID.(uint),
		DoctorID:        req.DoctorID,
		ServiceID:       req.ServiceID,
		Status:          "waiting",
		AppointmentDate: appointmentDate,
		StartTime:       req.Time,
		EndTime:         endTime.Format("15:04"),
		Reason:          req.Reason,
	}

	if err := database.DB.Create(&appointment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create appointment"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Appointment created successfully",
		"data":    appointment,
	})
}

func isTimeSlotAvailable(doctorID uint, date string, timeStr string, duration int) bool {
	startTime, err := time.Parse("15:04", timeStr)
	if err != nil {
		return false
	}

	endTime := startTime.Add(time.Minute * time.Duration(duration))

	var count int64
	err = database.DB.Model(&models.Appointment{}).
		Where("doctor_id = ? AND DATE(appointment_date) = ? AND status NOT IN ('cancelled', 'completed')", doctorID, date).
		Where("(start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?)",
			timeStr, timeStr,
			endTime.Format("15:04"), endTime.Format("15:04")).
		Count(&count).Error

	if err != nil || count > 0 {
		return false
	}

	return true
}

func GetNearestAppointment(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var appointment models.Appointment
	err := database.DB.
		Preload("Doctor.User").
		Preload("Service").
		Preload("MedicalRecord.Medications").
		Where("user_id = ? AND status = ?", userID, "confirmed").
		Order("appointment_date").
		First(&appointment).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusOK, gin.H{"message": "appointments with status confirmed not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch appointments"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"appointment": appointment})
}

func GetUserAppointments(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var appointments []models.Appointment
	err := database.DB.
		Preload("Doctor.User").
		Preload("Service").
		Preload("MedicalRecord.Medications").
		Where("user_id = ?", userID).
		Order("appointment_date").
		Find(&appointments).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch appointments"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"appointments": appointments})
}

func CancelAppointment(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	appointmentID := c.Param("id")

	var appointment models.Appointment
	err := database.DB.Where("id = ? AND user_id = ?", appointmentID, userID).First(&appointment).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch appointment"})
		}
		return
	}

	// Проверяем, что запись можно отменить (не раньше чем за 24 часа)
	if time.Until(appointment.AppointmentDate) < 24*time.Hour {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Appointment can only be cancelled at least 24 hours in advance"})
		return
	}

	appointment.Status = "cancelled"
	if err := database.DB.Save(&appointment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to cancel appointment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Appointment cancelled successfully"})
}

func RescheduleAppointment(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	appointmentID := c.Param("id")

	var req struct {
		Date string `json:"date" binding:"required"`
		Time string `json:"time" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var appointment models.Appointment
	err := database.DB.
		Preload("Doctor").
		Preload("Service").
		Where("id = ? AND user_id = ?", appointmentID, userID).
		First(&appointment).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch appointment"})
		}
		return
	}

	newDate, err := time.Parse("2006-01-02 15:04", req.Date+" "+req.Time)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date or time format"})
		return
	}

	if !isTimeSlotAvailable(appointment.DoctorID, req.Date, req.Time, appointment.Service.Duration) {
		c.JSON(http.StatusConflict, gin.H{"error": "Time slot is not available"})
		return
	}

	duration := time.Duration(appointment.Service.Duration) * time.Minute
	appointment.AppointmentDate = newDate
	appointment.StartTime = req.Time
	appointment.EndTime = newDate.Add(duration).Format("15:04")

	if err := database.DB.Save(&appointment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reschedule appointment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Appointment rescheduled successfully",
		"data":    appointment,
	})
}

func GenerateAppointmentTicket(c *gin.Context) {
	appointmentID := c.Param("id")
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var appointment models.Appointment
	if err := database.DB.
		Preload("Doctor.User").
		Preload("Service").
		Where("id = ? AND user_id = ? AND status = ?", appointmentID, userID, "confirmed").
		First(&appointment).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		return
	}

	ticketData := map[string]interface{}{
		"appointment": map[string]interface{}{
			"ID":               appointment.ID,
			"appointment_date": appointment.AppointmentDate.Format(time.RFC3339),
			"start_time":       appointment.StartTime,
		},
		"doctor": map[string]interface{}{
			"User": map[string]interface{}{
				"last_name":  appointment.Doctor.User.LastName,
				"name":       appointment.Doctor.User.Name,
				"patronymic": appointment.Doctor.User.Patronymic,
			},
			"specialty": appointment.Doctor.Specialty,
			"cabinet":   appointment.Doctor.Cabinet,
		},
		"service": map[string]interface{}{
			"name":  appointment.Service.Name,
			"price": appointment.Service.Price,
		},
	}

	jsonData, err := json.Marshal(ticketData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to prepare ticket data"})
		return
	}

	resp, err := http.Post(
		"http://localhost:5000/generate/ticket",
		"application/json",
		bytes.NewBuffer(jsonData),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate ticket"})
		return
	}
	defer resp.Body.Close()

	// Возвращаем файл клиенту
	extraHeaders := map[string]string{
		"Content-Disposition": fmt.Sprintf(`attachment; filename="ticket_%d.docx"`, appointment.ID),
	}

	c.DataFromReader(
		http.StatusOK,
		resp.ContentLength,
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		resp.Body,
		extraHeaders,
	)
}
