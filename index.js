const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check
app.get("/", (req, res) => {
  res.send("Ollama API Gateway is running");
});

// Generate endpoint
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, model = "deepseek-r1", options } = req.body;

    const response = await axios.post("http://localhost:11434/api/generate", {
      model,
      prompt,
      stream: false, // Set to true for streaming
      options,
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to process request" });
  }
});

// Streaming endpoint
app.post("/api/generate-stream", async (req, res) => {
  try {
    const { prompt, model = "deepseek-r1", options } = req.body;

    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model,
        prompt,
        stream: true,
        options,
      },
      { responseType: "stream" }
    );
    let txt = "";
    response.data.on("data", (chunk) => {
      const data = JSON.parse(chunk.toString());
      console.log(data.response);
      txt += data.response;
      if (data.done) {
        res.write(txt);
        console.log(txt);
      }
    });
    response.data.pipe(res);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to process request" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
