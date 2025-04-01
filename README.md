# EcoHub

EcoHub is a full-stack web application for environmental enthusiasts to share and discover environmental projects and research papers. Think of it as an Instagram/Reddit hybrid focused exclusively on environmental initiatives.

## Features

- **Share Projects:** Post your environmental projects, research papers, and initiatives
- **Discover Content:** Browse through projects from other environmentalists and researchers
- **Comment System:** Engage in discussions through comments on projects
- **Like System:** Show appreciation for projects you find valuable
- **User Authentication:** Secure account creation and login system
- **User Profiles:** View profiles of other users and their contributions

## Tech Stack

- **Frontend:** Next.js 14 (React), Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS with custom theme

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd ecohub
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up your environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/ecohub"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Initialize the database
   ```bash
   npx prisma migrate dev --name init
   ```

5. Run the development server
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/app` - Next.js application routes and components
- `/app/api` - API routes for backend functionality
- `/app/components` - Reusable UI components
- `/prisma` - Database schema and migrations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Deployment
- Deployed on Vercel
- Using Neon PostgreSQL database 