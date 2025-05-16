package database

import (
	"ClinicSystem/models"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"log"
	"os"
)

var DB *gorm.DB

func InitDB() error {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Ошибка загрузки .env файла")
		return err
	}

	dsn := "host=" + os.Getenv("DB_HOST") +
		" user=" + os.Getenv("DB_USER") +
		" password=" + os.Getenv("DB_PASSWORD") +
		" dbname=" + os.Getenv("DB_NAME") +
		" port=" + os.Getenv("DB_PORT") +
		" sslmode=disable TimeZone=Europe/Moscow"

	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return err
	}

	DB.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")
	DB.Exec(`
        DO $$ BEGIN
            CREATE TYPE user_role AS ENUM ('patient', 'registrator', 'doctor', 'admin');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    `)

	err = DB.AutoMigrate(
		&models.User{},
		&models.Passport{},
		&models.OMSPolicy{},
		&models.SNILS{},
		&models.Doctor{},
		&models.Service{},
		&models.Appointment{},
		&models.MedicalRecord{},
		&models.Medication{},
		&models.MedicalRecordMedication{},
		&models.Review{},
	)
	return err
}
