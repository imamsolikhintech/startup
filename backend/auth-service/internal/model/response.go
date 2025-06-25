package model

// StandardResponse adalah struktur standar untuk semua response API
type StandardResponse struct {
	Status  int         `json:"status"`  // HTTP status code
	Data    interface{} `json:"data"`    // data response atau null jika error
	Message string      `json:"message"` // pesan sukses atau error
}

// PaginatedResponse adalah struktur standar untuk response dengan pagination
type PaginatedResponse struct {
	Status  int         `json:"status"`  // HTTP status code
	Data    interface{} `json:"data"`    // data response atau null jika error
	Message string      `json:"message"` // pesan sukses atau error
	Page    int         `json:"page"`    // halaman saat ini
	Size    int         `json:"size"`    // jumlah item per halaman
	Total   int64       `json:"total"`   // total item
}

// NewSuccessResponse membuat response sukses standar
func NewSuccessResponse(statusCode int, data interface{}, message string) StandardResponse {
	return StandardResponse{
		Status:  statusCode,
		Data:    data,
		Message: message,
	}
}

// NewErrorResponse membuat response error standar
func NewErrorResponse(statusCode int, message string) StandardResponse {
	return StandardResponse{
		Status:  statusCode,
		Data:    nil,
		Message: message,
	}
}

// NewPaginatedSuccessResponse membuat response sukses dengan pagination
func NewPaginatedSuccessResponse(statusCode int, data interface{}, message string, page, size int, total int64) PaginatedResponse {
	return PaginatedResponse{
		Status:  statusCode,
		Data:    data,
		Message: message,
		Page:    page,
		Size:    size,
		Total:   total,
	}
}

// NewPaginatedErrorResponse membuat response error dengan pagination
func NewPaginatedErrorResponse(statusCode int, message string, page, size int) PaginatedResponse {
	return PaginatedResponse{
		Status:  statusCode,
		Data:    nil,
		Message: message,
		Page:    page,
		Size:    size,
		Total:   0,
	}
}

// Helper functions untuk response yang umum digunakan

// Success200 membuat response sukses dengan status 200
func Success200(data interface{}, message string) StandardResponse {
	return NewSuccessResponse(200, data, message)
}

// Success201 membuat response sukses dengan status 201 (Created)
func Success201(data interface{}, message string) StandardResponse {
	return NewSuccessResponse(201, data, message)
}

// Error400 membuat response error dengan status 400 (Bad Request)
func Error400(message string) StandardResponse {
	return NewErrorResponse(400, message)
}

// Error401 membuat response error dengan status 401 (Unauthorized)
func Error401(message string) StandardResponse {
	return NewErrorResponse(401, message)
}

// Error403 membuat response error dengan status 403 (Forbidden)
func Error403(message string) StandardResponse {
	return NewErrorResponse(403, message)
}

// Error404 membuat response error dengan status 404 (Not Found)
func Error404(message string) StandardResponse {
	return NewErrorResponse(404, message)
}

// Error409 membuat response error dengan status 409 (Conflict)
func Error409(message string) StandardResponse {
	return NewErrorResponse(409, message)
}

// Error429 membuat response error dengan status 429 (Too Many Requests)
func Error429(message string) StandardResponse {
	return NewErrorResponse(429, message)
}

// Error500 membuat response error dengan status 500 (Internal Server Error)
func Error500(message string) StandardResponse {
	return NewErrorResponse(500, message)
}

// PaginatedSuccess200 membuat response sukses dengan pagination dan status 200
func PaginatedSuccess200(data interface{}, message string, page, size int, total int64) PaginatedResponse {
	return NewPaginatedSuccessResponse(200, data, message, page, size, total)
}

// PaginatedError400 membuat response error dengan pagination dan status 400
func PaginatedError400(message string, page, size int) PaginatedResponse {
	return NewPaginatedErrorResponse(400, message, page, size)
}

// PaginatedError500 membuat response error dengan pagination dan status 500
func PaginatedError500(message string, page, size int) PaginatedResponse {
	return NewPaginatedErrorResponse(500, message, page, size)
}