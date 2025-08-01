# FieldPro API Documentation

## Overview
This document provides documentation for the FieldPro API endpoints. All endpoints require authentication unless otherwise specified.

## Authentication
All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Base URL
```
/api
```

## Authentication Endpoints

### POST /auth/register
Register a new user

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "password": "string",
  "organizationName": "string"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "string",
  "user": {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "role": "string",
    "organizationId": "string"
  }
}
```

### POST /auth/login
Login to existing account

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "string",
  "user": {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "role": "string",
    "organizationId": "string"
  }
}
```

## Customer Endpoints

### GET /customers
Get all customers for the organization

**Response:**
```json
[
  {
    "id": "string",
    "organizationId": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "notes": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

### GET /customers/:id
Get a specific customer

**Response:**
```json
{
  "id": "string",
  "organizationId": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "zipCode": "string",
  "notes": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

### POST /customers
Create a new customer

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "zipCode": "string",
  "notes": "string"
}
```

**Response:**
```json
{
  "message": "Customer created successfully",
  "customer": {
    "id": "string",
    "organizationId": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "notes": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### PUT /customers/:id
Update an existing customer

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "zipCode": "string",
  "notes": "string"
}
```

**Response:**
```json
{
  "message": "Customer updated successfully",
  "customer": {
    "id": "string",
    "organizationId": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "notes": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### DELETE /customers/:id
Delete a customer

**Response:**
```json
{
  "message": "Customer deleted successfully"
}
```

## Job Endpoints

### GET /jobs
Get all jobs for the organization

**Response:**
```json
[
  {
    "id": "string",
    "organizationId": "string",
    "customerId": "string",
    "technicianId": "string",
    "title": "string",
    "description": "string",
    "status": "string",
    "priority": "string",
    "scheduledDate": "string",
    "startTime": "string",
    "endTime": "string",
    "address": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "notes": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

### GET /jobs/:id
Get a specific job

**Response:**
```json
{
  "id": "string",
  "organizationId": "string",
  "customerId": "string",
  "technicianId": "string",
  "title": "string",
  "description": "string",
  "status": "string",
  "priority": "string",
  "scheduledDate": "string",
  "startTime": "string",
  "endTime": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "zipCode": "string",
  "notes": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

### POST /jobs
Create a new job

**Request Body:**
```json
{
  "customerId": "string",
  "technicianId": "string",
  "title": "string",
  "description": "string",
  "status": "string",
  "priority": "string",
  "scheduledDate": "string",
  "startTime": "string",
  "endTime": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "zipCode": "string",
  "notes": "string"
}
```

**Response:**
```json
{
  "message": "Job created successfully",
  "job": {
    "id": "string",
    "organizationId": "string",
    "customerId": "string",
    "technicianId": "string",
    "title": "string",
    "description": "string",
    "status": "string",
    "priority": "string",
    "scheduledDate": "string",
    "startTime": "string",
    "endTime": "string",
    "address": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "notes": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### PUT /jobs/:id
Update an existing job

**Request Body:**
```json
{
  "customerId": "string",
  "technicianId": "string",
  "title": "string",
  "description": "string",
  "status": "string",
  "priority": "string",
  "scheduledDate": "string",
  "startTime": "string",
  "endTime": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "zipCode": "string",
  "notes": "string"
}
```

**Response:**
```json
{
  "message": "Job updated successfully",
  "job": {
    "id": "string",
    "organizationId": "string",
    "customerId": "string",
    "technicianId": "string",
    "title": "string",
    "description": "string",
    "status": "string",
    "priority": "string",
    "scheduledDate": "string",
    "startTime": "string",
    "endTime": "string",
    "address": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "notes": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### DELETE /jobs/:id
Delete a job

**Response:**
```json
{
  "message": "Job deleted successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "string",
      "message": "string"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

## Rate Limiting
API requests are rate limited to 100 requests per hour per IP address.

## Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error
