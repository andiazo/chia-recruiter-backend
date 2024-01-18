import { exec } from "child_process";
import { join } from "path";

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
        `ffmpeg -y -i audios/${message}.mp3 audios/${message}.wav`,
    );
    console.log(`Conversion done in ${new Date().getTime() - time}ms`);
    await execCommand(
        `"./audios/rhubarb/rhubarb.exe" -f json -o audios/${message}.json audios/${message}.wav -r phonetic`,
        {
            cwd: join(process.cwd(), "audios", "rhubarb"),
        },
    );
    console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
};

let audios = [
    // 'recaudo_adapt_cambio_general',
    // 'recaudo_asist_1',
    // 'recaudo_asist_2',
    // 'recaudo_sup_1',
    // 'recaudo_sup_2',
    // 'recaudo_voc_serv_general',
    'introrecaudo',
    'question21',
    'question22'
]

for (let audio of audios) {
    await lipSyncMessage(audio)
} 