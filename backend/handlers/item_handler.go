package handlers

import (
	"github.com/Mongsky04/invoice-app/backend/repositories"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type ItemHandler struct {
	itemRepo *repositories.ItemRepository
}

func NewItemHandler(itemRepo *repositories.ItemRepository) *ItemHandler {
	return &ItemHandler{itemRepo: itemRepo}
}

func (h *ItemHandler) GetAll(c *fiber.Ctx) error {
	code := c.Query("code")
	if code != "" {
		items, err := h.itemRepo.FindByCode(code)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(items)
	}

	items, err := h.itemRepo.FindAll()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(items)
}

func (h *ItemHandler) GetByID(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid id"})
	}

	item, err := h.itemRepo.FindByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "item not found"})
	}
	return c.JSON(item)
}
