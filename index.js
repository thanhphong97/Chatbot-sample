'use strict'

//start by requiring the following packages 

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

//set the port to 8000 (the port we used with ngrok )

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// Process application/json
app.use(bodyParser.json())

// setup a route 
app.get('/', function (req, res) {
    res.send("Hello , I'm a bot ")
});

app.listen(app.get('port'), function () {
    console.log('server running at : ', app.get('port'))
});

//Put any token here like your password for example 
const FACEBOOK_VERIFY_CODE = 'TOKEN';

app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === FACEBOOK_VERIFY_CODE) {
        res.send(req.query['hub.challenge'])
    }
    else {
        res.send('Error : wrong token');
    }
})

const PAGE_ACCESS_TOKEN = 'EAAIb1JRAkFQBAKAWqIPy4SermzWV8hntp2zsjZA13v63xUZBaUd8qXoNzY9oob7Q49Hg1vTjMMFxWpsmQH2AJD9yCJ1m2xnVQRxlmHxs1HgIZAHGep1aATMZArvsivzF3AZA6iEZCurn2RIkspMKZB9yQN3ejgPc7jqXPMHgWue8QHJXWsJR7By';

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
                "text": "Greeting text for default local !"
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
                //res.send(body);
                console.log("setupGreetingText");

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
                        "title": "menu đa cấp",
                        "type": "nested",
                        "call_to_actions": [
                            {
                                "title": "help",
                                "type": "postback",
                                "payload": "HELP_PAYLOAD"
                            },
                            {
                                "type": "web_url",
                                "title": "Truy cập facebook của tao",
                                "url": "http://www.facebook.com/vohuynh.thanhphong.9",
                                "webview_height_ratio": "full"
                            }
                        ]
                    },
                    {
                        "type": "web_url",
                        "title": "Website trường Cao Thắng",
                        "url": "http://www.caothang.edu.vn",
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
                //res.send(body);
                console.log("setupPersistentMenu");

            } else {
                // TODO: Handle errors
                res.send(body);
            }
        });

}


function setupGetStartedButton(res) {
    var messageData = {
        "get_started": {
            "payload": "<postback_payload>"
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
                //res.send(body);
                console.log("setupGetStartedButton");


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

function receivedMessage(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    var messageId = message.mid;

    var messageText = message.text;
    var messageAttachments = message.attachments;
    if (messageText) {

        // If we receive a text message, check to see if it matches a keyword
        // and send back the example. Otherwise, just echo the text we received.
        switch (messageText) {
            case 'help':
                var msg = "mày cần gì ? ";
                sendTextMessage(senderID, msg);
                break;

            default:
                sendTextMessage(senderID, "đéo hiểu !");
                break;
        }
    }
}

function receivedPostback(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var payload = event.postback.payload;
    switch (payload) {
        case 'get_started':
            var msg = " chào cưng nha \n" +
                " anh mày là bot trả lời tự động\n";
            sendTextMessage(senderID, msg);
            break;
        default:
            var msg = "cái này chưa xử lý";
            sendTextMessage(senderID, msg);
            break;
    }

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

        } else {
            console.error("Unable to send message.");
            console.error(response);
            console.error(error);
        }
    });
}