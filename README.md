# COMP 4537 - Lab 5: SQL-over-HTTP Service

## Project Overview

This project is a two-origin web application designed to interact with a MySQL database. It consists of a static client (Server 1) and a vanilla Node.js backend (Server 2).

The client provides a user interface to send two types of requests:

1.  A request to insert a predefined, hardcoded set of patient data.
2.  A request to execute a user-written, custom SQL query.

The backend is responsible for initializing the database table, connecting to the database, and safely executing the queries sent by the client. A key requirement is that the backend must filter and block any `DROP`, `DELETE`, or `UPDATE` statements, only permitting `SELECT` and `INSERT`.

## Architecture

This application strictly follows a two-origin architecture as required.

- **Server 1 (Client):** A static front-end (`index.html`, `client.js`) hosted on one origin. It provides the user interface and uses the `fetch` API (AJAX) to communicate with Server 2.
- **Server 2 (Backend):** A vanilla Node.js server (using the native `http` module) hosted on a separate origin. It listens for API requests, processes them, interacts with the MySQL database, and returns JSON responses.

---

## Repository Structure
```
    /
    ├── server1/          # Client-side (Origin 1)
    │   ├── index.html    # Main UI page with buttons and textarea
    │   └── client.js     # Handles fetch requests, DOM updates, and query detection
    │
    └── server2/          # Backend-side (Origin 2)
        ├── server.js     # Main Node.js server (http module)
        ├── db.js         # Module for database connection and query logic
        ├── package.json  # Node.js dependencies (e.g., mysql2)
        └── .env.example  # Example environment file for database credentials
```
___

## Features

- **Automatic Table Creation:** The Node.js server automatically creates the `patient` table (with `patientid`, `name`, `dateOfBirth`) using the `innoDB` engine if it does not already exist.
- **Predefined Insert:** A client-side button to `POST` a hardcoded list of four patient records to the database. This can be pressed multiple times to append more data.
- **Custom Query Execution:** A textarea allows users to write their own `SELECT` or `INSERT` queries.
- **Smart Request Method:** The client-side JavaScript automatically detects the SQL command.
  - `SELECT` queries are sent via a `GET` request.
  - `INSERT` queries are sent via a `POST` request.
- **Server-Side Security:** The backend explicitly blocks any query containing `DROP`, `DELETE`, or `UPDATE` keywords to prevent destructive actions.

---

## Local Setup and Installation

### Prerequisites

- Node.js
- A running MySQL or MariaDB server

### 1. Database Setup

1.  Ensure your MySQL server is running.
2.  Create a database for this lab (e.g., `lab5db`).
3.  Create a database user and grant it `SELECT`, `INSERT`, and `CREATE` privileges on the `lab5db` database.

### 2. Backend (Server 2)

1.  Navigate to the `server2` directory: `cd server2`
2.  Install the required Node.js modules: `npm install` (This will typically just install `mysql2` and `dotenv`).
3.  Create a `.env` file by copying `.env.example`.
4.  Fill in the `.env` file with your database credentials:
    ```
    DB_HOST=localhost
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_NAME=lab5db
    ```
5.  Start the backend server: `node server.js`
    - The server will start, typically on port `3000`.

### 3. Client (Server 1)

1.  **Important:** The client _must_ be served from a different origin (port) than the backend.
2.  In a **new terminal**, navigate to the `server1` directory: `cd server1`
3.  The easiest way to serve these files on a different port is using `npx`:
    ```bash
    npx http-server -p 8080
    ```
4.  Before using the app, open `server1/client.js` and update the `API_BASE_URL` constant to point to your running backend (e.g., `http://localhost:3000`).
5.  Open your browser and navigate to `http://localhost:8080`.

---

## API Contract (Server 2)

The backend server exposes the following endpoints.

### `GET /api/v1/sql/<query>`

- **Description:** Executes a read-only `SELECT` query.
- **URL Parameter:** The `<query>` must be a URL-encoded `SELECT` statement.
- **Example:** `GET /api/v1/sql/select%20*%20from%20patient`
- **Success Response (200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "patientid": 1,
        "name": "Sara Brown",
        "dateOfBirth": "1901-01-01T00:00:00.000Z"
      }
    ]
  }
  ```
- **Error Response (400, 403, 500):**
  ```json
  {
    "success": false,
    "error": "Forbidden query type."
  }
  ```

### `POST /api/v1/sql`

- **Description:** Executes an `INSERT` query.
- **Request Body (JSON):**
  ```json
  {
    "query": "INSERT INTO patient (name, dateOfBirth) VALUES ('Test User', '2000-01-01')"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Insert successful.",
    "result": { "affectedRows": 1, "insertId": 5 }
  }
  ```
- **Error Response (400, 403, 500):**
  ```json
  {
    "success": false,
    "error": "Invalid query."
  }
  ```
