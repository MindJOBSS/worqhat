import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import env from "dotenv";

env.config();
const bearerToken = process.env.API_KEY;
const port = 3000;
const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const AICON_URL = "https://api.worqhat.com/api/ai/content/v4";
const IMGCON_URL = "https://api.worqhat.com/api/ai/images/generate/v2";

const config = {
  headers: { Authorization: `Bearer ${bearerToken}` },
};

let userInput;
let inputStream = [];
let inputText;
let accessCount = 0;

// Utility function to log and handle errors
function handleError(error, context = "") {
  console.error(`Error in ${context}:`, error.message);
  return { error: `An error occurred in ${context}. Please try again later.` };
}

// Function to fetch career paths
async function getCareers() {
  try {
    let aiconRaw = {
      question: inputText,
      model: "aicon-v4-alpha-160824",
      randomness: 0.5,
      stream_data: false,
      training_data: "You are a career counselor AI named John and your job is to transform career counseling into an exciting immersive adventure. You operate a career simulation tool that allows users to explore what-if career paths in alternate realities. Through generative simulations, you provide users with not just career advice but a vivid story-like experience of what their future could look like. When a user provides their interests strengths and goals respond by generating multiple what-if career paths tailored to their input. Each career path must be structured in JSON format to ensure compatibility with the system. The structure must include career_paths as an array containing multiple career paths. Each career path contains three keys: what_if which is a string starting with What if you... and introduces the career path; narrative which is a detailed engaging explanation combining a description of the career and the steps to pursue it in a fun story-like format; and image_description which is a vivid description of an image that visually represents the career path including details about the workplace tools or environment. Ensure the output is concise engaging and formatted correctly for seamless integration.",
      response_type: "json",
    };
    const response = await axios.post(AICON_URL, aiconRaw, config);
    const data = JSON.parse(response.data.content);

    const enrichedData = await Promise.all(
      data.career_paths.map(async (career) => {
        try {
          const imgcomRaw = {
            prompt: [career.image_description],
            image_style: "Anime",
            orientation: "Square",
            output_type: "url",
          };
          const imgResponse = await axios.post(IMGCON_URL, imgcomRaw, config);
          return {
            input: career.what_if,
            input1: career.narrative,
            input_img: imgResponse.data.image,
            sender: "bot",
          };
        } catch (error) {
          return handleError(error, "Image Generation");
        }
      })
    );

    return enrichedData;
  } catch (error) {
    return handleError(error, "Career Paths Generation");
  }
}

// Function to fetch improved career paths
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
    return data;
  } catch (error) {
    return handleError(error, "Improved Career Paths");
  }
}

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
        console.log(data);

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
          
          console.log(enrichedData);
          return enrichedData;

    } catch (error) {
        return handleError(error, "Career Timline Generation");
    }
}

// Route to render the main page
app.get("/", async (req, res) => {
  try {
    if (accessCount === 1) {
      inputText = userInput.input;
      const botInput = await getCareers();
      inputStream.push(userInput);
      inputStream.push(botInput[0]);
    } else if (accessCount === 2) {
      inputText = userInput.input;
      const input = await improvCareer();
      inputStream.push(userInput);
      inputStream.push(input);
    } else if (accessCount === 3) {
        inputText = userInput.input;
        const botInput = await careerTimeline();
        inputStream.push(userInput);
        inputStream.push(botInput[0]);
    }

    ++accessCount;

    res.render("index.ejs", {
      inputStream: inputStream,
    });
  } catch (error) {
    res.status(500).send(handleError(error, "Rendering Main Page"));
  }
});

// Route to handle user input
app.post("/send", (req, res) => {
  try {
    if (!req.body.userInput) {
      throw new Error("User input is required.");
    }
    userInput = {
      input: req.body.userInput,
      sender: "User",
    };
    res.redirect("/");
  } catch (error) {
    res.status(400).send(handleError(error, "Processing User Input"));
  }
});

// Route to clear the input stream
app.delete("/clear", (req, res) => {
  try {
    inputStream = [];
    userInput = undefined;
    accessCount = 0;
    res.redirect("/");
  } catch (error) {
    res.status(500).send(handleError(error, "Clearing Data"));
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
