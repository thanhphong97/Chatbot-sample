'use strict'

//start by requiring the following packages 

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const config = require('config');
const crypto = require('crypto');
const MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.json({ verify: verifyRequestSignature }));

// Process application/json
app.use(bodyParser.json())

// App Secret can be retrieved from the App Dashboard
const APP_SECRET = (process.env.MESSENGER_APP_SECRET) ?
    process.env.MESSENGER_APP_SECRET :
    config.get('appSecret');

// Arbitrary value used to validate a webhook
const FACEBOOK_VERIFY_CODE = (process.env.MESSENGER_VALIDATION_TOKEN) ?
    (process.env.MESSENGER_VALIDATION_TOKEN) :
    config.get('validationToken');

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
    (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
    config.get('pageAccessToken');

// URL where the app is running (include protocol). Used to point to scripts and
// assets located at this address.
const SERVER_URL = (process.env.SERVER_URL) ?
    (process.env.SERVER_URL) :
    config.get('serverURL');

if (!(APP_SECRET && FACEBOOK_VERIFY_CODE && PAGE_ACCESS_TOKEN && SERVER_URL)) {
    console.error("xem lại file config");
    process.exit(1);
}




/*
 * Verify that the callback came from Facebook. Using the App Secret from
 * the App Dashboard, we can verify the signature that is sent with each
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
function verifyRequestSignature(req, res, buf) {
    var signature = req.headers["x-hub-signature"];

    if (!signature) {
        // For testing, let's log an error. In production, you should throw an
        // error.
        console.error("Couldn't validate the signature.");
    } else {
        var elements = signature.split('=');
        var method = elements[0];
        var signatureHash = elements[1];

        var expectedHash = crypto.createHmac('sha1', APP_SECRET)
            .update(buf)
            .digest('hex');

        if (signatureHash != expectedHash) {
            throw new Error("Couldn't validate the request signature.");
        }
    }
}

app.listen(app.get('port'), function () {
    console.log('server running at : ', app.get('port'))
});

// setup a route 
app.get('/', function (req, res) {
    res.send("Xin chào, tui là bot đây ")
});

app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === FACEBOOK_VERIFY_CODE) {
        res.send(req.query['hub.challenge'])
    }
    else {
        res.send('Error : wrong token');
    }
})
//cài đặt các thành phần: nút bắt đầu, menu, lời chào
app.get('/setup', function (req, res) {

    setupGetStartedButton(res);
    setupPersistentMenu(res);
    setupGreetingText(res);
});

function setupGreetingText(res) {
    var messageData = {
        "greeting": [
            {
                "locale": "default",
                "text": "Hi {{user_full_name}}! wellcome to my chatbot"
            }
        ]
    };
    request({
        url: 'https://graph.facebook.com/v2.6/me/messenger_profile?access_token=' + PAGE_ACCESS_TOKEN,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        form: messageData
    },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Print out the response body
                //res.send("setup lời chào");
                console.log("setup Greeting");

            } else {
                // TODO: Handle errors
                res.send(body);
            }
        });

}

function setupPersistentMenu(res) {
    var messageData =
    {
        "persistent_menu": [
            {
                "locale": "default",
                "composer_input_disabled": false,
                "call_to_actions": [
                    {
                        "title": "Tuyển sinh 2018",
                        "type": "nested",
                        "call_to_actions": [
                            {
                                "title": "Giới thiệu",
                                "type": "postback",
                                "payload": "GIOI_THIEU_PAYLOAD"
                            },
                            {
                                "title": "Cách đăng ký",
                                "type": "postback",
                                "payload": "DANG_KY_XET_TUYEN_PAYLOAD"
                            },
                            {
                                "title": "Những câu hỏi thường gặp",
                                "type": "postback",
                                "payload": "CAU_HOI_PAYLOAD"
                            }
                        ]
                    },
                    {
                        "type": "web_url",
                        "title": "Website bộ môn tin học",
                        "url": "http://www.cntt.caothang.edu.vn",
                        "webview_height_ratio": "full"
                    }
                ]
            }
        ]
    };
    // Start the request
    request({
        url: "https://graph.facebook.com/v2.6/me/messenger_profile?access_token=" + PAGE_ACCESS_TOKEN,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        form: messageData
    },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Print out the response body
                //res.send('setup Persistent menu');
                console.log("setup Persistent menu");

            } else {
                // TODO: Handle errors
                res.send(body);
            }
        });

}


function setupGetStartedButton(res) {
    var messageData = {
        "get_started": {
            "payload": "GET_STARTED_PAYLOAD"
        }
    };
    // Start the request
    request({
        url: "https://graph.facebook.com/v2.6/me/messenger_profile?access_token=" + PAGE_ACCESS_TOKEN,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        form: messageData
    },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Print out the response body
                //res.send('setup nút bắt đầu');
                console.log("setup GetStarted button");


            } else {
                // TODO: Handle errors
                res.send(body);
            }
        });
}

app.post('/webhook', function (req, res) {
    var data = req.body;

    // Make sure this is a page subscription
    if (data.object === 'page') {


        data.entry.forEach(function (entry) {
            var pageID = entry.id;
            var timeOfEvent = entry.time;

            entry.messaging.forEach(function (event) {
                if (event.message) {

                    receivedMessage(event);

                } else {

                    if (event.postback) {
                        receivedPostback(event);
                    }

                }
            });
        });

        // You should return a 200 status code to Facebook 
        res.sendStatus(200);
    }
});

function firstEntity(nlp, name) {
    return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
}

function receivedMessage(event) {
    var senderID = event.sender.id;
    var message = event.message;
    var intents = firstEntity(message.nlp, 'intent');
    var nganh = firstEntity(message.nlp, 'nganh') || {
        
    };
    console.log(intents);
    if (!intents) {
        var msg = "chúng tôi sẽ sớm trả lời thắt mắt của bạn"
        sendTextMessage(senderID, msg);
        return;
    }
            MongoClient.connect(url, function (err, db) {
                if (err) throw err;
                var dbo = db.db("dbChatBot_Demo2");//chọn db
                var query = { intent: intents.value };
                dbo.collection(nganh.value).findOne(query, function (err, result) {
                    if (err) throw err;
                    else if (result) {//db truy vấn có kq trả về không
                        console.log('query ok!');
                        var msg = result.url;
                        var title = result.title;
                        //sendTextMessage(senderID, msg);
                        sendButtonMessage(senderID,msg,title,'nope');
                    }
                    db.close();
                });
            });
}      
    

function receivedPostback(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var payload = event.postback.payload;
    switch (payload) {
        case 'GET_STARTED_PAYLOAD':
            var msg = " chào cưng nha! \n" +
                " anh mày là bot trả lời tự động\n";
            sendTextMessage(senderID, msg);
            break;
        case 'DANG_KY_XET_TUYEN_PAYLOAD':
            var msg = "http://caothang.edu.vn/bai_viet/Tuyen-sinh-2018-25";
            sendButtonMessage(senderID, msg, "Cách đăng ký xét tuyển của các ngành nghề", payload)
            break;
        case 'GIOI_THIEU_PAYLOAD':
            var msg = "http://caothang.edu.vn/bai_viet/Thong-tin-can-biet-18";
            sendButtonMessage(senderID, msg, "Giới thiệu về các bậc học, ngành nghề trường sẽ tuyến sinh", payload)
            break;
        case 'CAU_HOI_PAYLOAD':
            var msg = "http://caothang.edu.vn/bai_viet/18-Nhung-cau-hoi-thuong-gap-ve-tuyen-sinh-nam-2018-559.html";
            sendButtonMessage(senderID, msg, "Những câu hỏi thường gặp trong tuyển sinh 2018", payload)
            break;
        default:
            var msg = "cái này chưa xử lý";
            sendTextMessage(senderID, msg);
            break;
    }

}


function sendButtonMessage(recipientId, url, title, payload) {

    switch (payload) {
        case 'DANG_KY_XET_TUYEN_PAYLOAD':
            var messageData = {
                recipient: {
                    id: recipientId
                },
                message: {
                    attachment: {
                        type: "template",
                        payload: {
                            template_type: "generic",
                            elements: [
                                {
                                    title: title,
                                    image_url: "https://scontent.fsgn5-5.fna.fbcdn.net/v/t1.0-1/p200x200/29313930_922577844566702_3312368204189270016_n.png?_nc_cat=0&oh=1581cbf49833a4b4dd63f637ca53af6a&oe=5BEC6895",
                                    buttons: [
                                        {
                                            type: "web_url",
                                            url: "http://caothang.edu.vn/bai_viet/25-Tuyen-Sinh-CAO-DANG-Cac-Nganh-2018-548.html",
                                            title: "Bậc Cao đẳng"
                                        },
                                        {
                                            type: "web_url",
                                            url: "http://caothang.edu.vn/bai_viet/25-Tuyen-Sinh-CAO-DANG-Cac-Nghe-2018-(Cao-Dang-Nghe-Cu)-549.html",
                                            title: "Bậc Cao đẳng nghề"
                                        },
                                        {
                                            type: "web_url",
                                            url: "http://caothang.edu.vn/bai_viet/25-Tuyen-Sinh-TRUNG-CAP-2018-550.html",
                                            title: "Bậc Trung cấp"
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                }
            };
            break;
        case 'GIOI_THIEU_PAYLOAD':
            var messageData = {
                recipient: {
                    id: recipientId
                },
                message: {
                    attachment: {
                        type: "template",
                        payload: {
                            template_type: "generic",
                            elements: [
                                {
                                    title: title,
                                    image_url: "https://scontent.fsgn5-5.fna.fbcdn.net/v/t1.0-1/p200x200/29313930_922577844566702_3312368204189270016_n.png?_nc_cat=0&oh=1581cbf49833a4b4dd63f637ca53af6a&oe=5BEC6895",
                                    buttons: [
                                        {
                                            type: "web_url",
                                            url: "http://caothang.edu.vn/bai_viet/18-Gioi-thieu-cac-nganh_nghe_-Bac-Cao-dang-cac-nganh-78.html",
                                            title: "Bậc Cao đẳng"
                                        },
                                        {
                                            type: "web_url",
                                            url: "http://caothang.edu.vn/bai_viet/18-Gioi-thieu-cac-nganh_nghe_-Bac-Cao-dang-cac-nghe-552.html",
                                            title: "Bậc Cao đẳng nghề"
                                        },
                                        {
                                            type: "web_url",
                                            url: "http://caothang.edu.vn/bai_viet/18-Gioi-thieu-cac-nganh-bac-Trung-cap-553.html",
                                            title: "Bậc Trung cấp"
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                }
            };
            break;
        case 'CAU_HOI_PAYLOAD':
            var messageData = {
                recipient: {
                    id: recipientId
                },
                message: {
                    attachment: {
                        type: "template",
                        payload: {
                            template_type: "button",
                            text: title,
                            buttons: [{
                                type: "web_url",
                                url: url,
                                title: "Truy cập"
                            }]
                        }
                    }
                }
            }
            break;
        default:
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: title,
                        buttons: [{
                            type: "web_url",
                            url: url,
                            title: "Truy cập"
                        }]
                    }
                }
            }
        }
            break;
    }

    callSendAPI(messageData);
}

function sendTextMessage(recipientId, messageText) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: messageText
        }
    };
    // call the send API
    callSendAPI(messageData);
}

function callSendAPI(messageData) {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: messageData

    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var recipientId = body.recipient_id;
            var messageId = body.message_id;
            //successfull
            console.log('sent message successfull');


        } else {
            console.error("Unable to send message.");
            console.error(response);
            console.error(error);
        }
    });
}