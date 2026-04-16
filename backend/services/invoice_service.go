package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/Mongsky04/invoice-app/backend/models"
	"github.com/Mongsky04/invoice-app/backend/repositories"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type InvoiceService struct {
	db          *gorm.DB
	invoiceRepo *repositories.InvoiceRepository
	itemRepo    *repositories.ItemRepository
}

func NewInvoiceService(db *gorm.DB, invoiceRepo *repositories.InvoiceRepository, itemRepo *repositories.ItemRepository) *InvoiceService {
	return &InvoiceService{
		db:          db,
		invoiceRepo: invoiceRepo,
		itemRepo:    itemRepo,
	}
}

type CreateInvoiceDetailReq struct {
	ItemID   uuid.UUID `json:"item_id"`
	Quantity int       `json:"quantity"`
}

type CreateInvoiceRequest struct {
	SenderName      string                   `json:"sender_name"`
	SenderAddress   string                   `json:"sender_address"`
	ReceiverName    string                   `json:"receiver_name"`
	ReceiverAddress string                   `json:"receiver_address"`
	Details         []CreateInvoiceDetailReq `json:"details"`
}

func (s *InvoiceService) GetAll() ([]models.Invoice, error) {
	return s.invoiceRepo.FindAll()
}

func (s *InvoiceService) GetByID(id uuid.UUID) (*models.Invoice, error) {
	return s.invoiceRepo.FindByID(id)
}

// Create uses db.Transaction() for ACID compliance and Zero-Trust price recalculation.
func (s *InvoiceService) Create(req CreateInvoiceRequest, userID uuid.UUID) (*models.Invoice, error) {
	var invoice models.Invoice

	err := s.db.Transaction(func(tx *gorm.DB) error {
		invoice = models.Invoice{
			SenderName:      req.SenderName,
			SenderAddress:   req.SenderAddress,
			ReceiverName:    req.ReceiverName,
			ReceiverAddress: req.ReceiverAddress,
			InvoiceNumber:   s.generateInvoiceNumber(),
			CreatedBy:       userID,
		}

		// (1) Insert Header
		if err := tx.Create(&invoice).Error; err != nil {
			return err
		}

		var grandTotal float64
		for _, d := range req.Details {
			// Zero-Trust: fetch real price from DB, never trust frontend payload
			var item models.Item
			if err := tx.First(&item, "id = ?", d.ItemID).Error; err != nil {
				return fmt.Errorf("item not found: %s", d.ItemID)
			}
			subtotal := item.Price * float64(d.Quantity)
			grandTotal += subtotal

			detail := models.InvoiceDetail{
				InvoiceID: invoice.ID,
				ItemID:    item.ID,
				Quantity:  d.Quantity,
				Price:     item.Price, // snapshot price at transaction time
				Subtotal:  subtotal,
			}
			// (2) Insert Detail
			if err := tx.Create(&detail).Error; err != nil {
				return err
			}
		}

		// Update total_amount with recalculated value
		if err := tx.Model(&invoice).Update("total_amount", grandTotal).Error; err != nil {
			return err
		}
		invoice.TotalAmount = grandTotal

		return nil
	})

	if err != nil {
		return nil, err
	}

	result, err := s.invoiceRepo.FindByID(invoice.ID)
	if err != nil {
		return nil, err
	}

	// Bonus: async webhook notification
	go s.sendWebhook(result)

	return result, nil
}

func (s *InvoiceService) Delete(id uuid.UUID) error {
	return s.invoiceRepo.Delete(id)
}

func (s *InvoiceService) generateInvoiceNumber() string {
	now := time.Now()
	return fmt.Sprintf("INV-%d%02d%02d-%d", now.Year(), now.Month(), now.Day(), now.UnixNano()%10000)
}

// sendWebhook sends invoice data to configured webhook URL asynchronously.
func (s *InvoiceService) sendWebhook(invoice *models.Invoice) {
	webhookURL := os.Getenv("WEBHOOK_URL")
	if webhookURL == "" {
		return
	}

	payload, err := json.Marshal(invoice)
	if err != nil {
		log.Printf("[Webhook] marshal error: %v", err)
		return
	}

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Post(webhookURL, "application/json", bytes.NewBuffer(payload))
	if err != nil {
		log.Printf("[Webhook] send error: %v", err)
		return
	}
	defer resp.Body.Close()
	log.Printf("[Webhook] sent invoice %s, status: %d", invoice.InvoiceNumber, resp.StatusCode)
}
