# Vidly API (Express + MongoDB)

A RESTful backend API for a video rental application built with Node.js, Express, and MongoDB.

This project includes user authentication with JWT, role-based authorization, movie/customer/genre management, rental processing, return processing, and automated tests.

## Features

- JWT-based authentication (`x-auth-token` header)
- Role-based access control for admin-only routes
- CRUD APIs for:
  - Genres
  - Customers
  - Movies
  - Rentals
- Rental return workflow with fee calculation
- MongoDB persistence with Mongoose
- Centralized validation and error handling middleware
- Unit and integration test coverage with Jest + Supertest

## Tech Stack

- Node.js
- Express
- MongoDB + Mongoose
- Joi validation
- JWT (`jsonwebtoken`)
- Winston logging
- Jest + Supertest

## Project Structure

```text
.
+-- config/
+-- middleware/
+-- models/
+-- routes/
+-- startup/
+-- tests/
+-- vidly.js
+-- package.json
```

## Prerequisites

- Node.js `24.11.0` (as specified in `package.json`)
- MongoDB running locally

## Configuration

This app uses the `config` package.

1. Set the JWT secret through environment variable:

```bash
# Linux/macOS
export vidly_jwtPrivateKey="your_secure_jwt_key"

# Windows PowerShell
$env:vidly_jwtPrivateKey="your_secure_jwt_key"
```

2. Default database values:

- Development DB: `mongodb://localhost/vidly`
- Test DB: `mongodb://localhost/vidly_tests`

The server will throw an error if `jwtPrivateKey` is missing.

Default port: `3000`

## Running Tests

```bash
npm test
```

Current test script runs Jest in watch mode with coverage:

```bash
jest --watchAll --verbose --coverage --runInBand
```

## API Endpoints

Base URL: `http://localhost:3000`

### Auth

- `POST /api/auth` - Login and receive JWT token

### Users

- `POST /api/users` - Register a new user
- `GET /api/users/me` - Get current authenticated user

### Genres

- `GET /api/genres`
- `GET /api/genres/:id`
- `POST /api/genres` (auth required)
- `PUT /api/genres/:id` (auth required)
- `DELETE /api/genres/:id` (admin required)

### Customers

- `GET /api/customers`
- `GET /api/customers/:id`
- `POST /api/customers` (auth required)
- `PUT /api/customers/:id` (auth required)
- `DELETE /api/customers/:id` (admin required)

### Movies

- `GET /api/movies`
- `GET /api/movies/:id`
- `POST /api/movies`
- `PUT /api/movies/:id`
- `DELETE /api/movies/:id`

### Rentals

- `GET /api/rentals`
- `GET /api/rentals/:id`
- `POST /api/rentals`
- `PUT /api/rentals/:id`
- `DELETE /api/rentals/:id`

### Returns

- `POST /api/returns` (auth required)

## Authentication Notes

For protected routes, send JWT in request headers:

```http
x-auth-token: <your_token>
```

## Logging

- Uncaught exceptions are logged to `uncaughtException.log`
- Additional logs are written by Winston (including Mongo transport if configured)

