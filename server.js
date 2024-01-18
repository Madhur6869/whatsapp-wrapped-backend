const cors = require("cors");
const express = require("express");
const dotenv = require("dotenv");
const dbconnect = require("./mongo/dbconnect");

const app = express();

dotenv.config({ path: "./.env" });

dbconnect();

const fs = require("fs");

//Splits the text file - each message is a string - Need to parse and delete irrelevant strings
function readTextFile(filePath) {
  // Read the file asynchronously
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the file:", err);
      return;
    }
    console.log(typeof data)
    
      // const searchFormat = /\[\d{1,2}\/\d{1,2}\/\d{2}, \d{1,2}:\d{2}:\d{2}/g;
      const searchFormat = /\n(?=\[\d{1,2}\/\d{1,2}\/\d{2},)/;

    // Find occurrences using match
    const occurrences = data.split(searchFormat);
    console.log(occurrences)
  });
}

readTextFile("public/sample.txt");

// function printEmojiHexCodes(filePath) {
//     // Read the file asynchronously
//     fs.readFile(filePath, 'utf8', (err, data) => {
//       if (err) {
//         console.error('Error reading the file:', err);
//         return;
//       }

//       // Use a regular expression to find emojis in the text
//       const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F\uDE80-\uDEFF]/g;
//       const emojis = data.match(emojiRegex);

//       if (emojis) {
//         // Print hex codes of emojis
//         emojis.forEach((emoji) => {
//           const hexCode = Array.from(emoji).map((char) => char.codePointAt(0).toString(16)).join(' ');
//           console.log(`Emoji: ${emoji}, Hex Code: ${hexCode}`);
//         });
//       } else {
//         console.log('No emojis found in the text file.');
//       }
//     });
//   }

//   printEmojiHexCodes('public/sampleChat.txt');
// // Example usage: replace 'your/file/path.txt' with the actual path to your text file

/// Prateek's version of Regex parsing
// Define the regex to capture date and time, name, and message
const nameRegex =
  /^\[(\d{1,2}\/\d{1,2}\/\d{2}, \d{1,2}:\d{2}:\d{2} [APMapm]{2})\] ([\w\s]+): (.*)$/;

// Define the regex to capture date and time, phone number, and message
const phoneNumberRegex =
  /^\[(\d{1,2}\/\d{1,2}\/\d{2}, \d{1,2}:\d{2}:\d{2} [APMapm]{2})\] (\+\d+): (.*)$/;

// Function to extract date, name, and message or date, phone number, and message
function extractInformation(messageString) {
  const nameMatch = messageString.match(nameRegex);
  const phoneNumberMatch = messageString.match(phoneNumberRegex);

  if (nameMatch) {
    const dateAndTime = nameMatch[1];
    const name = nameMatch[2];
    const message = nameMatch[3];

    console.log("Date and Time:", dateAndTime);
    console.log("Name:", name || "Not available");
    console.log("Message:", message);
  } else if (phoneNumberMatch) {
    const dateAndTime = phoneNumberMatch[1];
    const phoneNumber = phoneNumberMatch[2];
    const message = phoneNumberMatch[3];

    console.log("Date and Time:", dateAndTime);
    console.log("Phone Number:", phoneNumber || "Not available");
    console.log("Message:", message);
  } else {
    console.log("No match found for either format");
  }
}

// Example strings
const nameBasedString = "[12/28/23, 4:05:28 PM] Ashwin IUB: Hey Madhur";
const phoneNumberBasedString =
  "[12/28/23, 4:05:28 PM] +19876543210: Hey Madhur";

// Extract information for the name-based example
console.log("Extracting information for name-based example:");
// extractInformation(nameBasedString);

// Extract information for the phone number-based example
console.log("\nExtracting information for phone number-based example:");
// extractInformation(phoneNumberBasedString);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.text());

app.use(
  cors({
    origin: [`http://localhost:3000`],
    credentials: true,
  })
);

app.listen(process.env.PORT, () => {
  console.log(`Server is up and running on port: ${process.env.PORT}!`);
});
