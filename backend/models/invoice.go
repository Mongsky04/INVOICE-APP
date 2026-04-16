package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Invoice struct {
	ID              uuid.UUID       `json:"id" gorm:"type:uuid;primary_key"`
	InvoiceNumber   string          `json:"invoice_number" gorm:"uniqueIndex;not null"`
	SenderName      string          `json:"sender_name" gorm:"not null"`
	SenderAddress   string          `json:"sender_address"`
	ReceiverName    string          `json:"receiver_name" gorm:"not null"`
	ReceiverAddress string          `json:"receiver_address"`
	TotalAmount     float64         `json:"total_amount" gorm:"default:0"`
	CreatedBy       uuid.UUID       `json:"created_by" gorm:"type:uuid"`
	User            User            `json:"user,omitempty" gorm:"foreignKey:CreatedBy"`
	Details         []InvoiceDetail `json:"details,omitempty" gorm:"foreignKey:InvoiceID"`
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`
	DeletedAt       gorm.DeletedAt  `json:"-" gorm:"index"`
}

func (i *Invoice) BeforeCreate(tx *gorm.DB) error {
	i.ID = uuid.New()
	return nil
}
