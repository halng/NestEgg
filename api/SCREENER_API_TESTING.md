# Screener Configuration API - Testing Guide

This document provides examples and test cases for the Screener Configuration API endpoints.

## Base URL
```
http://localhost:9009/api/v1/portfolio-management
```

## Endpoints Overview

### 1. Create a Screener
**POST** `/screeners`

Creates a new screener configuration with custom filters.

**Request Body:**
```json
{
  "name": "Value Stocks Under 50",
  "description": "Find undervalued stocks with P/E ratio under 15 and market cap under 50B",
  "userId": "user-123",
  "criteria": [
    {
      "field": "peRatio",
      "operator": "lessThan",
      "value": "15"
    },
    {
      "field": "marketCap",
      "operator": "lessThan",
      "value": "50000000000"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Screener created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000"
  },
  "success": true,
  "timestamp": "2026-01-29T08:00:00Z"
}
```

### 2. Get Screener by ID
**GET** `/screeners/{screenerId}`

Retrieves a specific screener by its ID.

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Screener found",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Value Stocks Under 50",
    "description": "Find undervalued stocks with P/E ratio under 15 and market cap under 50B",
    "userId": "user-123",
    "criteria": [
      {
        "field": "peRatio",
        "operator": "lessThan",
        "value": "15"
      },
      {
        "field": "marketCap",
        "operator": "lessThan",
        "value": "50000000000"
      }
    ],
    "createdAt": "2026-01-29T08:00:00Z",
    "updatedAt": "2026-01-29T08:00:00Z",
    "isActive": true,
    "isDeleted": false
  },
  "success": true,
  "timestamp": "2026-01-29T08:00:00Z"
}
```

### 3. Get All Screeners for a User
**GET** `/screeners?userId={userId}`

Retrieves all screeners for a specific user.

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Screeners retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Value Stocks Under 50",
      "description": "Find undervalued stocks with P/E ratio under 15 and market cap under 50B",
      "userId": "user-123",
      "criteria": [
        {
          "field": "peRatio",
          "operator": "lessThan",
          "value": "15"
        }
      ],
      "createdAt": "2026-01-29T08:00:00Z",
      "updatedAt": "2026-01-29T08:00:00Z",
      "isActive": true,
      "isDeleted": false
    }
  ],
  "success": true,
  "timestamp": "2026-01-29T08:00:00Z"
}
```

### 4. Update a Screener
**PUT** `/screeners/{screenerId}`

Updates an existing screener configuration.

**Request Body:**
```json
{
  "name": "Value Stocks Under 50 - Updated",
  "description": "Updated description with new criteria",
  "userId": "user-123",
  "criteria": [
    {
      "field": "peRatio",
      "operator": "lessThan",
      "value": "12"
    },
    {
      "field": "debtToEquity",
      "operator": "lessThan",
      "value": "0.5"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Screener updated successfully",
  "data": null,
  "success": true,
  "timestamp": "2026-01-29T08:05:00Z"
}
```

### 5. Delete a Screener
**DELETE** `/screeners/{screenerId}`

Marks a screener as deleted (soft delete).

**Response (202 Accepted):**
```json
{
  "statusCode": 202,
  "message": "Screener deleted successfully",
  "data": null,
  "success": true,
  "timestamp": "2026-01-29T08:10:00Z"
}
```

## Error Responses

### Screener Not Found (404)
```json
{
  "statusCode": 404,
  "message": "Screener not found with id: xyz",
  "data": null,
  "success": false,
  "timestamp": "2026-01-29T08:00:00Z"
}
```

### Duplicate Screener Name (409)
```json
{
  "statusCode": 409,
  "message": "Screener with the same name already exists for this user",
  "data": null,
  "success": false,
  "timestamp": "2026-01-29T08:00:00Z"
}
```

### Invalid Input (400)
```json
{
  "statusCode": 400,
  "message": "Screener name and userId must not be null or blank",
  "data": null,
  "success": false,
  "timestamp": "2026-01-29T08:00:00Z"
}
```

## Test Scenarios

### Test Case 1: Create and Retrieve
1. Create a screener with POST `/screeners`
2. Note the returned ID
3. Retrieve the screener using GET `/screeners/{id}`
4. Verify all fields match the created screener

### Test Case 2: List User Screeners
1. Create multiple screeners for the same userId
2. Use GET `/screeners?userId=user-123` to retrieve all
3. Verify all created screeners are returned

### Test Case 3: Update Screener
1. Create a screener
2. Update it with different criteria using PUT `/screeners/{id}`
3. Retrieve the screener and verify the changes

### Test Case 4: Delete and Verify
1. Create a screener
2. Delete it using DELETE `/screeners/{id}`
3. Try to retrieve it - should return 404
4. List user screeners - deleted screener should not appear

### Test Case 5: Persistence (AC-2)
1. Create a screener
2. Stop the application
3. Restart the application
4. Retrieve the screener - should still exist with same data

### Test Case 6: Deterministic Results (AC-4)
1. Create a screener with specific criteria
2. Retrieve it multiple times
3. Verify the criteria fields are returned in the same order each time
4. Apply the screener to evaluate data (when evaluation feature is implemented)
5. Verify same results each time for the same data snapshot

## CURL Examples

### Create Screener
```bash
curl -X POST http://localhost:9009/api/v1/portfolio-management/screeners \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Growth Stocks",
    "description": "High growth tech stocks",
    "userId": "user-123",
    "criteria": [
      {"field": "sector", "operator": "equals", "value": "Technology"},
      {"field": "revenueGrowth", "operator": "greaterThan", "value": "20"}
    ]
  }'
```

### Get All Screeners for User
```bash
curl -X GET "http://localhost:9009/api/v1/portfolio-management/screeners?userId=user-123"
```

### Get Specific Screener
```bash
curl -X GET "http://localhost:9009/api/v1/portfolio-management/screeners/{screenerId}"
```

### Update Screener
```bash
curl -X PUT http://localhost:9009/api/v1/portfolio-management/screeners/{screenerId} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Growth Stocks - Updated",
    "description": "Updated criteria",
    "userId": "user-123",
    "criteria": [
      {"field": "sector", "operator": "equals", "value": "Technology"},
      {"field": "revenueGrowth", "operator": "greaterThan", "value": "25"}
    ]
  }'
```

### Delete Screener
```bash
curl -X DELETE "http://localhost:9009/api/v1/portfolio-management/screeners/{screenerId}"
```

## Notes

- All screeners are user-scoped via the `userId` field
- Screener names must be unique per user
- At least one criterion is required when creating/updating a screener
- Deleted screeners are soft-deleted (isDeleted flag) and won't appear in listings
- The API uses optimistic locking via the version field in AuditEntity
- All timestamps are in ISO-8601 format with UTC timezone
