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

function averageMessagesPerDay(messages) {
  // Initialize an object to store messages per day
  const messagesPerDay = {};

  // Iterate through messages
  messages.forEach(message => {
    // Convert epoch milliseconds to a date
    const date = new Date(message.dateTime);
    // Get the date without time
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

    // If day doesn't exist in messagesPerDay, initialize it with count 1
    if (!messagesPerDay[day]) {
      messagesPerDay[day] = 1;
    } else {
      // Increment count for existing day
      messagesPerDay[day]++;
    }
  });

  // Calculate the total number of days
  const totalDays = Object.keys(messagesPerDay).length;

  // Calculate the total number of messages
  const totalMessages = Object.values(messagesPerDay).reduce((acc, curr) => acc + curr, 0);

  // Calculate the average
  const average = totalMessages / totalDays;
  // console.log(messagesPerDay)
  console.log(average)
  return average;
}

function calculateMostActiveDay(messagesArray) {
  const mostActiveDay = {
    Mon:0 ,
    Tue:0 ,
    Wed:0 ,
    Thu:0 ,
    Fri:0 ,
    Sat:0 ,
    Sun:0 
  };

  // Iterate through messages
  messagesArray.forEach(message => {
    // Convert epoch milliseconds to a date
    const date = new Date(message.dateTime);
    // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayOfWeek = date.getDay();
    // Convert day of the week to string representation (e.g., "Sun", "Mon", etc.)
    const dayOfWeekString = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek];
    // Increment count for the corresponding day of the week
    mostActiveDay[dayOfWeekString]++;
  });

  return mostActiveDay;
}

function findMostActiveMember(messagesArray) {
  // Create a Set to store distinct names
  const distinctNames = new Set();

  // Iterate through messages to collect distinct names
  messagesArray.forEach(message => {
    distinctNames.add(message.name);
  });

  // If there are only two distinct names, return null
  if (distinctNames.size === 2) {
    return { mostActiveMember: null, messageCount: null };
  }

  // Create an object to store message counts for each member
  let memberMessageCounts = {};

  // Iterate through messages
  messagesArray.forEach(message => {
    const { name } = message;
    // Increment message count for the member
    if (memberMessageCounts[name]) {
      memberMessageCounts[name]++;
    } else {
      memberMessageCounts[name] = 1;
    }
  });

  // Find the most active member and their message count
  let mostActiveMember = null;
  let maxMessageCount = 0;

  for (const member in memberMessageCounts) {
    if (memberMessageCounts[member] > maxMessageCount) {
      mostActiveMember = member;
      maxMessageCount = memberMessageCounts[member];
    }
  }

  return { mostActiveMember, messageCount: maxMessageCount };
}



function getAnalytics(filename) {
let analytics = {
  uid:filename,
  isGroup:false,
  emojis:[],
  total_messages:0,
  average_msgs_per_day:0,
  most_active_day:{},
  most_active_member:{name:"",messages:0  }
}
let {parsedMessages,messageArray} = getParsedMessages(`public/${filename}.txt`)
analytics.emojis = top5UsedEmojis(messageArray.join(""))
analytics.total_messages = messageArray.length
analytics.average_msgs_per_day= Math.round(averageMessagesPerDay(parsedMessages))
analytics.most_active_day = calculateMostActiveDay(parsedMessages)

let { mostActiveMember, messageCount} = findMostActiveMember(parsedMessages)
if (mostActiveMember){
  analytics.isGroup = true
  analytics.most_active_member = {name:mostActiveMember,messages:messageCount}
}

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
