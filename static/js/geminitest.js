

import { GoogleGenerativeAI } from "@google/generative-ai";

// Access your API key (replace with your actual API key)
const API_KEY = "AIzaSyB6GrxpK9LIQrRSQ54lhiiySNuUtz9RidM";
const generateBtn = document.getElementById("generateBtn");
const promptEditor = CodeMirror.fromTextArea(document.getElementById("prompt"), {
  lineNumbers: true,
  mode: "text/plain",
  theme: "default",
});
const outputEditor = CodeMirror.fromTextArea(document.getElementById("output"), {
  lineNumbers: true,
  mode: "text/plain",
  theme: "default",
  readOnly: true,
});

async function generateText() {
  const prompt = promptEditor.getValue();

  if (prompt.trim() === "") {
    alert("Please enter a prompt.");
    return;
  }

  generateBtn.disabled = true;
  outputEditor.setValue("Generating...");

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    outputEditor.setValue(text);
  } catch (error) {
    console.error("Error:", error);
    outputEditor.setValue("An error occurred. Please try again.");
  } finally {
    generateBtn.disabled = false;
  }
}

generateBtn.addEventListener("click", generateText);