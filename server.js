/*
  ชื่อ? : โค้ดสำหรับโครงงานเคมี
  เขียนโดย : CodeNothin
  License : MIT License
*/
const express = require('express');
const axios = require('axios');
const app = express();
const https = require("https");
const fetch = require('node-fetch');
const fs = require('fs');
const { group } = require('console');

const PORT = 3000;

const token = process.env.API_KEY; //token from LINE API
const userId = process.env.USER_TOKEN; //personal key for testing purpose | uid ไลน์ส่วนตัวไว้สำหรับทดสอบอย่างเดียว

app.use(express.json());

app.get('/login/RNM68-001', (req, res) => {
  res.redirect(process.env.URL_1);
});
app.get('/login/RNM68-002', (req, res) => {
  res.redirect(process.env.URL_2);
});

app.post('/notify', async (req, res) => {
  const { group, type, data } = req.body;
  console.log("Group: ", group, "  Type: ", type);
  groupName = null;
  res.send("sure");
  const groups = JSON.parse(fs.readFileSync('user.json', 'utf8'));

  const userIds = groups[group];
  (group === 'group1') ? groupName='RNM68-001' : groupName='RNM68-002';
  if (type==="test"){
    console.log("Just testing");
    myMessage = [{type:'text', text:data}];
  }
  else if (type==="sos"){
    myMessage = [{type:'text', text:'กดปุ่ม'}];
  }
  else if (type==="fall") {
    myMessage = [
      {
        type: 'text',
        text: 'แจ้งเตือน: พ่อมึงล้ม มาด่วนๆๆ'
      },
      { 
        type: "location", 
        title: `ตำแหน่งของ ${groupName}`, 
        address: "444 ถ. พญาไท แขวงวังใหม่ Subdistrict กรุงเทพมหานคร 10330" , 
        latitude: 13.743800189357133, 
        longitude: 100.52986543158667
      },
      {
        type: 'text',
        text: 'แถวนี้แหละ ไปๆๆ'
      }
    ]
  }
  else{
    myMessage = [{ type: 'text', text:'vtwi;t??'},{ type: 'text', text:'ไม้เท้าพูดเหี้ยอะไรไม่รู้'}, { type: 'text', text:'error โปรดแจ้งคนทำด่วนๆ'}]
  }
  console.log(data);
  const body = {
    to: userIds,
    messages: myMessage
  }
  fetch('https://api.line.me/v2/bot/message/multicast',{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(body)
  })
  .then(res => res.json())
  .then(data => console.log('Multicast response:', data))
  .catch(err => console.error('Error sending multicast:', err));
  console.log("Message should be sent");
});
app.post('/loading', async (req, res) => {
  try {
    await axios.post('https://api.line.me/v2/bot/chat/loading/start', {
      chatId: userId,
      loadingSeconds: 10
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    res.status(200).send('LINE message sent');
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
    res.status(500).send('Failed to send LINE message');
  }
});
app.post('/webhook', async (req, res) => {
  const event = req.body;
  console.log("Hello from Webhook");
  res.send("Webhook recieved!");
  let myMessage = '';
  console.log(req.body.events[0].type);

  //if user connect account.
  if (event.events[0].type==="follow"){
    replyToken = event.events[0].replyToken;
    const userId = event.events[0].source.userId;
    console.log(userId);
    
    const groups = JSON.parse(fs.readFileSync('user.json', 'utf8'));
    let userGroup = null;

    for (const groupName in groups) {
      if (groups[groupName].includes(userId)) {
        userGroup = groupName;
        break;
      }
    }

    myMessage = [{ type: 'text', text: `คุณเป็นเจ้าของไม้ ${userGroup}`}];
    const dataString = JSON.stringify({
        replyToken: replyToken,
        messages: myMessage
    });
    const headers = {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token}`, 
    };
    const webhookOptions = {
      hostname: "api.line.me",
      path: "/v2/bot/message/reply",
      method: "POST",
      headers: headers,
      body: dataString,
    };
    const request = https.request(webhookOptions, res => {
      res.on("data", (d) => {
        process.stdout.write(d);
      });
    });
    request.on("error", (err) => {
      console.error(err);
    });
    setTimeout(()=> {
      request.write(dataString);
      request.end();
    },5000);
  }
  
  //if user message.
  if (req.body.events[0].type==="message"){
    replyToken = req.body.events[0].replyToken;
    let msg = req.body.events[0].message.text;
    if (msg ==="ลงทะเบียน"){
      myMessage = [{ type: 'text', text: 'https://access.line.me/oauth2/v2.1/login?returnUri=%2Foauth2%2Fv2.1%2Fauthorize%2Fconsent%3Fresponse_type%3Dcode%26client_id%3D2007906010%26redirect_uri%3Dhttps%3A%2F%2Fkk7z5dvk-3000.asse.devtunnels.ms%2Fcallback%26state%3Dgroup1%26scope%3Dprofile%20openid&loginChannelId=2007906010&loginState=pgJIdMHh1GTDc3JD42X0zs'}];
    }
    else if (msg ==="ลงทะเบียน2"){
      myMessage = [{ type: 'text', text: 'https://access.line.me/oauth2/v2.1/login?returnUri=%2Foauth2%2Fv2.1%2Fauthorize%2Fconsent%3Fresponse_type%3Dcode%26client_id%3D2007906010%26redirect_uri%3Dhttps%3A%2F%2Fkk7z5dvk-3000.asse.devtunnels.ms%2Fcallback%26state%3Dgroup2%26scope%3Dprofile%20openid&loginChannelId=2007906010&loginState=pgJIdMHh1GTDc3JD42X0zs'}];
    }
    else if (msg==='สบายดีไหม'){
      myMessage = [{ type: 'text', text: "いや、だいじょぶじゃないです。" }];
    }
    else if (msg==='พ่อกูอยู่ไหน'){
      myMessage = [
        { type: "location", 
          title: "Dad's location", 
          address: "444 ถ. พญาไท แขวงวังใหม่ Subdistrict กรุงเทพมหานคร 10330" , 
          latitude: 13.743800189357133, 
          longitude: 100.52986543158667},
        { type: 'text', text: 'มั้งนะ'},
        { type: 'text', text: 'คือยังไม่ได้ซื้อ gps กุไม่รู้โวย'}
      ];
    }
    else {
      myMessage = [{ type: 'text', text: 'อะไรของมึง'}];
    }

    const dataString = JSON.stringify({
        replyToken: replyToken,
        messages: myMessage
    });
    const headers = {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token}`, 
    };
    const webhookOptions = {
      hostname: "api.line.me",
      path: "/v2/bot/message/reply",
      method: "POST",
      headers: headers,
      body: dataString,
    };
    const request = https.request(webhookOptions, res => {
      res.on("data", (d) => {
        process.stdout.write(d);
      });
    });
    request.on("error", (err) => {
      console.error(err);
    });
    
    setTimeout(()=> {
      request.write(dataString);
      request.end();
    },1000);
  }
});

app.get('/callback', async (req, res)=>{
  const code = req.query.code;
  const state = req.query.state;

  const param = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: process.env.CALLBACK_URL,
      client_id: '2007906010',
      client_secret: 'f45b87561502083a6a847a8fc58e7fab'
    })
  const getToken = await fetch('https://api.line.me/oauth2/v2.1/token', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: param.toString()
  });
  const tokenData = await getToken.json();
  console.log(tokenData);

  const profileRes = await fetch('https://api.line.me/v2/profile', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });
  const profile = await profileRes.json();

  console.log('Profile response:', profile);

  let data = {};
  if (fs.existsSync('user.json')){
    data = JSON.parse(fs.readFileSync('user.json'));
  }

  if (!data[state]) data[state] = [];
  if (!data[state].includes(profile.userId)){
    data[state].push(profile.userId);
  }
  fs.writeFileSync('user.json', JSON.stringify(data, null, 2));
  let groupName;
  (state === 'group1') ? groupName='RNM68-001' : groupName='RNM68-002';
  
  res.send(`ลงทะเบียน "${profile.displayName}" ให้เป็นเจ้าของ ไม้เท้าทดลอง ${groupName} สำเร็จ`);
  }
);



app.listen(PORT, '0.0.0.0', () => {
    app.get('/', (req, res) => {
    res.send('Hello from PC server!');
});
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
app.get('/', (req, res) => {
    res.send('Server is normal, หากคุณเป็นผู้ใช้ทั่วไป คุณไม่ควรเห็นข้อความนี้');
});