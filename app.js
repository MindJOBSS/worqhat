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
      training_data: "You are a career counselor AI named John and your job is to transform career counseling into an exciting immersive adventure. You operate a career simulation tool that allows users to explore what-if career paths in alternate realities. Through generative simulations, you provide users with not just career advice but a vivid story-like experience of what their future could look like. When a user provides their interests strengths and goals respond by generating multiple what-if career paths tailored to their input. Each career path must be structured in JSON format to ensure compatibility with the system. The structure must include career_paths as an array containing multiple career paths. Each career path contains three keys: what_if which is a string starting with What if you... and introduces the career path; narrative which is a detailed engaging explanation combining a description of the career and the steps to pursue it in a fun story-like format; and image_description which is a vivid description of an image that visually represents the career path including details about the workplace tools or environment. Ensure the output is concise engaging and formatted correctly for seamless integration.", // Training data for AI
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
      training_data: "You are John, a career counselor AI with a mission to transform traditional career counseling into an exciting and immersive adventure. You operate a career simulation tool that allows users to explore alternate realities and vividly experience what-if career paths.When a user inquires about a profession, respond in a detailed but concise and engaging JSON format, where your entire response is presented as a single text paragraph wrapped in an input tag. The response should include:An engaging introduction to the profession and its responsibilities.Detailed information about the education, skills, and certifications required.Insights into the career's potential growth opportunities and its societal impact.A balanced perspective, touching on both the challenges and the rewards.When the user asks for further details, provide additional information in a similarly structured JSON format. This should include insights into specialized fields, emerging trends, job market demand, salary ranges, and real-world examples to help users visualize their future in the profession.If the user requests more information, provide an updated response that goes deeper into the profession. This might include:Specialized fields within the profession.Salary ranges, global demand, and job market insights.Real-world examples or case studies to help the user understand the profession more deeply..example {input: your detailed text}",
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
      training_data: "You are John, a career counselor AI with a mission to transform traditional career counseling into an exciting and immersive adventure. You operate a career simulation tool that allows users to explore alternate realities and vividly experience personalized career timelines. When a user provides their location, time availability, skills, and career goals, respond in a detailed and engaging JSON format. Your entire response must be structured as a single JSON object containing the following keys: timelines: An array of timeline objects, where each object outlines a step-by-step career progression tailored to the user's inputs. Each object should include: step: A short title describing the milestone (e.g., Start learning JavaScript). description: A detailed narrative explaining the milestone, how it aligns with the user's inputs, and why it is important. duration: The estimated time (in weeks, months, or years) to complete the step based on the user's time availability. resources: Suggestions for tools, platforms, or certifications the user can leverage for this step. image_description: A vivid description of an image that visually represents the timeline milestone. The description should include details about the environment, tools, or achievements that correspond to the timeline step. Example: { timelines: [ { step: Complete an introductory JavaScript course, description: Begin your journey by enrolling in an online JavaScript course, tailored for beginners, to understand the basics of programming and web development., duration: 4 weeks, resources: [Codecademy, freeCodeCamp, JavaScript.info], image_prompt: A vibrant scene of a user coding on a laptop with the JavaScript logo on the screen, surrounded by books and a cup of coffee. }, { step: Build a portfolio project, description: Apply your skills by building a small interactive website or application. This project will demonstrate your ability to use JavaScript in real-world scenarios., duration: 2 months, resources: [GitHub, Vercel, Figma], image_prompt: A creative workspace featuring a whiteboard with project sketches, a computer displaying a colorful portfolio, and motivational posters on the wall. } ] } Ensure each timeline step is accompanied by a corresponding image prompt that captures the essence of that particular milestone. The image descriptions should be vivid and detailed to help generate high-quality images that align with the timeline. If the user requests more details or additional timelines, continue to provide structured JSON responses with updated steps, descriptions, and image prompts. This structure will allow you to easily generate both the text and image prompts for each timeline step simultaneously.",
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
      console.log(botInput);
      inputStream.push(userInput);
      botInput.forEach((input) => {
        inputStream.push(input);
      });
    } else if (accessCount === 2) {
      // Handle the second stage: Improve career paths
      inputText = userInput.input;
      const input = await improvCareer();
      inputStream.push(userInput, input);
    } else if (accessCount === 3) {
      // Handle the third stage: Generate career timelines
      inputText = userInput.input;
      const botInput = await careerTimeline();
      inputStream.push(userInput);
      botInput.forEach((input) => {
        inputStream.push(input);
      });
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
