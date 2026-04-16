package repositories

import (
	"github.com/Mongsky04/invoice-app/backend/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type InvoiceRepository struct {
	db *gorm.DB
}

func NewInvoiceRepository(db *gorm.DB) *InvoiceRepository {
	return &InvoiceRepository{db: db}
}

func (r *InvoiceRepository) FindAll() ([]models.Invoice, error) {
	var invoices []models.Invoice
	err := r.db.Preload("Details.Item").Preload("User").Find(&invoices).Error
	return invoices, err
}

func (r *InvoiceRepository) FindByID(id uuid.UUID) (*models.Invoice, error) {
	var invoice models.Invoice
	err := r.db.Preload("Details.Item").Preload("User").First(&invoice, "id = ?", id).Error
	return &invoice, err
}

func (r *InvoiceRepository) Create(invoice *models.Invoice) error {
	return r.db.Create(invoice).Error
}

func (r *InvoiceRepository) Update(invoice *models.Invoice) error {
	return r.db.Save(invoice).Error
}

func (r *InvoiceRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Invoice{}, "id = ?", id).Error
}

func (r *InvoiceRepository) FindByUserID(userID uuid.UUID) ([]models.Invoice, error) {
	var invoices []models.Invoice
	err := r.db.Preload("Details.Item").Where("created_by = ?", userID).Find(&invoices).Error
	return invoices, err
}
