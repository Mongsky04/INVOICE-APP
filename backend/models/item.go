package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Item struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;primary_key"`
	Code      string         `json:"code" gorm:"uniqueIndex;not null"`
	Name      string         `json:"name" gorm:"not null"`
	Unit      string         `json:"unit" gorm:"not null"`
	Price     float64        `json:"price" gorm:"not null"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

func (i *Item) BeforeCreate(tx *gorm.DB) error {
	i.ID = uuid.New()
	return nil
}
