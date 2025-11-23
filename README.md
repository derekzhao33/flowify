### schedu.ai

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend/app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Migrate the database
   ```bash
   npx prisma migrate dev --name init
   ```
4. Initialize prisma
   ```bash
   npx prisma init
   ```
5. Set DATABASE_URL in .env file
4. Generate prisma files
   ```bash
   npx prisma generate
   ```
5. Start the development server:
   ```bash
   npm run start:dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend/app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Additional Notes
- You can write JavaScript in .ts files, it will compile the same as if it was a .js file
