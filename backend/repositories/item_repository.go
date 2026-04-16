package repositories

import (
	"github.com/Mongsky04/invoice-app/backend/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ItemRepository struct {
	db *gorm.DB
}

func NewItemRepository(db *gorm.DB) *ItemRepository {
	return &ItemRepository{db: db}
}

func (r *ItemRepository) FindAll() ([]models.Item, error) {
	var items []models.Item
	err := r.db.Find(&items).Error
	return items, err
}

func (r *ItemRepository) FindByCode(code string) ([]models.Item, error) {
	var items []models.Item
	err := r.db.Where("code ILIKE ?", "%"+code+"%").Find(&items).Error
	return items, err
}

func (r *ItemRepository) FindByID(id uuid.UUID) (*models.Item, error) {
	var item models.Item
	err := r.db.First(&item, "id = ?", id).Error
	return &item, err
}

func (r *ItemRepository) Create(item *models.Item) error {
	return r.db.Create(item).Error
}

func (r *ItemRepository) Update(item *models.Item) error {
	return r.db.Save(item).Error
}

func (r *ItemRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Item{}, "id = ?", id).Error
}
