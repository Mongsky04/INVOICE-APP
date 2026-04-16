package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type InvoiceDetail struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;primary_key"`
	InvoiceID uuid.UUID      `json:"invoice_id" gorm:"type:uuid;not null"`
	ItemID    uuid.UUID      `json:"item_id" gorm:"type:uuid;not null"`
	Item      Item           `json:"item,omitempty" gorm:"foreignKey:ItemID"`
	Quantity  int            `json:"quantity" gorm:"not null"`
	Price     float64        `json:"price" gorm:"not null"`
	Subtotal  float64        `json:"subtotal" gorm:"not null"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

func (d *InvoiceDetail) BeforeCreate(tx *gorm.DB) error {
	d.ID = uuid.New()
	return nil
}
