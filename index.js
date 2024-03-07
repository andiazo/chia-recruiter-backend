import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import ElevenLabs from "elevenlabs-node";
import express from "express";
import { promises as fs } from "fs";
import OpenAI from "openai";
import { join } from "path";
import fetch from 'node-fetch';


dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "-", // Your OpenAI API key here, I used "-" to avoid errors when the key is not set but you should not do that
});
const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = "z9fAnlkpzviPz146aGWa";
const voice = new ElevenLabs({apiKey: elevenLabsApiKey, voiceId: voiceID});
const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;
const stability = 0.5;
const similarityBoost = 0.75;

const animations = {
  "Idle": "Idle",
};

const facialExpressions = {
  "smile": "smile",
};

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/voices", async (req, res) => {
  res.send(await voice.getVoices(elevenLabsApiKey));
});

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  
  const questions = {
    alentti: {
      text: "alentti",
      audio: await audioFileToBase64("audios/alentti.wav"),
      lipsync: await readJsonTranscript("audios/alentti.json"),
      facialExpression: "smile",
      animation: "Talking_1",
    },
    
    introrecaudo: {
      text: "",
      audio: await audioFileToBase64("audios/introrecaudo.wav"),
      lipsync: await readJsonTranscript("audios/introrecaudo.json"),
      facialExpression: "smile",
      animation: "Idle",
    },
  };
  
  if (userMessage) {
    console.log("userMessage", userMessage )
  try{
    const audio = await audioFileToBase64(`audios/${userMessage}.wav`)
    const lipsync = await readJsonTranscript(`audios/${userMessage}.json`)
    if (audio && lipsync) {
      res.send({
        
      messages: [{
      text: "",
      audio: audio,
      lipsync: lipsync, 
      animation: "Talking_1",
      }]
      })

      }
    else{
      res.send({
        messages: [{
          text: "Hola, soy Chia, tu avatar recruiter",
          audio: await audioFileToBase64("audios/intro_0.wav"),
          lipsync: await readJsonTranscript("audios/intro_0.json"),
          facialExpression: facialExpressions["smile"],
          animation: animations["Idle"],
        }],
      });
    }

  }
  catch(e){
    res.send({
      messages: [{
        text: "Hola, soy Chia, tu avatar recruiter",
        audio: await audioFileToBase64("audios/intro_0.wav"),
        lipsync: await readJsonTranscript("audios/intro_0.json"),
        facialExpression: "smile",
        animation: "Talking_1",
      }],
    });  
    }

    
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
  // console.log("> messages:", completion.choices);
  let messages = JSON.parse(completion.choices[0].message.content);
  // console.log("> messages:", messages); 
  if (messages.messages) {
    messages = messages.messages;
  }
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    // generate audio file
    const fileName = `audios/message_${i}.mp3`;
    const textInput = message.text;
    await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, textInput);
    // generate lipsync
    await lipSyncMessage(i);
    message.audio = await audioFileToBase64(fileName);
    message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
  }

  res.send({ messages });
});


app.post("/createVoices", async (req, res) => {
  // console.log(req.body.message.question)
  // console.log(req.body.message.id)
  const message = req.body.message.question;
  const id = req.body.message.id;
  const fileName = `audios/question${id}.mp3`;
  const textInput = message;
  const modelId='eleven_multilingual_v1'
  try{
    await voice.textToSpeech({fileName, textInput, modelId,stability,similarityBoost});
    await lipSyncMessageV2(id);
    res.status(201).send({message:`Voices created successfully for question ${id}`});

  }
  catch(e){
    
    res.status(500).send({message:`Error creating voices for question ${id}`});
  } 

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
  // console.log(`Starting conversion for message ${message}`);
  await execCommand(
    `ffmpeg -y -i audios/message_${message}.mp3 audios/message_${message}.wav`,
    // -y to overwrite the file
  );
  // console.log(`Conversion done in ${new Date().getTime() - time}ms`);
  await execCommand(
    `"./audios/rhubarb/rhubarb.exe" -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`,
    {
      cwd: join(process.cwd(), "audios", "rhubarb"),
    },
  );
  // -r phonetic is faster but less accurate
  // console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
};

const lipSyncMessageV2 = async (id) => {
  const time = new Date().getTime();
  // console.log(`Starting conversion for question ${id}`);
  try{

    await execCommand(
      `ffmpeg -y -i audios/question${id}.mp3 audios/question${id}.wav`,
      // -y to overwrite the file
    );
    // console.log(`Conversion done in ${new Date().getTime() - time}ms`);
    // await execCommand(
    //   `"./audios/rhubarb/rhubarb.exe" -f json -o audios/question${id}.json audios/question${id}.wav -r phonetic`,
    //   {
    //     cwd: join(process.cwd(), "audios", "rhubarb"),
    //   },
    // );
    await execCommand(
      `"audios/rhubarb-macOS/rhubarb" -f json -o audios/question${id}.json audios/question${id}.wav -r phonetic`,
      {
        cwd: join(process.cwd(), "audios", "rhubarb"),
      },
    );
    // console.log(`Lip sync done in ${new Date().getTime() - time}ms`);

  }
  catch(e){
    console.log(e)
  }
  
  // -r phonetic is faster but less accurate
  
};
const readJsonTranscript = async (file) => {
  try{
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
  }
  catch(e){
    return null
  }
};

const audioFileToBase64 = async (file) => {
  try{
  const data = await fs.readFile(file);
  return data.toString("base64");
  }
  catch(e){
    return null
  }
};

app.listen(port, () => {
  console.log(`Virtual Recruiter listening on port ${port}`);
});
