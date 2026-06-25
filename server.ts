import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = +(process.env.PORT || 3000);

  app.use(express.json());

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not defined.");
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey
  });

  const useRealAi = true;

  // used when useRealAi = false
  const fakeResponses = [
    { response: "Meow? Please don't cook me! I'll be the best kitty ever! 😿", happiness: 8 },
    { response: "Hiss! If you try to eat me, I will scratch all your furniture! 😾", happiness: 1 },
    { response: "Purrrr... standard master massage received. Please feed me fish instead of thinking of me as soup! 🐟", happiness: 9 },
    { response: "Meow, you look hungry... Should I start running?! 🙀", happiness: 3 },
    { response: "I am way too adorable to be on a plate! Look at my cozy eyes! 🥺", happiness: 7 },
    { response: "A cat eater? Purr... I will just take a nap and dream you're a vegetarian. 🐾", happiness: 5 },
    { response: "Meowww! I contain 99% fluff and 1% salt. Not tasty at all! 🐱", happiness: 6 }
  ];

  app.post("/api/chat", async (req, res) => {
    try {
      const { name, message } = req.body;
      if (!name || !message) {
        return res.status(400).json({ error: "Cat name and message are required." });
      }

      if (!useRealAi) {
        const randomIndex = Math.floor(Math.random() * fakeResponses.length);
        const choice = fakeResponses[randomIndex];
        return res.json({
          response: choice.response,
          happiness: choice.happiness
        });
      }

      const prompt = `you are a cat that might get eaten, you name is: "${name}", owner sends you this message: "${message}"`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a talking cat speaking to your caretaker owner. Keep your response in character. Follow the response JSON schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              response: {
                type: Type.STRING,
                description: "your response as a cat",
              },
              happiness: {
                type: Type.INTEGER,
                description: "a rate in range 0 to 10 of how you like the message",
              },
            },
            required: ["response", "happiness"],
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response returned from Gemini API");
      }

      const responseData = JSON.parse(text.trim());
      res.json(responseData);
    } catch (err: any) {
      console.error("Gemini API Error in /api/chat:", err);
      let errorMsg = "unknown error";
      const errMsgStr = String(err.message || err).toLowerCase();

      if (
        errMsgStr.includes("overloaded") ||
        errMsgStr.includes("high demand") ||
        errMsgStr.includes("busy") ||
        errMsgStr.includes("capacity") ||
        errMsgStr.includes("temporary") ||
        errMsgStr.includes("unavailable")
      ) {
        errorMsg = "the model is experiencing high demand";
      } else if (
        errMsgStr.includes("quota") ||
        errMsgStr.includes("exhausted") ||
        errMsgStr.includes("limit") ||
        errMsgStr.includes("rate") ||
        errMsgStr.includes("429")
      ) {
        errorMsg = "quota reached";
      }

      res.status(500).json({ error: errorMsg });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

