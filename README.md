# Employee Management Dashboard

A full-stack web application built for the ICTAK assessment featuring a React frontend and Node.js/Express REST API with MongoDB Atlas persistence.

## Features

- **Full CRUD Support**:
  - **View & List**: Fetch and display employees in a responsive table.
  - **Create**: Add new employees with client and server-side validation.
  - **Update**: Edit existing employee details with pre-populated form.
  - **Delete**: Remove employees with confirmation prompt and instant UI update.
- **Search & Filter**: Real-time search across names, designations, emails, and locations.
- **UI States**: Loading spinners, friendly empty-state views, dismissible success notifications, and error-handling banners with retry actions.
- **Responsive Design**: Clean Bootstrap 5.3 interface matching the Employee Portal styling.
- **CORS & JSON Middleware**: Configured Express server allowing smooth local development.

---

## Tech Stack

- **Frontend**: React 18, Vite 6, React Router v6, Axios, Bootstrap 5.3
- **Backend**: Node.js, Express 4, Mongoose 8 (MongoDB Atlas), dotenv, cors
- **Testing**: Automated integration and CRUD lifecycle test suite (`npm test`)

---

## Prerequisites

- Node.js 18 or later
- MongoDB Atlas cluster connection URI

---

## Installation & Setup

1. Clone or download this repository.
2. In the project root directory, install all required dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` configuration file from the template:
   ```bash
   copy .env.example .env
   ```
4. Open `.env` and set your MongoDB Atlas connection string:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
   VITE_API_URL=http://localhost:5000
   ```
   > **Note:** Do NOT commit your `.env` file to GitHub. It is already included in `.gitignore`.

---

## Running the Application

### 1. Run Backend Server
Open a terminal in the project folder:
```bash
npm run server
```
*(Runs on `http://localhost:5000`)*

### 2. Run Frontend Client
Open a second terminal in the same project folder:
```bash
npm run dev
```
*(Runs on `http://localhost:5173` or `http://localhost:5174`)*

### 3. Run Automated Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API status and endpoint directory |
| `GET` | `/employees` | Fetch all employees |
| `GET` | `/employees/:id` | Fetch a single employee by ObjectId |
| `POST` | `/employees` | Create a new employee |
| `PUT` | `/employees/:id` | Update an existing employee |
| `DELETE` | `/employees/:id` | Delete an employee by ObjectId |

---

## Folder Structure

```text
├── .env.example                 # Environment variables template
├── .gitignore                   # Excludes node_modules, dist, and .env
├── app.js                       # Express backend server and MongoDB routes
├── index.html                   # HTML template with favicon
├── package.json                 # Project scripts and dependencies
├── README.md                    # Project documentation
├── test-crud.js                 # Automated CRUD testing suite
├── vite.config.js               # Vite configuration with React plugin
└── src/
    ├── main.jsx                 # Application entry point
    ├── App.jsx                  # Route definitions
    ├── index.css                # Custom dashboard styling
    ├── api.js                   # Axios client with environment base URL
    ├── components/
    │   └── Navbar.jsx           # Top navigation bar
    └── pages/
        ├── Home.jsx             # Employee directory table
        └── EmployeeForm.jsx     # Add and Edit employee form
```
