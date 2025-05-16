package main

import (
	"ClinicSystem/api/server"
	"ClinicSystem/database"
	"log"
)

func main() {
	err := database.InitDB()
	if err != nil {
		log.Println(err.Error())
	}
	s := server.APIServer{Address: ":8080"}
	err = s.Run()
	if err != nil {
		panic(err)
	}
}
