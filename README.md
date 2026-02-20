# Node Chat Application

A real-time chat application built with Node.js, Express, Socket.io, and MongoDB.

## Features

- **Real-time Messaging**: Instant communication using Socket.io.
- **Rooms**: Join specific chat rooms.
- **Persistence**: Messages are stored in MongoDB.
- **Authentication**: User authentication system (implied).
- **Dockerized**: easy setup with Docker Compose.

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (if running locally without Docker)

### Installation & Run

1.  Clone the repository (or navigate to the project directory).
2.  Create a `.env` file if it doesn't exist (see `.env.example` or source).
3.  Start the application with Docker:

    ```bash
    docker-compose up --build
    ```

    This will start:
    - The Node.js application (port 3000)
    - MongoDB database
    - Mongo Express (port 8081) for database management

4.  Access the chat at `http://localhost:3000`.

## Project Structure

- `app.js`: Main application entry point and Socket.io logic.
- `models/`: Mongoose data models.
- `routes/`: Express routes.
- `views/`: EJS templates for the frontend.
- `public/`: Static assets (CSS, JS, images).
- `docker-compose.yml`: Docker services configuration.

## Technologies

- Node.js
- Express.js
- Socket.io
- MongoDB
- Mongoose
- EJS
- Docker
