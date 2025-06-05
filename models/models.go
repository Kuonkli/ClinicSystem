package models

import (
	"gorm.io/datatypes"
	"gorm.io/gorm"
	"time"
)

type User struct {
	gorm.Model
	Name       string `gorm:"size:255;not null" json:"name"`
	LastName   string `gorm:"size:255;not null" json:"last_name"`
	Patronymic string `gorm:"size:255;not null" json:"patronymic"`
	Email      string `gorm:"uniqueIndex;size:255" json:"email"`
	Phone      string `gorm:"uniqueIndex;size:20" json:"phone"`
	Password   string `gorm:"not null" json:"password"`
	Role       string `gorm:"size:255;not null;check:role IN ('patient', 'doctor', 'register');default:'patient'" json:"role"`
	Confirmed  bool   `gorm:"default:false" json:"confirmed"`
	PhotoURL   string `json:"photo_url"`

	Passport     *Passport
	OMSPolicy    *OMSPolicy
	SNILS        *SNILS
	Appointments []Appointment
}

type Passport struct {
	gorm.Model
	UserID     uint      `gorm:"uniqueIndex;not null" json:"user_id"`
	Series     string    `gorm:"size:4;not null" json:"series"`
	Number     string    `gorm:"size:6;not null" json:"number"`
	IssuedBy   string    `gorm:"not null" json:"issued_by"`
	IssuedDate time.Time `gorm:"not null" json:"issued_date"`
	UnitCode   string    `gorm:"size:10" json:"unit_code"`
	FirstName  string    `gorm:"size:255;not null" json:"first_name"`
	LastName   string    `gorm:"size:255;not null" json:"last_name"`
	Patronymic string    `gorm:"size:255;not null" json:"patronymic"`
	Gender     string    `gorm:"size:10;not null" json:"gender"`
	BirthDate  time.Time `gorm:"not null" json:"birth_date"`
	BirthPlace string    `gorm:"not null" json:"birth_place"`
	ScanURL    string    `gorm:"not null" json:"scan_url"`
	Verified   bool      `gorm:"default:false" json:"verified"`
}

type OMSPolicy struct {
	gorm.Model
	UserID           uint      `gorm:"uniqueIndex;not null" json:"user_id"`
	Number           string    `gorm:"size:16;uniqueIndex;not null" json:"number"`
	FirstName        string    `gorm:"size:255;not null" json:"first_name"`
	LastName         string    `gorm:"size:255;not null" json:"last_name"`
	Patronymic       string    `gorm:"size:255;not null" json:"patronymic"`
	Gender           string    `gorm:"size:10;not null" json:"gender"`
	BirthDate        time.Time `gorm:"not null" json:"birth_date"`
	InsuranceCompany string    `gorm:"not null" json:"insurance_company"`
	InsuranceRegion  string    `gorm:"size:255;not null" json:"insurance_region"`
	ScanURL          string    `gorm:"not null" json:"scan_url"`
	Verified         bool      `gorm:"default:false" json:"verified"`
}

type SNILS struct {
	gorm.Model
	UserID     uint      `gorm:"uniqueIndex;not null" json:"user_id"`
	Number     string    `gorm:"size:14;uniqueIndex;not null" json:"number"`
	FirstName  string    `gorm:"size:255;not null" json:"first_name"`
	LastName   string    `gorm:"size:255;not null" json:"last_name"`
	Patronymic string    `gorm:"size:255;not null" json:"patronymic"`
	Gender     string    `gorm:"size:10;not null" json:"gender"`
	BirthDate  time.Time `gorm:"not null" json:"birth_date"`
	ScanURL    string    `gorm:"not null" json:"scan_url"`
	Verified   bool      `gorm:"default:false" json:"verified"`
}

type Doctor struct {
	gorm.Model
	UserID      uint           `gorm:"uniqueIndex;not null" json:"user_id"`
	Specialty   string         `gorm:"not null" json:"specialty"`
	Experience  int            `gorm:"not null" json:"experience"`
	Cabinet     string         `gorm:"not null" json:"cabinet"`
	Schedule    datatypes.JSON `gorm:"type:jsonb" json:"schedule"`
	Description string         `json:"description"`
	Rating      float64        `gorm:"type:numeric(3,1);default:0.0" json:"rating"`

	User         *User `gorm:"foreignKey:UserID"`
	Appointments []Appointment
	Reviews      []Review
	Services     []Service `gorm:"many2many:doctor_services"`
}

type Service struct {
	gorm.Model
	Name        string  `gorm:"uniqueIndex;not null" json:"name"`
	Description string  `json:"description"`
	IsPaid      bool    `gorm:"default:false" json:"is_paid"`
	Price       float64 `gorm:"type:numeric(10,2)" json:"price"`
	Duration    int     `gorm:"not null" json:"duration"`

	Doctors []Doctor `gorm:"many2many:doctor_services"`
}

type Appointment struct {
	gorm.Model
	UserID          uint      `gorm:"index;not null" json:"user_id"`
	DoctorID        uint      `gorm:"index;not null" json:"doctor_id"`
	ServiceID       uint      `gorm:"index;not null" json:"service_id"`
	Status          string    `gorm:"type:varchar(20);default:'waiting'" json:"status"`
	AppointmentDate time.Time `gorm:"not null" json:"appointment_date"`
	StartTime       string    `gorm:"not null" json:"start_time"`
	EndTime         string    `gorm:"not null" json:"end_time"`
	Reason          string    `gorm:"type:text" json:"reason"`
	Notes           string    `json:"notes"`
	TicketURL       string    `gorm:"type:text" json:"ticket_url"`

	User          *User          `gorm:"foreignKey:UserID" json:"user"`
	Doctor        *Doctor        `gorm:"foreignKey:DoctorID" json:"doctor"`
	Service       *Service       `gorm:"foreignKey:ServiceID" json:"service"`
	MedicalRecord *MedicalRecord `json:"medical_record"`
}

type MedicalRecord struct {
	gorm.Model
	AppointmentID   uint   `gorm:"uniqueIndex;not null" json:"appointment_id"`
	Diagnosis       string `gorm:"not null" json:"diagnosis"`
	Recommendations string `json:"recommendations"`

	Medications []MedicalRecordMedication `gorm:"foreignKey:MedicalRecordID"`
}

type Medication struct {
	gorm.Model
	Name         string `gorm:"uniqueIndex;not null" json:"name"`
	Description  string `gorm:"type:text;not null" json:"description"`
	Manufacturer string `gorm:"type:text" json:"manufacturer"`
}

type MedicalRecordMedication struct {
	gorm.Model
	MedicalRecordID uint   `gorm:"primaryKey" json:"medical_record_id"`
	MedicationID    uint   `gorm:"primaryKey" json:"medication_id"`
	Dosage          string `gorm:"type:text;not null" json:"dosage"`
	Recommendations string `json:"recommendations"`
}

type Review struct {
	gorm.Model
	DoctorID uint    `gorm:"index;not null" json:"doctor_id"`
	UserID   uint    `gorm:"index;not null" json:"user_id"`
	Rating   float64 `gorm:"type:numeric(3,1);not null;check:rating >= 1.0 AND rating <= 5.0" json:"rating"`
	Comment  string  `json:"comment"`

	Doctor *Doctor `gorm:"foreignKey:DoctorID;constraint:OnDelete:CASCADE"`
	User   *User   `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}
