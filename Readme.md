# LinkedIn Lead Generation Backend

A professional backend service for automated LinkedIn lead generation, data scraping, and campaign management.

## 🚀 Tech Stack

- **Node.js** - JavaScript runtime environment
- **TypeScript** - Strongly typed programming language built on JavaScript
- **Express.js** - Web application framework for Node.js
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling for Node.js
- **Puppeteer** - Headless Chrome Node.js API for web scraping

## ✨ Features

- **LinkedIn Profile Scraping**: Automated extraction of professional data
- **Campaign Management**: Create, manage, and track lead generation campaigns
- **Lead Database**: Store and organize leads with detailed information

## 🛠️ Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- LinkedIn account credentials

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/outflo
LINKEDIN_USERNAME=your_linkedin_email
LINKEDIN_PASSWORD=your_linkedin_password
GEMINI_API_KEY=YOUR-KEY
```

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd outflo-assignment/backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build TypeScript files:

   ```bash
   npm run build
   ```

4. Start the server:

   ```bash
   npm start
   ```

   For development with auto-reload:

   ```bash
   npm run dev
   ```
## For Scraping 
- Setup environment variables
```
LINKEDIN_USERNAME=your_linkedin_email
LINKEDIN_PASSWORD=your_linkedin_password
```
1. Run the scraper file :

   ```bash
   npx ts-node scraper/scraper.ts
   ```

## 📝 API Documentation

### Campaigns

- **GET /campaigns** - Get all campaigns
- **GET /campaigns/:id** - Get campaign by ID
- **POST /campaigns** - Create a new campaign
- **PUT /campaigns/:id** - Update a campaign
- **DELETE /campaigns/:id** - Delete a campaign

### Leads

- **GET /leads** - Get all leads

## 📄 License

MIT License
