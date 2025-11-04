# WAD2-G10T6

A web application for helping cats find a home.

## Features

*   **Pet Dashboard:** Get high-level overview of current lost cat statistics
*   **Forum:** Discuss and report lost cat locations
*   **User Profiles:** Create and manage your ADORE account

## Technologies

### Frontend

*   [Nuxt.js](https://nuxt.com/)
*   [Vue.js](https://vuejs.org/)
*   [Vue Google Maps](https://github.com/fawmi/vue-google-maps)
*   [Nuxt UI](https://ui.nuxt.com/)

### Backend

*   [Node.js](https://nodejs.org/)
*   [Express](https://expressjs.com/)
*   [Supabase](https://supabase.io/)
*   [Twilio](https://www.twilio.com/)

## Setup

### Prerequisites

*   [Node.js](https://nodejs.org/en/download/)
*   [Deno](https://deno.land/#installation)

### Backend

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file from the `.env.example` and fill in the required environment variables.
4.  Start the development server:
    ```bash
    npm run dev
    ```

### Frontend

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

The frontend will be available at http://localhost:3001.

## Folder Structure

```
/
├── backend/        # Node.js/Express backend
│   ├── database/   # Database interface
│   ├── routes/     # API routes
│   ├── schemas/    # Zod schemas
│   └── utils/      # Utility functions
└── frontend/       # Nuxt.js/Vue.js frontend
    ├── assets/     # CSS and other assets
    ├── components/ # Vue components
    ├── composables/ # Vue composables
    ├── layouts/    # Nuxt layouts
    ├── pages/      # Nuxt pages
    └── public/     # Public assets
```
