package server

import (
	"ClinicSystem/api/controllers"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"log"
	"time"
)

type APIServer struct {
	Address string `json:"address"`
}

func (s *APIServer) Run() error {
	router := gin.Default()

	config := cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Authorization", "X-Refresh-Token", "Content-Type"},
		ExposeHeaders:    []string{"Authorization", "X-Refresh-Token"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}

	router.Use(cors.New(config))

	router.POST("/signup", controllers.SignUp)
	router.POST("/login", controllers.Login)
	router.POST("/refresh", controllers.RefreshToken)

	api := router.Group("/api", controllers.AuthMiddleware())
	{
		api.Static("/storage/images", "./storage/images")
		api.Static("/storage/documents", "./storage/documents")
		api.GET("/user", controllers.GetUser)

		api.GET("/appointments", controllers.GetUserAppointments)
		api.GET("/appointments/nearest", controllers.GetNearestAppointment)
		api.GET("/appointments/:id/ticket", controllers.GenerateAppointmentTicket)
		api.POST("/appointments/add", controllers.AddAppointment)
		api.PUT("/appointments/:id/cancel", controllers.CancelAppointment)

		api.GET("/doctors", controllers.GetAllDoctors)
		api.GET("/doctors/:id", controllers.GetDoctorById)
		api.GET("service/:service_id/doctors", controllers.GetDoctorsForService)
		api.GET("/doctors/:id/dates", controllers.GetDoctorAvailableDates)
		api.GET("/doctors/:id/slots", controllers.GetDoctorAvailableSlots)

		api.GET("/services", controllers.GetAllServices)
		api.GET("/services/:id", controllers.GetServiceById)
		api.GET("/doctor/:doctor_id/services", controllers.GetDoctorServices)

		api.POST("/reviews/add/:doctor_id", controllers.AddReview)
		api.PUT("/reviews/edit/:review_id", controllers.UpdateReview)
		api.DELETE("/reviews/delete/:review_id", controllers.DeleteReview)

		api.GET("/documents", controllers.GetUserDocuments)
		api.PUT("/documents/edit/passport", controllers.SavePassport)
		api.PUT("/documents/edit/oms", controllers.SaveOMSPolicy)
		api.PUT("/documents/edit/snils", controllers.SaveSNILS)

		api.POST("/logout", controllers.LogOut)
	}

	err := router.Run(s.Address)
	if err != nil {
		log.Fatal(err)
		return err
	}
	return nil
}
