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
let parsedMessages = [];

// Function to extract timestamp, name or phone number, and message
function extractInformation(messageString) {
  const lineSplitRegex = /^\[(\d{1,2}\/\d{1,2}\/\d{2}, \d{1,2}:\d{2}:\d{2}\s[APM]{2})\](.*):(.*)$/;
  
  const regexMatch = messageString.match(lineSplitRegex);
  let isExtractSuccess = false;
  
  if (regexMatch !== null) {
    // The object pushed will have the timestamp in epoch milliseconds
    // and the message will be cleansed of the following Unicode RTL/LTR
    // codepoints: \u200a - \u200e, \u202e, \u202f
    parsedMessages.push({
      "dateTime": Date.parse(regexMatch[1]),
      "name": regexMatch[2],
      "message": regexMatch[3].replaceAll(/[\u200a-\u200e\u202e\u202f]/gu, '')
    });
    isExtractSuccess = true;
  }

  return isExtractSuccess;
}

// Reads from WhatsApp export file and stores an array of message objects
// in parsedMessages
// WhatsApp export file content format: [DATE, TIME] [SENDER]: [MESSAGE]
function readTextFile(filePath) {
  // Read the file asynchronously
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the file: ", err);
      return null;
    }
    
    let messageArray = data.split('\r\n');
    let matches = 0, misses = 0;
    
    for(let i=0; i<messageArray.length; ++i) {
      if(extractInformation(messageArray[i])) {
        matches += 1;
      } else {
        misses += 1;
      }
    }
    
    const logMessage = "[" + new Date().toISOString() + "] matches: " + matches + " misses: " + misses;
    
    fs.appendFile('./'+process.env.APP_LOG_FILE, logMessage + "\n", (err) => {
      if (err) {
        console.error(err);
      }
    });
  });
}

// Read uploaded file
readTextFile("public/sample.txt");

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
  res.json({ message: 'File uploaded successfully' });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is up and running on port: ${process.env.PORT}!`);
});
