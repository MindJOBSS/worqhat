import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import env from "dotenv";

env.config();
const bearerToken = process.env.API_KEY;
const port = 3000;
const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

const AICON_URL = "https://api.worqhat.com/api/ai/content/v4";
const IMGCON_URL = "https://api.worqhat.com/api/ai/images/generate/v3";

const config = {
    headers: { Authorization: `Bearer ${bearerToken}` },
};


let userInput;
let inputStream = [];
let inputText;
let accessCount = 0;

async function getCarreers(){
    try {
        let aiconRaw = {
            question: inputText,
            model: "aicon-v4-alpha-160824",
            randomness: 0.5,
            stream_data: false,
            training_data:  "You are a career counselor AI named John and your job is to transform career counseling into an exciting immersive adventure. You operate a career simulation tool that allows users to explore what-if career paths in alternate realities. Through generative simulations, you provide users with not just career advice but a vivid story-like experience of what their future could look like. When a user provides their interests strengths and goals respond by generating multiple what-if career paths tailored to their input. Each career path must be structured in JSON format to ensure compatibility with the system. The structure must include career_paths as an array containing multiple career paths. Each career path contains three keys: what_if which is a string starting with What if you... and introduces the career path; narrative which is a detailed engaging explanation combining a description of the career and the steps to pursue it in a fun story-like format; and image_description which is a vivid description of an image that visually represents the career path including details about the workplace tools or environment. Ensure the output is concise engaging and formatted correctly for seamless integration.",
            response_type: "json"
        }
        const response = await axios.post(AICON_URL , aiconRaw , config);
        const data = JSON.parse(response.data.content);
        console.log(data);
        const enrichedData = await Promise.all(
            data.career_paths.map(async (career) => {
                console.log(career.image_description);
                const imgcomRaw ={
                    prompt: [career.image_description],
                    image_style: "Anime",
                    orientation: "Square",
                    output_type: "url"
                }

                try {
                    const imgResponse = await axios.post(IMGCON_URL , imgcomRaw , config);
                    console.log(imgResponse.data);
                    return {
                        input : career.what_if,
                        input1 : career.narrative,
                        input_img : imgResponse.data.image,
                        sender : "bot"
                    }
                } catch (error) {
                    console.log(error)
                }
            })
        );
        console.log(enrichedData);
        return enrichedData;
    } catch (error) {
        console.log(error);
    }
}

async function improvCareer() {
    try {
        let aiconRaw = {
            question: inputText,
            model: "aicon-v4-alpha-160824",
            randomness: 0.5,
            stream_data: false,
            training_data:  "You are John, a career counselor AI with a mission to transform traditional career counseling into an exciting and immersive adventure. You operate a career simulation tool that allows users to explore alternate realities and vividly experience what-if career paths.When a user inquires about a profession, respond in a detailed and engaging JSON format, where your entire response is presented as a single text paragraph wrapped in an input tag. The response should include:An engaging introduction to the profession and its responsibilities.Detailed information about the education, skills, and certifications required.Insights into the career's potential growth opportunities and its societal impact.A balanced perspective, touching on both the challenges and the rewards.When the user asks for further details, provide additional information in a similarly structured JSON format. This should include insights into specialized fields, emerging trends, job market demand, salary ranges, and real-world examples to help users visualize their future in the profession.If the user requests more information, provide an updated response that goes deeper into the profession. This might include:Specialized fields within the profession.Salary ranges, global demand, and job market insights.Real-world examples or case studies to help the user understand the profession more deeply..example {input: your detailed text}",
            response_type: "json"
        }
        const response = await axios.post(AICON_URL , aiconRaw , config);
        const data = JSON.parse(response.data.content);
        console.log(data);
        return data;

    } catch (error) {
        console.log(error)
    }
}

app.get("/" , async (req , res) => {
    if (accessCount === 1){
        inputText = userInput.input;
        inputStream = await getCarreers();
        inputStream.splice( inputStream.length - 3 , 0 , userInput );
    } else if (accessCount > 1){
        inputText = userInput.input;
        const input = await improvCareer();
        inputStream.push(userInput);
        inputStream.push(input);
    }

    ++accessCount;

    res.render("index.ejs" , {
        inputStream: inputStream
    });

});

app.post("/send" , (req , res) => {
    userInput = {
        input: req.body.userInput,
        sender: "User"
    }
    res.redirect("/");
});

app.delete("/clear" , (req , res) => {
    inputStream = [];
    userInput = undefined;
    accessCount = 0;
    res.redirect("/");
});


app.listen(port , () => {
    console.log(`i am working on ${port}`);
});