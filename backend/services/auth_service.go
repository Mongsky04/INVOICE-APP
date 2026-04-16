package services

import (
	"errors"
	"time"

	"github.com/Mongsky04/invoice-app/backend/config"
	"github.com/Mongsky04/invoice-app/backend/models"
	"github.com/golang-jwt/jwt/v4"
	"gorm.io/gorm"
)

type AuthService struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewAuthService(db *gorm.DB, cfg *config.Config) *AuthService {
	return &AuthService{db: db, cfg: cfg}
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
}

func (s *AuthService) Login(req LoginRequest) (*LoginResponse, error) {
	var user models.User
	if err := s.db.First(&user, "username = ?", req.Username).Error; err != nil {
		return nil, errors.New("invalid username or password")
	}

	if !user.CheckPassword(req.Password) {
		return nil, errors.New("invalid username or password")
	}

	token, err := s.generateToken(&user)
	if err != nil {
		return nil, err
	}

	return &LoginResponse{Token: token, User: user}, nil
}

func (s *AuthService) generateToken(user *models.User) (string, error) {
	claims := jwt.MapClaims{
		"user_id":  user.ID.String(),
		"username": user.Username,
		"role":     user.Role,
		"exp":      time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.JWTSecret))
}
