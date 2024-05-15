import { GoogleGenerativeAI } from "@google/generative-ai";
import { myCodeMirror_small_segment } from "./step1.js";

// Access your API key (replace with your actual API key)
const API_KEY = "AIzaSyB6GrxpK9LIQrRSQ54lhiiySNuUtz9RidM";

const generateBtn = document.getElementById("Ai-refine-button-small-segment");

async function generateText() {
    if (!myCodeMirror_small_segment) {
      console.error("myCodeMirror_small_segment is not defined.");
      return;
    }
  
    const customPrompt = "Write a story about a magic backpack. ";
    const textSegments = myCodeMirror_small_segment.getValue();
    const prompt = customPrompt + "\n\n" + textSegments;
  
    if (prompt.trim() === "") {
      alert("Please enter some text segments.");
      return;
    }
  
    generateBtn.disabled = true;
  
    const statusElement = document.createElement("div");
    statusElement.textContent = "Generating...";
    statusElement.style.color = "blue";
    statusElement.style.textAlign = "center";
    myCodeMirror_small_segment.getWrapperElement().appendChild(statusElement);
  
    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = await response.text();
      
      // Remove blank lines and add a space to the front of each line
      text = text.split("\n").filter(line => line.trim() !== "").map(line => " " + line).join("\n");
      
      console.log("Response:", text);
      myCodeMirror_small_segment.setValue(text);
      console.log("myCodeMirror_small_segment:", myCodeMirror_small_segment);
    } catch (error) {
      console.error("Error:", error);
      myCodeMirror_small_segment.setValue("An error of GEMINI API occurred. Please try again.");
    } finally {
      generateBtn.disabled = false;
      statusElement.remove();
    }
  }
generateBtn.addEventListener("click", generateText);
