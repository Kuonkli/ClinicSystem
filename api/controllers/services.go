package controllers

import (
	"ClinicSystem/database"
	"ClinicSystem/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
)

func GetAllServices(c *gin.Context) {
	searchQuery := c.Query("search")
	sortOrder := c.Query("sort")

	var services []models.Service
	query := database.DB

	if searchQuery != "" {
		searchPattern := "%" + searchQuery + "%"
		query = query.Where("(name ILIKE '%' || ? || '%' OR SIMILARITY(name, ?) > 0.2) OR "+
			"(description ILIKE '%' || ? || '%' OR SIMILARITY(description, ?) > 0.2)",
			searchPattern, searchQuery, searchPattern, searchQuery)
	}

	switch sortOrder {
	case "cheap":
		query = query.Order("price DESC")
	case "expensive":
		query = query.Order("price ASC")
	case "newest":
		query = query.Order("create_at ASC")
	default:
		query = query.Order(gorm.Expr("SIMILARITY(name, ?) DESC", searchQuery))
	}

	err := query.Find(&services).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"services": services,
	})
}

func GetServiceById(c *gin.Context) {
	serviceId := c.Param("id")
	var service models.Service
	err := database.DB.Where("id = ?", serviceId).First(&service).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch service data"})
	}
	c.JSON(http.StatusOK, gin.H{
		"service": service,
	})
}

func GetDoctorsForService(c *gin.Context) {
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

	var results []Result

	subQuery := database.DB.Model(&models.Review{}).
		Select("doctor_id, AVG(rating) as avg_rating, COUNT(*) as count").
		Group("doctor_id")

	query := database.DB.Table("users AS u").
		Select("d.id, u.last_name, u.name, u.patronymic, u.photo_url, d.specialty, d.cabinet, d.experience, r.avg_rating, r.count").
		Joins("JOIN doctors AS d ON d.user_id = u.id").
		Joins("LEFT JOIN (?) AS r ON d.id = r.doctor_id", subQuery)

	serviceId := c.Param("service_id")
	err := query.Joins("JOIN doctor_services ON doctor_services.doctor_id = d.id").
		Where("doctor_services.service_id = ?", serviceId).
		Find(&results).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch doctor services"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"doctors": results,
	})
}
