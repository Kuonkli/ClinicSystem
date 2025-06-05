package controllers

import (
	"ClinicSystem/database"
	"ClinicSystem/models"
	"errors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"strconv"
)

func AddReview(c *gin.Context) {
	userId, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	doctorId, err := strconv.ParseUint(c.Param("doctor_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid doctorId"})
		return
	}

	var doctor models.Doctor
	if err := database.DB.First(&doctor, doctorId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "doctor not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch doctor"})
		}
		return
	}

	var existingReview models.Review
	if err := database.DB.
		Where("user_id = ? AND doctor_id = ?", userId, doctorId).
		First(&existingReview).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "you have already reviewed this doctor"})
		return
	}

	var reviewRequest struct {
		Rating  float64 `json:"rating" binding:"required,min=1,max=5"`
		Comment string  `json:"comment"`
	}

	if err := c.ShouldBindJSON(&reviewRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	newReview := models.Review{
		UserID:   userId.(uint),
		DoctorID: uint(doctorId),
		Rating:   reviewRequest.Rating,
		Comment:  reviewRequest.Comment,
	}

	if err := database.DB.Create(&newReview).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create review"})
		return
	}

	var avgRating struct {
		Avg float64
	}
	if err := database.DB.Model(&models.Review{}).
		Select("AVG(rating) as avg").
		Where("doctor_id = ?", doctorId).
		Scan(&avgRating).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update doctor rating"})
		return
	}

	if err := database.DB.Model(&models.Doctor{}).
		Where("id = ?", doctorId).
		Update("rating", avgRating.Avg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update doctor rating"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Review added successfully",
		"review":  newReview,
	})
}

func UpdateReview(c *gin.Context) {
	userId, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	reviewId, err := strconv.ParseUint(c.Param("review_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid review ID"})
		return
	}

	var reviewRequest struct {
		Rating  float64 `json:"rating" binding:"required,min=1,max=5"`
		Comment string  `json:"comment"`
	}

	if err := c.ShouldBindJSON(&reviewRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var existingReview models.Review
	if err := database.DB.Where("id = ? AND user_id = ?", reviewId, userId).First(&existingReview).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "review not found or you don't have permission"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch review"})
		}
		return
	}

	updates := models.Review{
		Rating:  reviewRequest.Rating,
		Comment: reviewRequest.Comment,
	}

	if err := database.DB.Model(&models.Review{}).Where("id = ?", reviewId).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update review"})
		return
	}

	if err := updateDoctorRating(existingReview.DoctorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update doctor rating"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Review updated successfully",
		"review":  existingReview,
	})
}

func DeleteReview(c *gin.Context) {
	userId, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	reviewId, err := strconv.ParseUint(c.Param("review_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid review ID"})
		return
	}

	var existingReview models.Review
	if err := database.DB.Where("id = ? AND user_id = ?", reviewId, userId).First(&existingReview).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "review not found or you don't have permission"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch review"})
		}
		return
	}

	doctorId := existingReview.DoctorID

	if err := database.DB.Delete(&existingReview).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete review"})
		return
	}

	if err := updateDoctorRating(doctorId); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update doctor rating"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Review deleted successfully",
	})
}

func updateDoctorRating(doctorId uint) error {
	var avgRating struct {
		Avg float64
	}
	if err := database.DB.Model(&models.Review{}).
		Select("AVG(rating) as avg").
		Where("doctor_id = ?", doctorId).
		Scan(&avgRating).Error; err != nil {
		return err
	}

	if err := database.DB.Model(&models.Doctor{}).
		Where("id = ?", doctorId).
		Update("rating", avgRating.Avg).Error; err != nil {
		return err
	}

	return nil
}
