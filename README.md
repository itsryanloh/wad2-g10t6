# WAD2-G10T6

A web application for helping cats find a home. It is publicly accessible on https://adore-frontend.onrender.com

Git Repository: https://github.com/itsryanloh/wad2-g10t6

## Features

*   **Pet Dashboard:** Get high-level overview of current lost cat statistics
*   **Forum:** Discuss and report lost cat locations
*   **User Profiles:** Create and manage your ADORE account
*   **Adoption Checklist:** Kickstart the adoption process and monitor the necessary steps to adopting

## Technologies

### Frontend

*   [Nuxt.js](https://nuxt.com/)
*   [Vue.js](https://vuejs.org/)
*   [Vue Google Maps](https://github.com/fawmi/vue-google-maps)
*   [Nuxt UI](https://ui.nuxt.com/)
*   [Rive](https://rive.app/)
*   [Zod](https://zod.dev/)

### Backend

*   [Node.js](https://nodejs.org/)
*   [Dotenvx](https://dotenvx.com/)
*   [Express](https://expressjs.com/)
*   [point-in-polygon-hao](https://www.npmjs.com/package/point-in-polygon-hao)
*   [Supabase](https://supabase.io/)
*   [Twilio](https://www.twilio.com/)
*   [Zod](https://zod.dev/)

## Setup

### Prerequisites

*   [Node.js](https://nodejs.org/en/download/)

### Backend

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Ensure that the `.env` file is in the `backend` directory
4.  Start the backend server:
    ```bash
    npm run start
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
3.  Ensure that the `.env` file is in the `frontend` directory
4.  Start the development server:
    ```bash
    npm run dev
    ```

The frontend will be available at http://localhost/.

## User Credentials

A new user can register for an account by clicking on the login button at the top-right of the application

Here are the credentials of an existing user:

Username: `humancompiler`

Password: `password`

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

## AI Usage

This section states the parts where each group member solely relied on AI/LLM to complete specific tasks.

Zachary:
* Generate dashboard themes and layouts 
* Creating a stylised dropdown list

Kang Sheng:
* Online information searches of interesting ideas/web application to focus on working for the project
* Suggesting of color scheme that caters to our web application based on a given context of our idea
* Generating of the Cat Sprite animation video seen on our landing page
* Exploring and explaining of different UI/UX design inspirations based on reddit and instagram for forum feature
* Explaining of group members code to assists in debugging

Ryan:
* Create initial layout of registration forms, subsequently edited the forms
* Generate code snippet examples for reference, for example, recursive component call example
* Research for Cat Identicon API to find https://cat-avatars.vercel.app/

Jinhong:
* Search for library to use the bobbing cat on checklist progress bar and implementation of the library
* Idea generation of badge appearing animations, marking completed checklist tasks and carousel of uncompleted cat badges