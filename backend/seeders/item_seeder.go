package seeders

import (
	"log"

	"github.com/Mongsky04/invoice-app/backend/models"
	"gorm.io/gorm"
)

func SeedItems(db *gorm.DB) {
	items := []models.Item{
		{Code: "BRG-001", Name: "BBM Solar", Unit: "liter", Price: 10000},
		{Code: "BRG-002", Name: "BBM Pertamax", Unit: "liter", Price: 14000},
		{Code: "BRG-003", Name: "Oli Mesin", Unit: "liter", Price: 85000},
		{Code: "BRG-004", Name: "Ban Truck", Unit: "pcs", Price: 1500000},
		{Code: "BRG-005", Name: "Jasa Service", Unit: "jam", Price: 150000},
		{Code: "BRG-006", Name: "Filter Oli", Unit: "pcs", Price: 75000},
		{Code: "BRG-007", Name: "Filter Udara", Unit: "pcs", Price: 120000},
		{Code: "BRG-008", Name: "Aki Truck", Unit: "pcs", Price: 800000},
	}

	for _, item := range items {
		var existing models.Item
		result := db.First(&existing, "code = ?", item.Code)
		if result.Error != nil {
			if err := db.Create(&item).Error; err != nil {
				log.Printf("Failed to seed item %s: %v", item.Code, err)
			}
		}
	}
	log.Println("Items seeded successfully")
}

func SeedUsers(db *gorm.DB) {
	users := []struct {
		Username string
		Password string
		Role     string
	}{
		{"admin", "admin123", "admin"},
		{"kerani", "kerani123", "kerani"},
	}

	for _, u := range users {
		var existing models.User
		result := db.First(&existing, "username = ?", u.Username)
		if result.Error != nil {
			user := models.User{
				Username: u.Username,
				Role:     u.Role,
			}
			if err := user.HashPassword(u.Password); err != nil {
				log.Printf("Failed to hash password for %s: %v", u.Username, err)
				continue
			}
			if err := db.Create(&user).Error; err != nil {
				log.Printf("Failed to seed user %s: %v", u.Username, err)
			}
		}
	}
	log.Println("Users seeded successfully")
}
