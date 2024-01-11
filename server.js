
const cors = require("cors");
const express = require("express");
const dotenv = require("dotenv");
const dbconnect = require("./mongo/dbconnect");

const app = express();

dotenv.config({ path: "./.env" });

dbconnect();

const fs = require('fs');

// function readTextFile(filePath) {
//   // Read the file asynchronously
//   fs.readFile(filePath, 'utf8', (err, data) => {
//     if (err) {
//       console.error('Error reading the file:', err);
//       return;
//     }

//     // Split the contents into an array of lines
//     const lines = data.split('\n');

//     // Print each line
//     lines.forEach((line) => {
//       console.log(line);
//     });
//   });
// }

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
// // readTextFile('public/sampleChat.txt');

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
