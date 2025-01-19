
# Career Counseling AI Application

This is a Node.js application that uses AI-powered APIs to provide personalized career counseling and guidance. The application generates immersive career paths, detailed professional insights, and step-by-step career timelines based on user input.  

## Features

- **Career Path Generation**: Suggests potential career paths tailored to user interests and goals.
- **Image Generation**: Creates visual representations of each career path using AI.
- **Improved Career Insights**: Provides detailed information about specific professions, including education requirements, job market trends, and challenges.
- **Career Timeline**: Generates a step-by-step guide for achieving career milestones, complete with resource recommendations and visuals.
- **Interactive User Interface**: Allows users to input queries and receive AI-generated responses in a conversational format.

## Tech Stack

- **Backend**: Node.js, Express
- **APIs**: 
  - `https://api.worqhat.com/api/ai/content/v4` for generating career-related content.
  - `https://api.worqhat.com/api/ai/images/generate/v2` for generating visual representations.
- **Middleware**: 
  - `body-parser` for parsing request bodies.
  - `dotenv` for managing environment variables.
- **Frontend**: EJS (Embedded JavaScript) for rendering dynamic content.

## Prerequisites

Ensure the following are installed on your system:

1. Node.js (v14 or later)
2. npm (comes with Node.js)
3. A `.env` file with the following content:
   ```
   API_KEY=your_api_key_here
   ```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/career-counseling-ai.git
   cd career-counseling-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your API key:
   ```plaintext
   API_KEY=your_api_key_here
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`.

## Project Structure

```plaintext
career-counseling-ai/
├── public/                # Static files (CSS, JS, etc.)
├── views/                 # EJS templates
├── node_modules/          # Dependencies installed via npm
├── .env                   # Environment variables
├── app.js                 # Main server logic
├── package.json           # Project metadata and scripts
├── README.md              # Project documentation
```

## API Workflow

1. **Career Path Generation**:
   - User inputs career-related queries.
   - The app calls the career content API, processes the response, and generates a list of career paths enriched with AI-generated images.

2. **Improved Career Insights**:
   - Provides detailed data on specific professions, including growth opportunities, educational requirements, and challenges.

3. **Career Timeline**:
   - Generates a timeline with actionable steps and resource recommendations for achieving career goals.

## Error Handling

- Errors during API calls or rendering are logged in the console and displayed as user-friendly messages.

## Routes

1. `/` (GET): Renders the main page, displaying career suggestions and timelines.
2. `/send` (POST): Processes user input and generates AI responses.
3. `/clear` (GET): Clears the session and resets the conversation.

## Contribution Guidelines

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes with descriptive messages.
4. Create a pull request to the main branch.


## Acknowledgments

- **Worqhat APIs**: For providing AI-powered content and image generation.
- **Node.js Community**: For robust frameworks and tools.
