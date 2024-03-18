const cors = require("cors");
const express = require("express");
const dotenv = require("dotenv");
const dbconnect = require("./mongo/dbconnect");
const multer = require('multer')
const path = require('path');
const {v4: uuidv4} = require('uuid');
const app = express();
const fs = require('fs');

dotenv.config({ path: "./.env" });

dbconnect();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.text());

app.use(
  cors({
    origin: "*",
    credentials: false,
  })
);

// Message objects will be stored in the following format:
// [
//  {
//    "dateTime": <epoch milliseconds>,
//    "name": <string>,
//    "message": <string>
//  }
// ]
// let parsedMessages = [];

// Function to extract timestamp, name or phone number, and message
function extractInformation(messageString) {
  const lineSplitRegex = /^\[(\d{1,2}\/\d{1,2}\/\d{2}, \d{1,2}:\d{2}:\d{2}\s[APM]{2})\](.*):(.*)$/;
  
  const regexMatch = messageString.match(lineSplitRegex);
  let isExtractSuccess = false;
  
  if (regexMatch !== null) {
    // The object pushed will have the timestamp in epoch milliseconds
    // and the message will be cleansed of the following Unicode RTL/LTR
    // codepoints: \u200a - \u200e, \u202e, \u202f

    return {
      "dateTime": Date.parse(regexMatch[1]),
      "name": regexMatch[2],
      "message": regexMatch[3].replaceAll(/[\u200a-\u200e\u202e\u202f]/gu, '')
    }
    // parsedMessages.push({
    //   "dateTime": Date.parse(regexMatch[1]),
    //   "name": regexMatch[2],
    //   "message": regexMatch[3].replaceAll(/[\u200a-\u200e\u202e\u202f]/gu, '')
    // });
    isExtractSuccess = true;
  }

  return isExtractSuccess;
}

// Returns 5 most occuring emojis
function top5UsedEmojis(text) {
  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g; // Regex to match emojis

  const emojis = text.match(emojiRegex); // Extract emojis from the text

  if (!emojis) return []; // Return empty array if no emojis found

  const emojiCount = {};
  emojis.forEach(emoji => {
      emojiCount[emoji] = (emojiCount[emoji] || 0) + 1; // Count occurrences of each emoji
  });

  const sortedEmojis = Object.keys(emojiCount).sort((a, b) => emojiCount[b] - emojiCount[a]); // Sort emojis by count

  return sortedEmojis.slice(0, 5).map(emoji => ({ emoji, count: emojiCount[emoji] })); // Return top 5 emojis with counts
}


// Reads from WhatsApp export file and stores an array of message objects
// in parsedMessages
// WhatsApp export file content format: [DATE, TIME] [SENDER]: [MESSAGE]


function getParsedMessages(filePath) {
  let parsedMessages = [];
  let messageArray = [];

  try {
    const data = fs.readFileSync(filePath, 'utf8');
    messageArray = data.split('\r\n');

    for (let i = 0; i < messageArray.length; ++i) {
      const result = extractInformation(messageArray[i]);
      if (result) {
        parsedMessages.push(result);
      }
    }
    console.log("inside file read fn", parsedMessages.length);

    return { parsedMessages, messageArray };
  } catch (err) {
    console.error("Error reading the file: ", err);
    return { parsedMessages: null, messageArray: null };
  }
}

function getAverageMessagesPerDay(parsedMessages){
  
}


function getAnalytics(filename) {
let analytics = {
  uid:filename,
  emojis:[],
  total_messages:0
}
let {parsedMessages,messageArray} = getParsedMessages(`public/${filename}.txt`)
analytics.emojis = top5UsedEmojis(messageArray.join(""))
analytics.total_messages = messageArray.length
console.log(analytics)

}

getAnalytics("sample")
// Read uploaded file
// readTextFile("public/sample.txt");

const storage = multer.diskStorage({
  destination: './public/',
  filename: (req, file, cb) => {
    cb(null, uuidv4() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Added this GET method to test
// TODO: Remove this before deploying
app.get('/api/getData', (req, res) => {
  let limit = parseInt(req.query.limit) || 5;
  
  if(limit < 1) {
    limit = 5;
  } else if (limit > parsedMessages.length) {
    limit = parsedMessages.length;
  }
  
  const limitedMessages = parsedMessages.slice(0, limit);
  res.json({size: limitedMessages.length, messages: limitedMessages});
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  console.log(req.file.filename)
  getAnalytics(`public/${req.file.filename}`)
  res.json({ message: 'File uploaded successfully' });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is up and running on port: ${process.env.PORT}!`);
});
