package main

import (
	"log"

	"github.com/Mongsky04/invoice-app/backend/config"
	"github.com/Mongsky04/invoice-app/backend/database"
	"github.com/Mongsky04/invoice-app/backend/handlers"
	"github.com/Mongsky04/invoice-app/backend/middleware"
	"github.com/Mongsky04/invoice-app/backend/repositories"
	"github.com/Mongsky04/invoice-app/backend/seeders"
	"github.com/Mongsky04/invoice-app/backend/services"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	cfg := config.Load()
	database.Connect(cfg)
	db := database.DB

	seeders.SeedUsers(db)
	seeders.SeedItems(db)

	itemRepo := repositories.NewItemRepository(db)
	invoiceRepo := repositories.NewInvoiceRepository(db)

	authService := services.NewAuthService(db, cfg)
	invoiceService := services.NewInvoiceService(db, invoiceRepo, itemRepo)

	authHandler := handlers.NewAuthHandler(authService)
	itemHandler := handlers.NewItemHandler(itemRepo)
	invoiceHandler := handlers.NewInvoiceHandler(invoiceService)

	app := fiber.New()
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	api := app.Group("/api")

	// Public endpoints
	api.Post("/login", authHandler.Login)
	api.Get("/items", itemHandler.GetAll)         // debounce endpoint, public
	api.Get("/items/:id", itemHandler.GetByID)

	// Protected endpoints
	protected := api.Group("", middleware.Protected(cfg.JWTSecret))
	protected.Get("/invoices", invoiceHandler.GetAll)
	protected.Get("/invoices/:id", invoiceHandler.GetByID)
	protected.Post("/invoices", invoiceHandler.Create)
	protected.Delete("/invoices/:id", invoiceHandler.Delete)

	log.Fatal(app.Listen(":8080"))
}
