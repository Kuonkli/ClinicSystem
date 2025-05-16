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

	err := router.Run(s.Address)
	if err != nil {
		log.Fatal(err)
		return err
	}
	return nil
}
