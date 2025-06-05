package controllers

import (
	"ClinicSystem/database"
	"ClinicSystem/models"
	"encoding/json"
	"errors"
	"github.com/gin-gonic/gin"
	"gorm.io/datatypes"
	"gorm.io/gorm"
	"net/http"
	"sort"
	"strings"
	"time"
)

func GetAllDoctors(c *gin.Context) {
	type Result struct {
		Id          uint    `gorm:"column:id" json:"id"`
		LastName    string  `gorm:"column:last_name" json:"last_name"`
		Name        string  `gorm:"column:name" json:"name"`
		Patronymic  string  `gorm:"column:patronymic" json:"patronymic"`
		Specialty   string  `gorm:"column:specialty" json:"specialty"`
		Cabinet     string  `gorm:"column:cabinet" json:"cabinet"`
		Experience  uint    `gorm:"column:experience" json:"experience"`
		AvgRating   float64 `gorm:"column:avg_rating" json:"avg_rating"`
		ReviewCount int     `gorm:"column:count" json:"review_count"`
		PhotoUrl    string  `gorm:"column:photo_url" json:"photo_url"`
	}
	searchQuery := c.Query("search")

	var results []Result

	subQuery := database.DB.Model(&models.Review{}).
		Select("doctor_id, AVG(rating) as avg_rating, COUNT(*) as count").
		Group("doctor_id")

	query := database.DB.Table("users AS u").
		Select("d.id, u.last_name, u.name, u.patronymic, u.photo_url, d.specialty, d.cabinet, d.experience, r.avg_rating, r.count").
		Joins("JOIN doctors AS d ON d.user_id = u.id").
		Joins("LEFT JOIN (?) AS r ON d.id = r.doctor_id", subQuery)

	if searchQuery != "" {
		searchPattern := "%" + searchQuery + "%"
		query = query.Where("(last_name ILIKE '%' || ? || '%' OR SIMILARITY(last_name, ?) > 0.2)",
			searchPattern, searchQuery).
			Or("(specialty ILIKE '%' || ? || '%' OR SIMILARITY(specialty, ?) > 0.2)",
				searchPattern, searchQuery).
			Order(gorm.Expr("SIMILARITY(specialty, ?) DESC", searchQuery))
	}

	err := query.Scan(&results).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch doctors"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"doctors": results})
}

func GetDoctorById(c *gin.Context) {
	userId, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	doctorId := c.Param("id")

	type DoctorResult struct {
		Id          uint           `gorm:"column:id" json:"id"`
		LastName    string         `gorm:"column:last_name" json:"last_name"`
		Name        string         `gorm:"column:name" json:"name"`
		Patronymic  string         `gorm:"column:patronymic" json:"patronymic"`
		Specialty   string         `gorm:"column:specialty" json:"specialty"`
		Cabinet     string         `gorm:"column:cabinet" json:"cabinet"`
		Experience  uint           `gorm:"column:experience" json:"experience"`
		AvgRating   float64        `gorm:"column:avg_rating" json:"avg_rating"`
		ReviewCount int            `gorm:"column:count" json:"review_count"`
		PhotoUrl    string         `gorm:"column:photo_url" json:"photo_url"`
		Description string         `json:"description"`
		Schedule    datatypes.JSON `json:"schedule"`
	}

	var doctorResult DoctorResult
	subQuery := database.DB.Model(&models.Review{}).
		Select("doctor_id, AVG(rating) as avg_rating, COUNT(*) as count").
		Group("doctor_id")

	err := database.DB.Table("users AS u").
		Select("d.id, u.last_name, u.name, u.patronymic, u.photo_url, d.specialty, d.cabinet, d.experience, d.description, d.schedule, r.avg_rating, r.count").
		Joins("JOIN doctors AS d ON d.user_id = u.id").
		Joins("LEFT JOIN (?) AS r ON d.id = r.doctor_id", subQuery).
		Where("d.id = ?", doctorId).
		First(&doctorResult).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "doctor not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch doctor"})
		}
		return
	}

	var services []models.Service
	err = database.DB.
		Joins("JOIN doctor_services ON doctor_services.service_id = services.id").
		Where("doctor_services.doctor_id = ?", doctorId).
		Find(&services).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch doctor services"})
		return
	}

	var reviews []models.Review
	err = database.DB.Model(&models.Review{}).
		Preload("User").
		Where("reviews.doctor_id = ?", doctorId).
		Order("reviews.created_at DESC").
		Find(&reviews).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch reviews"})
		return
	}

	var userReview *models.Review
	err = database.DB.Model(&models.Review{}).
		Preload("User").
		Where("user_id = ? AND doctor_id = ?", userId, doctorId).
		First(&userReview).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			userReview = nil
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch reviews"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"doctor":      doctorResult,
		"reviews":     reviews,
		"user_review": userReview,
		"services":    services,
	})
}

func GetDoctorServices(c *gin.Context) {
	doctorId := c.Param("doctor_id")
	var services []models.Service
	err := database.DB.
		Joins("JOIN doctor_services ON doctor_services.service_id = services.id").
		Where("doctor_services.doctor_id = ?", doctorId).
		Find(&services).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch doctor services"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"services": services,
	})
}

type Schedule struct {
	Mon string `json:"Mon"`
	Tue string `json:"Tue"`
	Wed string `json:"Wed"`
	Thu string `json:"Thu"`
	Fri string `json:"Fri"`
	Sat string `json:"Sat"`
	Sun string `json:"Sun"`
}

type TimeSlot struct {
	Start time.Time
	End   time.Time
}

func GetDoctorAvailableDates(c *gin.Context) {
	doctorID := c.Param("id")
	serviceID := c.Query("service_id")

	var doctor models.Doctor
	if err := database.DB.Preload("Services", "id = ?", serviceID).First(&doctor, doctorID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Doctor or service not found"})
		return
	}

	var service models.Service
	if err := database.DB.First(&service, serviceID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Service not found"})
		return
	}

	var schedule Schedule
	if err := json.Unmarshal(doctor.Schedule, &schedule); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse doctor schedule"})
		return
	}

	// Генерируем доступные даты на основе расписания (на 2 недели вперед)
	availableDates := generateAvailableDates(schedule, service.Duration)

	c.JSON(http.StatusOK, gin.H{"available_dates": availableDates})
}

func generateAvailableDates(schedule Schedule, duration int) []string {
	var dates []string
	now := time.Now()

	for i := 0; i < 30; i++ { // 2 недели вперед
		date := now.AddDate(0, 0, i)
		weekday := date.Weekday().String()[:3]

		workingHours := getWorkingHours(schedule, weekday)
		if workingHours != "" {
			dates = append(dates, date.Format("2006-01-02"))
		}
	}

	return dates
}

func getWorkingHours(schedule Schedule, weekday string) string {
	switch weekday {
	case "Mon":
		return schedule.Mon
	case "Tue":
		return schedule.Tue
	case "Wed":
		return schedule.Wed
	case "Thu":
		return schedule.Thu
	case "Fri":
		return schedule.Fri
	case "Sat":
		return schedule.Sat
	case "Sun":
		return schedule.Sun
	default:
		return ""
	}
}

func GetDoctorAvailableSlots(c *gin.Context) {
	doctorID := c.Param("id")
	serviceID := c.Query("service_id")
	dateStr := c.Query("date")

	// Проверяем параметры
	if doctorID == "" || serviceID == "" || dateStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "doctor_id, service_id and date are required"})
		return
	}

	var doctor models.Doctor
	if err := database.DB.First(&doctor, doctorID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Doctor not found"})
		return
	}

	var service models.Service
	if err := database.DB.First(&service, serviceID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Service not found"})
		return
	}

	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
		return
	}

	var schedule Schedule
	if err := json.Unmarshal(doctor.Schedule, &schedule); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse doctor schedule"})
		return
	}

	weekday := date.Weekday().String()[:3]
	workingHours := getWorkingHours(schedule, weekday)
	if workingHours == "" {
		c.JSON(http.StatusOK, gin.H{"available_slots": []string{}})
		return
	}

	var appointments []models.Appointment
	if err := database.DB.
		Where("doctor_id = ? AND DATE(appointment_date) = ? AND status NOT IN ('cancelled', 'completed')",
			doctorID, dateStr).
		Select("start_time, end_time").
		Find(&appointments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch appointments"})
		return
	}

	availableSlots := generateAvailableSlots(workingHours, service.Duration, appointments)

	c.JSON(http.StatusOK, gin.H{"available_slots": availableSlots})
}

func generateAvailableSlots(workingHours string, duration int, appointments []models.Appointment) []string {
	parts := strings.Split(workingHours, "-")
	if len(parts) != 2 {
		return []string{}
	}

	startTime, _ := time.Parse("15:04", parts[0])
	endTime, _ := time.Parse("15:04", parts[1])

	// Создаем список занятых интервалов
	bookedIntervals := make([]TimeSlot, 0)
	for _, app := range appointments {
		appStart, _ := time.Parse("15:04", app.StartTime)
		appEnd, _ := time.Parse("15:04", app.EndTime)
		bookedIntervals = append(bookedIntervals, TimeSlot{Start: appStart, End: appEnd})
	}

	// Сортируем занятые интервалы по времени начала
	sort.Slice(bookedIntervals, func(i, j int) bool {
		return bookedIntervals[i].Start.Before(bookedIntervals[j].Start)
	})

	var availableSlots []string
	currentTime := startTime

	for currentTime.Add(time.Minute*time.Duration(duration)).Before(endTime) ||
		currentTime.Add(time.Minute*time.Duration(duration)).Equal(endTime) {

		slotEnd := currentTime.Add(time.Minute * time.Duration(duration))
		isAvailable := true

		// Проверяем пересечение с каждым занятым интервалом
		for _, booked := range bookedIntervals {
			if currentTime.Before(booked.End) && slotEnd.After(booked.Start) {
				isAvailable = false
				// Перемещаем currentTime на конец занятого слота
				if booked.End.After(currentTime) {
					currentTime = booked.End
				}
				break
			}
		}

		if isAvailable {
			availableSlots = append(availableSlots, currentTime.Format("15:04"))
			currentTime = currentTime.Add(time.Minute * time.Duration(duration))
		}
	}

	return availableSlots
}
