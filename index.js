import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import voice from "elevenlabs-node";
import express from "express";
import { promises as fs } from "fs";
import OpenAI from "openai";
import { join } from "path";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "-", // Your OpenAI API key here, I used "-" to avoid errors when the key is not set but you should not do that
});

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
// const voiceID = "kgG7dCoKCfLehAPWkJOE";
const voiceID = "21m00Tcm4TlvDq8ikWAM";

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;
// const port = 3001;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/voices", async (req, res) => {
  res.send(await voice.getVoices(elevenLabsApiKey));
});

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
};

const lipSyncMessage = async (message) => {
  const time = new Date().getTime();
  console.log(`Starting conversion for message ${message}`);
  await execCommand(
    `ffmpeg -y -i audios/message_${message}.mp3 audios/message_${message}.wav`,
    // -y to overwrite the file
  );
  console.log(`Conversion done in ${new Date().getTime() - time}ms`);
  await execCommand(
    `"./audios/rhubarb/rhubarb.exe" -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`,
    {
      cwd: join(process.cwd(), "audios", "rhubarb"),
    },
  );
  // -r phonetic is faster but less accurate
  console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
};

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  // console.log("chat called");
  const questions = {
    alentti: {
      text: "alentti",
      audio: await audioFileToBase64("audios/alentti.wav"),
      lipsync: await readJsonTranscript("audios/alentti.json"),
      facialExpression: "smile",
      animation: "Talking_1",
    },
    question1: {
      text: "Qué te motiva más de tu profesión?",
      audio: await audioFileToBase64("audios/question1.wav"),
      lipsync: await readJsonTranscript("audios/question1.json"),
      facialExpression: "smile",
      animation: "Talking_0",
    },
    question2: {
      text: "Hola, soy Chia, tu avatar recruiter",
      audio: await audioFileToBase64("audios/question2.wav"),
      lipsync: await readJsonTranscript("audios/question2.json"),
      facialExpression: "smile",
      animation: "Talking_1",
    },
    question3: {
      text: "Hola, soy Chia, tu avatar recruiter",
      audio: await audioFileToBase64("audios/question3.wav"),
      lipsync: await readJsonTranscript("audios/question3.json"),
      facialExpression: "smile",
      animation: "Talking_2",
    },
    question4: {
      text: "Hola, soy Chia, tu avatar recruiter",
      audio: await audioFileToBase64("audios/question4.wav"),
      lipsync: await readJsonTranscript("audios/question4.json"),
      facialExpression: "smile",
      animation: "Talking_0",
    },
    question5: {
      text: "Hola, soy Chia, tu avatar recruiter",
      audio: await audioFileToBase64("audios/question5.wav"),
      lipsync: await readJsonTranscript("audios/question5.json"),
      facialExpression: "smile",
      animation: "Talking_1",
    },
    question6: {
      text: "Hola, soy Chia, tu avatar recruiter",
      audio: await audioFileToBase64("audios/question6.wav"),
      lipsync: await readJsonTranscript("audios/question6.json"),
      facialExpression: "smile",
      animation: "Idle",
    },
    question0: {
      text: "hola diana y equipo de recaudo. Soy chia y quiero ser parte de tu equipo de reclutamiento, estar disponible 24 7 y mejorar la experiencia de los candidatos.",
      audio: await audioFileToBase64("audios/saludoRecaudo.wav"),
      lipsync: await readJsonTranscript("audios/saludoRecaudo.json"),
      facialExpression: "smile",
      animation: "Idle",
    },
    question8: {
      text: "Hola equipo de Scotiabank, soy Chia, tu avatar recruiter. Y les doy la bienvenida al proceso de selección del futuro",
      audio: await audioFileToBase64("audios/saludoScotia.wav"),
      lipsync: await readJsonTranscript("audios/saludoScotia.json"),
      facialExpression: "smile",
      animation: "Idle",
    },
    // Recaudo
    question12: {
      text: "¿Puedes compartir una experiencia en la que hayas trabajado de manera colaborativa para lograr un objetivo común?",
      audio: await audioFileToBase64("audios/question12.wav"),
      lipsync: await readJsonTranscript("audios/question12.json"),
      facialExpression: "smile",
      animation: "Idle",
    },
    question13: {
      text: "¿Cómo te aseguras de alinear tus metas individuales con los objetivos más amplios de la organización?",
      audio: await audioFileToBase64("audios/question13.wav"),
      lipsync: await readJsonTranscript("audios/question13.json"),
      facialExpression: "smile",
      animation: "Idle",
    },
    question14: {
      text: "¿Qué significa para ti un ambiente de trabajo sano y condiciones favorables? ¿Cómo contribuyes a mantenerlo?",
      audio: await audioFileToBase64("audios/question14.wav"),
      lipsync: await readJsonTranscript("audios/question14.json"),
      facialExpression: "smile",
      animation: "Idle",
    },
    question15: {
      text: "",
      audio: await audioFileToBase64("audios/question15.wav"),
      lipsync: await readJsonTranscript("audios/question15.json"),
      facialExpression: "smile",
      animation: "Idle",
    },
    question16: {
      text: "",
      audio: await audioFileToBase64("audios/question16.wav"),
      lipsync: await readJsonTranscript("audios/question16.json"),
      facialExpression: "smile",
      animation: "Idle",
    },
    question17: {
      text: "",
      audio: await audioFileToBase64("audios/question17.wav"),
      lipsync: await readJsonTranscript("audios/question17.json"),
      facialExpression: "smile",
      animation: "Idle",
    },
    question18: {
      text: "",
      audio: await audioFileToBase64("audios/question18.wav"),
      lipsync: await readJsonTranscript("audios/question18.json"),
      facialExpression: "smile",
      animation: "Idle",
    },
    question19: {
      text: "",
      audio: await audioFileToBase64("audios/question19.wav"),
      lipsync: await readJsonTranscript("audios/question19.json"),
      facialExpression: "smile",
      animation: "Idle",
    },
    question20: {
      text: "",
      audio: await audioFileToBase64("audios/question20.wav"),
      lipsync: await readJsonTranscript("audios/question20.json"),
      facialExpression: "smile",
      animation: "Idle",
    },
    question21: {
      text: "",
      audio: await audioFileToBase64("audios/question21.wav"),
      lipsync: await readJsonTranscript("audios/question21.json"),
      facialExpression: "smile",
      animation: "Idle",
    },
    question22: {
      text: "",
      audio: await audioFileToBase64("audios/question22.wav"),
      lipsync: await readJsonTranscript("audios/question22.json"),
      facialExpression: "smile",
      animation: "Idle",
    },
    introrecaudo: {
      text: "",
      audio: await audioFileToBase64("audios/introrecaudo.wav"),
      lipsync: await readJsonTranscript("audios/introrecaudo.json"),
      facialExpression: "smile",
      animation: "Idle",
    }
  };

  if (questions[userMessage]) {
    res.send({
      messages: [questions[userMessage]],
    });
    return;
  }

  if (!userMessage || userMessage == "saludo") {
    res.send({
      messages: [
        {
          text: "Hola, soy Chia, tu avatar recruiter",
          audio: await audioFileToBase64("audios/intro_0.wav"),
          lipsync: await readJsonTranscript("audios/intro_0.json"),
          facialExpression: "smile",
          animation: "Talking_1",
        },
        {
          text: "Te doy la bienvenida al proceso de selección del futuro",
          audio: await audioFileToBase64("audios/intro_1.wav"),
          lipsync: await readJsonTranscript("audios/intro_1.json"),
          facialExpression: "smile",
          animation: "Talking_1",
        },
      ],
    });
    return;
  }
  if (!elevenLabsApiKey || openai.apiKey === "-") {
    res.send({
      messages: [
        {
          text: "Please my dear, don't forget to add your API keys!",
          audio: await audioFileToBase64("audios/api_0.wav"),
          lipsync: await readJsonTranscript("audios/api_0.json"),
          facialExpression: "angry",
          animation: "Angry",
        },
        {
          text: "You don't want to ruin Wawa Sensei with a crazy ChatGPT and ElevenLabs bill, right?",
          audio: await audioFileToBase64("audios/api_1.wav"),
          lipsync: await readJsonTranscript("audios/api_1.json"),
          facialExpression: "smile",
          animation: "Idle",
        },
      ],
    });
    return;
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    max_tokens: 1500,
    temperature: 0.6,
    messages: [
      {
        role: "system",
        content: `
        You are a virtual recruiter. You will always reply with a JSON array of messages. With a maximum of 3 messages. 
        output them in a valid JSON object. If you cannot deduce anyof the required information, provide empty strings.
        Each message has a text, facialExpression, and animation property. You answer in english or spanish in the same way. Like this: 
            Structure: <<<
            [
              {
                text: '',
                facialExpression: "smile, sad, angry, surprised, funnyFace, or default.",
                animation: "Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, or Angry",
              }
            ]
          >>>

          Text: <<<
          {text input}
          >>>
        `,
      },
      {
        role: "user",
        content: userMessage || "Hello",
      },
    ],
  });
  console.log("> messages:", completion.choices);
  let messages = JSON.parse(completion.choices[0].message.content);
  if (messages.messages) {
    messages = messages.messages; // ChatGPT is not 100% reliable, sometimes it directly returns an array and sometimes a JSON object with a messages property
  }
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    // generate audio file
    const fileName = `audios/message_${i}.mp3`; // The name of your audio file
    const textInput = message.text; // The text you wish to convert to speech
    await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, textInput);
    // generate lipsync
    await lipSyncMessage(i);
    message.audio = await audioFileToBase64(fileName);
    message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
  }

  res.send({ messages });
});

const readJsonTranscript = async (file) => {
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await fs.readFile(file);
  return data.toString("base64");
};

app.listen(port, () => {
  console.log(`Virtual Recruiter listening on port ${port}`);
});
