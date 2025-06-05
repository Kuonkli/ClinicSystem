package controllers

import (
	"ClinicSystem/database"
	"ClinicSystem/models"
	"bytes"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

func GetUserDocuments(c *gin.Context) {
	userId, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var user models.User
	if err := database.DB.Model(&models.User{}).
		Preload("Passport").
		Preload("OMSPolicy").
		Preload("SNILS").
		Where("id = ?", userId).
		First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"message": "user not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch user passports"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"passport": user.Passport,
		"oms":      user.OMSPolicy,
		"snils":    user.SNILS,
	})
}

func SavePassport(c *gin.Context) {
	userId, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var input struct {
		Series     string `form:"series" binding:"required"`
		Number     string `form:"number" binding:"required"`
		IssuedBy   string `form:"issued_by" binding:"required"`
		IssuedDate string `form:"issued_date" binding:"required"`
		UnitCode   string `form:"unit_code"`
		LastName   string `form:"last_name" binding:"required"`
		FirstName  string `form:"first_name" binding:"required"`
		Patronymic string `form:"patronymic" binding:"required"`
		Gender     string `form:"gender" binding:"required"`
		BirthDate  string `form:"birth_date" binding:"required"`
		BirthPlace string `form:"birth_place" binding:"required"`
	}

	if err := c.ShouldBind(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		log.Println(err.Error())
		return
	}

	issuedDate, err := time.Parse(time.RFC3339, input.IssuedDate)
	if err != nil {
		issuedDate, err = time.Parse("2006-01-02", input.IssuedDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неправильный формат даты выдачи документа"})
			log.Println(err.Error())
			return
		}
	}

	birthDate, err := time.Parse(time.RFC3339, input.BirthDate)
	if err != nil {
		birthDate, err = time.Parse("2006-01-02", input.BirthDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неправильный формат даты рождения"})
			log.Println(err.Error())
			return
		}
	}

	scanURL, err := saveUploadedFiles(c, "passport", userId.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save files"})
		return
	}

	var passport models.Passport
	result := database.DB.Where("user_id = ?", userId).First(&passport)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		passport = models.Passport{
			UserID:     userId.(uint),
			Series:     input.Series,
			Number:     input.Number,
			IssuedBy:   input.IssuedBy,
			IssuedDate: issuedDate,
			UnitCode:   input.UnitCode,
			LastName:   input.LastName,
			FirstName:  input.FirstName,
			Patronymic: input.Patronymic,
			Gender:     input.Gender,
			BirthDate:  birthDate,
			BirthPlace: input.BirthPlace,
			ScanURL:    scanURL,
		}

		if err := database.DB.Create(&passport).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create passport"})
			return
		}
	} else {
		passport.Series = input.Series
		passport.Number = input.Number
		passport.IssuedBy = input.IssuedBy
		passport.IssuedDate = issuedDate
		passport.UnitCode = input.UnitCode
		passport.LastName = input.LastName
		passport.FirstName = input.FirstName
		passport.Patronymic = input.Patronymic
		passport.Gender = input.Gender
		passport.BirthDate = birthDate
		passport.BirthPlace = input.BirthPlace
		if scanURL != "" {
			passport.ScanURL = scanURL
		}

		if err := database.DB.Save(&passport).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update passport"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "passport saved successfully",
		"passport": passport,
	})
}

// SaveOMSPolicy сохраняет/обновляет полис ОМС
func SaveOMSPolicy(c *gin.Context) {
	userId, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// Получаем данные из формы
	var input struct {
		Number           string `form:"number" binding:"required"`
		LastName         string `form:"last_name" binding:"required"`
		FirstName        string `form:"first_name" binding:"required"`
		Patronymic       string `form:"patronymic" binding:"required"`
		Gender           string `form:"gender" binding:"required"`
		BirthDate        string `form:"birth_date" binding:"required"`
		InsuranceCompany string `form:"insurance_company" binding:"required"`
		InsuranceRegion  string `form:"insurance_region" binding:"required"`
	}

	if err := c.ShouldBind(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	birthDate, err := time.Parse(time.RFC3339, input.BirthDate)
	if err != nil {
		birthDate, err = time.Parse("2006-01-02", input.BirthDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неправильный формат даты рождения"})
			log.Println(err.Error())
			return
		}
	}

	// Обработка файлов
	scanURL, err := saveUploadedFiles(c, "oms", userId.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save files"})
		return
	}

	// Проверяем существование полиса
	var omsPolicy models.OMSPolicy
	result := database.DB.Where("user_id = ?", userId).First(&omsPolicy)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// Создаем новый полис
		omsPolicy = models.OMSPolicy{
			UserID:           userId.(uint),
			Number:           input.Number,
			LastName:         input.LastName,
			FirstName:        input.FirstName,
			Patronymic:       input.Patronymic,
			Gender:           input.Gender,
			BirthDate:        birthDate,
			InsuranceCompany: input.InsuranceCompany,
			InsuranceRegion:  input.InsuranceRegion,
			ScanURL:          scanURL,
		}

		if err := database.DB.Create(&omsPolicy).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create OMS policy"})
			return
		}
	} else {
		// Обновляем существующий полис
		omsPolicy.Number = input.Number
		omsPolicy.LastName = input.LastName
		omsPolicy.FirstName = input.FirstName
		omsPolicy.Patronymic = input.Patronymic
		omsPolicy.Gender = input.Gender
		omsPolicy.BirthDate = birthDate
		omsPolicy.InsuranceCompany = input.InsuranceCompany
		omsPolicy.InsuranceRegion = input.InsuranceRegion
		if scanURL != "" {
			omsPolicy.ScanURL = scanURL
		}

		if err := database.DB.Save(&omsPolicy).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update OMS policy"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "OMS policy saved successfully",
		"oms_policy": omsPolicy,
	})
}

// SaveSNILS сохраняет/обновляет СНИЛС
func SaveSNILS(c *gin.Context) {
	userId, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// Получаем данные из формы
	var input struct {
		Number     string `form:"number" binding:"required"`
		LastName   string `form:"last_name" binding:"required"`
		FirstName  string `form:"first_name" binding:"required"`
		Patronymic string `form:"patronymic" binding:"required"`
		Gender     string `form:"gender" binding:"required"`
		BirthDate  string `form:"birth_date" binding:"required"`
	}

	if err := c.ShouldBind(&input); err != nil {
		log.Println("stop 1")
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	birthDate, err := time.Parse(time.RFC3339, input.BirthDate)
	if err != nil {
		birthDate, err = time.Parse("2006-01-02", input.BirthDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неправильный формат даты рождения"})
			log.Println(err.Error())
			return
		}
	}

	scanURL, err := saveUploadedFiles(c, "snils", userId.(uint))
	if err != nil {
		log.Println("stop 3")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save files"})
		return
	}

	// Проверяем существование СНИЛС
	var snils models.SNILS
	result := database.DB.Where("user_id = ?", userId).First(&snils)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// Создаем новый СНИЛС
		snils = models.SNILS{
			UserID:     userId.(uint),
			Number:     input.Number,
			LastName:   input.LastName,
			FirstName:  input.FirstName,
			Patronymic: input.Patronymic,
			Gender:     input.Gender,
			BirthDate:  birthDate,
			ScanURL:    scanURL,
		}

		if err := database.DB.Create(&snils).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create SNILS"})
			return
		}
	} else {
		// Обновляем существующий СНИЛС
		snils.Number = input.Number
		snils.LastName = input.LastName
		snils.FirstName = input.FirstName
		snils.Patronymic = input.Patronymic
		snils.Gender = input.Gender
		snils.BirthDate = birthDate
		if scanURL != "" {
			snils.ScanURL = scanURL
		}

		if err := database.DB.Save(&snils).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update SNILS"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "SNILS saved successfully",
		"snils":   snils,
	})
}

func saveUploadedFiles(c *gin.Context, documentType string, userId uint) (string, error) {
	form, err := c.MultipartForm()
	if err != nil {
		return "", err
	}

	files := form.File["files"]
	if len(files) == 0 {
		return "", nil
	}

	body := new(bytes.Buffer)
	writer := multipart.NewWriter(body)

	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			return "", err
		}
		defer file.Close()

		part, err := writer.CreateFormFile("files", fileHeader.Filename)
		if err != nil {
			return "", err
		}
		_, err = io.Copy(part, file)
		if err != nil {
			return "", err
		}
	}
	writer.Close()

	resp, err := http.Post("http://localhost:5000/api/merge", writer.FormDataContentType(), body)
	if err != nil {
		return "", fmt.Errorf("failed to call Python service: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("python service returned error: %s", resp.Status)
	}

	// Сохраняем объединенный PDF в storage/documents
	storageDir := filepath.Join("storage", "documents")
	if err := os.MkdirAll(storageDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create storage directory: %v", err)
	}

	mergedFilename := fmt.Sprintf("merged_%s_%d_%d.pdf", documentType, userId, time.Now().UnixNano())
	mergedPath := filepath.Join(storageDir, mergedFilename)

	outFile, err := os.Create(mergedPath)
	if err != nil {
		return "", fmt.Errorf("failed to create merged file: %v", err)
	}
	defer outFile.Close()

	if _, err := io.Copy(outFile, resp.Body); err != nil {
		return "", fmt.Errorf("failed to save merged file: %v", err)
	}

	return filepath.Join("storage", "documents", mergedFilename), nil
}
