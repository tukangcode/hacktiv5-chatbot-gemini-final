// import libray yang neede
import  'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';  // fixed import statement
// import GoogleGenAI dari google genai sdk
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// memasukan express ke variable app
const app = express();

const ai = new GoogleGenAI({ apiKey: process.env.Gemini_API_KEY });  

const GEMINI_MODEL = 'gemini-2.5-flash'; // Model yang digunakan

// mengunakan libray cors karena kita use express api as frontend
app.use(cors());
// karena kita use express json sebagai output
app.use(express.json());

// tambahan middleware untuk server file static frontend
app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;

app.listen(PORT, () => console.log(`bro visit on http://localhost:${PORT}`));
// route untuk mengakses
//  ai

// fungsi pengecekan isi respond dari gemini sdk
function extractText(resp) {
    try {
        const text =
            resp?.response?.candidates?.[0]?.content?.parts?.[0]?.text ??
            resp?.candidates?.[0]?.content?.parts?.[0]?.text ??
            resp?.response?.candidates?.[0]?.content?.text;

        return text ?? JSON.stringify(resp, null, 2);
    } catch (err) {
        console.error("Error extracting text:", err);
        return JSON.stringify(resp, null, 2);
    }
}


// API CHAT
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) throw new Error("messages must be an array");
    const contents = messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));
    const resp = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents
    });
    res.json({ result: extractText(resp) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
