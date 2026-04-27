# FocusWell Dashboard

FocusWell is a productivity dashboard designed to help users manage tasks, focus sessions, reminders, notes, and personal reflections in one unified interface.  
The application provides tools such as a Kanban board, Pomodoro timer, calendar view, and analytics to help users maintain productivity and organization.

---

# Features

- **Kanban Task Board** – Manage tasks with drag-and-drop columns.
- **Pomodoro Focus Timer** – Track focused work sessions and breaks.
- **Calendar Widget** – View and navigate dates easily.
- **Notes Widget** – Store and manage quick notes.
- **Reminders System** – Create and track reminders.
- **Thought Organizer** – Capture ideas, reflections, worries, and gratitude notes.
- **Weekly Analytics** – Visual summary of focus time and completed tasks.
- **Responsive Dashboard Layout** – Desktop sidebar and mobile navigation.
- **Dark / Light Theme Toggle**

---

# Tech Stack

## Frontend
- React
- TypeScript
- Vite

## Styling
- TailwindCSS
- tailwindcss-animate
- clsx
- tailwind-merge

## UI & Icons
- Radix UI
- Lucide React Icons
- Sonner (Toast Notifications)

## State & Data
- React Query
- LocalStorage persistence

## Charts
- Recharts

## Routing
- React Router

---

# Project Structure

```
Dashboard
│
├── src
│   ├── components
│   │   ├── dashboard
│   │   └── ui
│   ├── data
│   ├── hooks
│   ├── lib
│   ├── pages
│   ├── types
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.ts
└── vite.config.ts
```

---

# Installation

### 1. Clone the repository

```bash
git clone https://github.com/KhadijaBoureza/Dashboard.git
```

### 2. Navigate to the project directory

```bash
cd Dashboard
```

### 3. Install dependencies

```bash
npm install
```

---

# Dependencies Installed

## Core Dependencies

```
react
react-dom
react-router-dom
@tanstack/react-query
```

## UI Libraries

```
lucide-react
@radix-ui/react-toast
@radix-ui/react-tooltip
sonner
next-themes
```

## Utility Libraries

```
clsx
tailwind-merge
class-variance-authority
```

## Date & Components

```
react-day-picker
```

## Charts

```
recharts
```

## Development Dependencies

```
vite
typescript
vitest
tailwindcss
postcss
autoprefixer
tailwindcss-animate
@vitejs/plugin-react-swc
```

---

# Running the Project

Start the development server:

```bash
npm run dev
```

The application will start and display something similar to:

```
VITE ready
Local: http://localhost:8080
```

Open the URL in your browser to view the dashboard.

---

# Build for Production

To create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

# Testing

The project uses **Vitest** for testing.

Run tests with:

```bash
npm run test
```

---

# Development Notes

- The project uses **localStorage** to persist tasks, notes, reminders, and analytics data.
- TailwindCSS v3 is used for compatibility with UI components.
- The dashboard layout supports both **desktop and mobile views**.
- Vite is used as the development server and build tool for fast performance.

---

# Author

Developed by **Khadija Boureza*

University Project – Productivity Dashboard

---

# License

This project is intended for educational purposes.
