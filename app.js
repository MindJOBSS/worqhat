// Import required modules
import express from "express"; // Express for creating a web server
import axios from "axios"; // Axios for making HTTP requests
import bodyParser from "body-parser"; // Body-parser for parsing request bodies
import env from "dotenv"; // Dotenv to load environment variables

// Load environment variables from the .env file
env.config();

// Define constants for API token and server port
const bearerToken = process.env.API_KEY; // API Key for authentication
const port = 3000; // Port for the server
const app = express(); // Create an Express app instance

// Middleware setup
app.use(express.static("public")); // Serve static files from the "public" directory
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Define API endpoints for external services
const AICON_URL = "https://api.worqhat.com/api/ai/content/v4"; // URL for AI content generation
const IMGCON_URL = "https://api.worqhat.com/api/ai/images/generate/v2"; // URL for image generation

// Configuration for API requests
const config = {
  headers: { Authorization: `Bearer ${bearerToken}` }, // Set Authorization header with bearer token
};

// Define variables for user input and conversation flow
let userInput; // Stores the user's latest input
let inputStream = []; // Array to track the conversation history
let inputText; // Text from the user's input
let accessCount = 0; // Counter to track the stage of the conversation

// Utility function to log and handle errors
// This function logs the error and returns a user-friendly message
function handleError(error, context = "") {
  console.error(`Error in ${context}:`, error.message); // Log the error to the console
  return { error: `An error occurred in ${context}. Please try again later.` }; // Return a generic error message
}

// Function to fetch and process career paths
// Makes an API call to generate career paths and enriches them with images
async function getCareers() {
  try {
    // Define the request payload for the career paths API
    let aiconRaw = {
      question: inputText, // Input text from the user
      model: "aicon-v4-alpha-160824", // AI model version
      randomness: 0.5, // Randomness parameter for AI responses
      stream_data: false, // Whether to stream data
      training_data: "You are a career counselor AI named John and your job is to transform career counseling into an exciting immersive adventure...", // Training data for AI
      response_type: "json", // Expected response format
    };

    // Make the API call
    const response = await axios.post(AICON_URL, aiconRaw, config);
    const data = JSON.parse(response.data.content); // Parse the response data

    // Enrich the career paths with generated images
    const enrichedData = await Promise.all(
      data.career_paths.map(async (career) => {
        try {
          const imgcomRaw = {
            prompt: [career.image_description], // Image description from the career path
            image_style: "Anime", // Style of the generated image
            orientation: "Square", // Orientation of the image
            output_type: "url", // Output format of the image
          };
          const imgResponse = await axios.post(IMGCON_URL, imgcomRaw, config);
          return {
            input: career.what_if, // What-if scenario text
            input1: career.narrative, // Career narrative
            input_img: imgResponse.data.image, // URL of the generated image
            sender: "bot", // Indicates the response is from the bot
          };
        } catch (error) {
          return handleError(error, "Image Generation"); // Handle any errors during image generation
        }
      })
    );

    return enrichedData; // Return the enriched career paths
  } catch (error) {
    return handleError(error, "Career Paths Generation"); // Handle any errors during the process
  }
}

// Function to fetch improved career paths
// Similar to getCareers but focuses on enhanced details for a profession
async function improvCareer() {
  try {
    let aiconRaw = {
      question: inputText,
      model: "aicon-v4-alpha-160824",
      randomness: 0.5,
      stream_data: false,
      training_data: "You are John, a career counselor AI with a mission to transform traditional career counseling into an exciting and immersive adventure...",
      response_type: "json",
    };

    const response = await axios.post(AICON_URL, aiconRaw, config);
    const data = JSON.parse(response.data.content);
    return data; // Return the improved career paths
  } catch (error) {
    return handleError(error, "Improved Career Paths"); // Handle any errors
  }
}

// Function to fetch and process career timelines
// Generates step-by-step career progression with images
async function careerTimeline() {
  try {
    let aiconRaw = {
      question: inputText,
      model: "aicon-v4-alpha-160824",
      randomness: 0.5,
      stream_data: false,
      training_data: "You are John, a career counselor AI with a mission to transform traditional career counseling into an exciting and immersive adventure...",
      response_type: "json",
    };

    const response = await axios.post(AICON_URL, aiconRaw, config);
    const data = JSON.parse(response.data.content);

    // Enrich the timelines with generated images
    const enrichedData = await Promise.all(
      data.timelines.map(async (career) => {
        try {
          const imgcomRaw = {
            prompt: [career.image_description],
            image_style: "Anime",
            orientation: "Square",
            output_type: "url",
          };
          const imgResponse = await axios.post(IMGCON_URL, imgcomRaw, config);
          return {
            input: career.step,
            input1: career.description,
            input2: career.duration,
            input3: career.resources,
            input_img: imgResponse.data.image,
            sender: "bot",
          };
        } catch (error) {
          return handleError(error, "Image Generation");
        }
      })
    );

    return enrichedData; // Return the enriched timelines
  } catch (error) {
    return handleError(error, "Career Timeline Generation"); // Handle any errors
  }
}

// Route to render the main page
app.get("/", async (req, res) => {
  try {
    if (accessCount === 1) {
      // Handle the first stage: Get career paths
      inputText = userInput.input;
      const botInput = await getCareers();
      inputStream.push(userInput, botInput);
    } else if (accessCount === 2) {
      // Handle the second stage: Improve career paths
      inputText = userInput.input;
      const input = await improvCareer();
      inputStream.push(userInput, input);
    } else if (accessCount === 3) {
      // Handle the third stage: Generate career timelines
      inputText = userInput.input;
      const botInput = await careerTimeline();
      inputStream.push(userInput, botInput);
    }

    ++accessCount; // Increment access count for the next stage

    res.render("index.ejs", {
      inputStream: inputStream, // Pass the conversation history to the view
    });
  } catch (error) {
    res.status(500).send(handleError(error, "Rendering Main Page")); // Handle errors during rendering
  }
});

// Route to handle user input from the form
app.post("/send", (req, res) => {
  try {
    if (!req.body.userInput) {
      throw new Error("User input is required."); // Validate input
    }
    userInput = {
      input: req.body.userInput, // Store user input
      sender: "User", // Mark as user input
    };
    res.redirect("/"); // Redirect to the main page
  } catch (error) {
    res.status(400).send(handleError(error, "Processing User Input")); // Handle input errors
  }
});

// Route to clear the conversation history
app.get("/clear", (req, res) => {
  try {
    inputStream = []; // Clear the conversation history
    userInput = undefined; // Reset user input
    accessCount = 0; // Reset access count
    res.redirect("/"); // Redirect to the main page
  } catch (error) {
    res.status(500).send(handleError(error, "Clearing Data")); // Handle errors during clearing
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`); // Log the server start message
});
