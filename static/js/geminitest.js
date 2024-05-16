import { GoogleGenerativeAI } from "@google/generative-ai";
import { myCodeMirror_prompt_small_segment, myCodeMirror_small_segment, myCodeMirror_prompt_big_segment, myCodeMirror_big_segment } from "./step1.js";

// Access your API key (replace with your actual API key)
const API_KEY = "AIzaSyB6GrxpK9LIQrRSQ54lhiiySNuUtz9RidM";

const generateSmallSegmentBtn = document.getElementById("Ai-refine-button-small-segment");
const generateBigSegmentBtn = document.getElementById("Ai-refine-button-big-segment");

async function generateTextSmallSegment() {
  if (!myCodeMirror_small_segment) {
    console.error("myCodeMirror_small_segment is not defined.");
    return;
  }

  const customPrompt = myCodeMirror_prompt_small_segment.getValue();
  const textSegments = myCodeMirror_small_segment.getValue();
  const prompt = customPrompt + textSegments.replace(/\n/g, ' ');
  console.log("prompt:", prompt);
  if (prompt.trim() === "") {
    alert("Please enter some text segments.");
    return;
  }

  generateSmallSegmentBtn.disabled = true;

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
    generateSmallSegmentBtn.disabled = false;
    statusElement.remove();
  }
}

generateSmallSegmentBtn.addEventListener("click", async () => {
  try {
    await generateTextSmallSegment();
  } catch (error) {
    console.error("Unexpected error:", error);
  }
});

async function generateTextBigSegment() {
  if (!myCodeMirror_big_segment) {
    console.error("myCodeMirror_big_segment is not defined.");
    return;
  }

  const customPrompt = myCodeMirror_prompt_big_segment.getValue();
  const textSegments = myCodeMirror_big_segment.getValue();
  const prompt = customPrompt + textSegments.replace(/\n/g, ' ');
  console.log("prompt:", prompt);
  if (prompt.trim() === "") {
    alert("Please enter some text segments.");
    return;
  }

  generateBigSegmentBtn.disabled = true;

  const statusElement = document.createElement("div");
  statusElement.textContent = "Generating...";
  statusElement.style.color = "blue";
  statusElement.style.textAlign = "center";
  myCodeMirror_big_segment.getWrapperElement().appendChild(statusElement);

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = await response.text();

    // Remove blank lines and add a space to the front of each line
    text = text.split("\n").filter(line => line.trim() !== "").map(line => " " + line).join("\n");

    console.log("Response:", text);
    myCodeMirror_big_segment.setValue(text);
    console.log("myCodeMirror_big_segment:", myCodeMirror_big_segment);
  } catch (error) {
    console.error("Error:", error);
    myCodeMirror_big_segment.setValue("An error of GEMINI API occurred. Please try again.");
  } finally {
    generateBigSegmentBtn.disabled = false;
    statusElement.remove();
  }
}

generateBigSegmentBtn.addEventListener("click", async () => {
  try {
    await generateTextBigSegment();
  } catch (error) {
    console.error("Unexpected error:", error);
  }
});
