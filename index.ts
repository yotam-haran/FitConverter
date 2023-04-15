import { lstatSync, readFileSync, readdirSync, writeFileSync } from "fs";
import inquirer from "inquirer";
import { Decoder, Stream } from "@garmin-fit/sdk"
import moment from "moment"

console.log(process.argv);

const { entryPoint }: { entryPoint: string } = await inquirer.prompt([
  {
    type: "input",
    name: "entryPoint",
    message: "What is the entry point to collect .fit files?",
  },
]);

const files: string[] = [];

const walk = (path: string) => {
  if (path.includes("FitSDK")) return;

  if (lstatSync(path).isFile()) {
    if (path.endsWith(".fit")) files.push(path);
    return;
  }

  const contents = readdirSync(path);
  contents.forEach((item) => walk(`${path}/${item}`));
};

walk(entryPoint);

const heartRateMessages: { timestamp: string, heartRate: number }[] = []
const timestamp16Offset = 631065600
files.forEach(file => {
  const decoder = new Decoder(Stream.fromBuffer(readFileSync(file)));
  const messages = decoder.read().messages.monitoringMesgs

  let lastTimestamp: string | null = null
  messages.forEach((msg) => {
    if (!("heartRate" in msg)) {
      if ("timestamp" in msg) lastTimestamp = msg.timestamp
      return
    }

    const dateTimeOffset = new Date(lastTimestamp!)
    const timestamp = dateTimeOffset.getTime() / 1000 - timestamp16Offset
    const msgTimestamp = timestamp + ((msg.timestamp16 - (timestamp & 0xFFFF)) & 0xFFFF)

    heartRateMessages.push({
      timestamp: moment((timestamp16Offset + msgTimestamp) * 1000).format("HH:mm:ss"),
      heartRate: msg.heartRate
    })
  })
})

writeFileSync("results.csv", heartRateMessages.map(({ timestamp, heartRate }) => `${timestamp},${heartRate}`).join("\n"))
