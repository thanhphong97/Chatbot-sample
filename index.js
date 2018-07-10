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
            },
            {
                "locale": "vi_VN",
                "text": "Xin chào {{user_full_name}}! Đây là chatbot trả lời tự động"
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
                        "type": "nested",
                        "title": "Thông tin",
                        "call_to_actions": [
                            {
                                "type": "nested",
                                "title": "Giới thiệu",
                                "call_to_actions": [
                                    {
                                        "type": "web_url",
                                        "title": "Ngành công nghệ thông tin",
                                        "url": "http://cntt.caothang.edu.vn/tam-nhin-su-mang/",
                                        "webview_height_ratio": "full"
                                    },
                                    {
                                        "type": "web_url",
                                        "title": "Bộ môn tin học",
                                        "url": "http://cntt.caothang.edu.vn/gioi-thieu-chung/",
                                        "webview_height_ratio": "full"
                                    },
                                    {
                                        "type": "web_url",
                                        "title": "Khoa Điện Tử - Tin Học",
                                        "url": "http://dtth.caothang.edu.vn/index.php/gioi-thieu/lich-su-phat-trien",
                                        "webview_height_ratio": "full"
                                    },
                                    {
                                        "type": "web_url",
                                        "title": "Trường CĐKT Cao Thắng",
                                        "url": "http://caothang.edu.vn/bai_viet/Gioi-thieu-chung-5",
                                        "webview_height_ratio": "full"
                                    }
                                ]
                            },
                            {
                                "type": "nested",
                                "title": "Tuyến sinh 2018",
                                "call_to_actions": [
                                    {
                                        "type": "postback",
                                        "title": "Ngành công nghệ thông tin",
                                        "payload": "TUYEN_SINH_CNTT_PAYLOAD"
                                    },
                                    {
                                        "type": "postback",
                                        "title": "Hướng dẫn đăng ký",
                                        "payload": "DANG_KY_XET_TUYEN_PAYLOAD"
                                    },
                                    {
                                        "type": "postback",
                                        "title": "Những cầu hỏi thường gặp",
                                        "payload": "CAU_HOI_PAYLOAD"
                                    },
                                    {
                                        "type": "postback",
                                        "title": "Điểm chuẩn 2018",
                                        "payload": "DIEM_CHUAN_PAYLOAD"
                                    }
                                ]
                            },
                            {
                                "type": "web_url",
                                "title": "Thời khóa biểu",
                                "url": "http://daotao.caothang.edu.vn/bai-viet/63-Thoi-khoa-bieu-hoc-ky-2-nam-hoc-2017-2018-a4e96b03feaf3b588e2e07a62a6bf78d.html",
                                "webview_height_ratio": "full"
                            },
                            {
                                "type": "web_url",
                                "title": "Tra cứu kết quả học tập",
                                "url": "http://cntt.caothang.edu.vn/tra-cuu-ket-qua-hoc-tap/",
                                "webview_height_ratio": "full"
                            },
                            {
                                "type": "nested",
                                "title": "Thông tin khác",
                                "call_to_actions": [
                                    {
                                        "type": "web_url",
                                        "title": "Trung tâm tin học",
                                        "url": "http://ttth.caothang.edu.vn/",
                                        "webview_height_ratio": "full"
                                    },
                                    {
                                        "type": "web_url",
                                        "title": "Trung tâm ngoại ngữ",
                                        "url": "http://englishcenter.caothang.edu.vn/",
                                        "webview_height_ratio": "full"
                                    },
                                    {
                                       "type": 'web_url',
                                       "title": "Khoa giáo dục đại cương",
                                       "url": "http://gddc.caothang.edu.vn/",
                                       "webview_height_ratio": "full"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "type": "web_url",
                        "title": "Website bộ môn tin học",
                        "url": "http://www.cntt.caothang.edu.vn/",
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
    var nganh = firstEntity(message.nlp, 'nganh');
    if (!intents) {
        var msg = " Cám ơn bạn! \n" +
        "Chúng tôi sẽ sớm trả lời thắt mắc của bạn về chủ đề \"" + message.text + "\"";
        //guiMail(message.text, senderID);
        sendTextMessage(senderID, msg);
        return;
    }
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("dbChatBot_Demo2");//chọn db
        var query = { intent: intents.value };
        dbo.collection('cong_nghe_thong_tin').findOne(query, function (err, result) {
            if (err) throw err;
            else if (result) {//db truy vấn có kq trả về không
                console.log('query ok!');
                var msg = result.url;
                var title = result.title;
                sendButtonMessage(senderID, msg, title, 'nope');
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
            var msg = " Chào bạn! \n" +
                "Bạn cần giúp đỡ việc gì\n" +
                "Hãy tham khảo các thông tin có sẵn ở phần menu";
            sendTextMessage(senderID, msg);
            break;
        case 'DANG_KY_XET_TUYEN_PAYLOAD':
            var msg = "http://caothang.edu.vn/bai_viet/Tuyen-sinh-2018-25";
            var title = 'Cách đăng ký xét tuyển của các ngành nghề';
            sendButtonMessage(senderID, msg, title, payload)
            break;
        case 'GIOI_THIEU_PAYLOAD':
            var msg = "http://caothang.edu.vn/bai_viet/Thong-tin-can-biet-18";
            var title = "Giới thiệu về các bậc học, ngành nghề trường sẽ tuyến sinh";
            sendButtonMessage(senderID, msg, title, payload)
            break;
        case 'CAU_HOI_PAYLOAD':
            var msg = "http://caothang.edu.vn/bai_viet/18-Nhung-cau-hoi-thuong-gap-ve-tuyen-sinh-nam-2018-559.html";
            var title = "Những câu hỏi thường gặp trong tuyển sinh 2018";
            sendButtonMessage(senderID, msg, title, payload)
            break;
        case 'TUYEN_SINH_CNTT_PAYLOAD':
            var msg;
            var title ="Tuyển sinh ngành công nghệ thông tin năm 2018";
            sendButtonMessage(senderID,msg,title,payload);
            break;

        // case 'DIEM_CHUAN_PAYLOAD':
        //     var msg; DIEM_CHUAN_PAYLOAD
        //     var title;
        //     break;
        default:
            var msg = "Thông tin này sẽ được sớm cập nhật, vui lòng thử lại sau";
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
        case 'TUYEN_SINH_CNTT_PAYLOAD':
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
                                    "title": "THÔNG BÁO TUYỂN SINH CAO ĐẲNG CÔNG NGHỆ THÔNG TIN CHÍNH QUY NĂM 2018",
                                    "image_url": "https://scontent.fsgn5-5.fna.fbcdn.net/v/t1.0-1/p200x200/29313930_922577844566702_3312368204189270016_n.png?_nc_cat=0&oh=1581cbf49833a4b4dd63f637ca53af6a&oe=5BEC6895",
                                    "buttons": [
                                        {
                                            "type": "web_url",
                                            "url": "http://cntt.caothang.edu.vn/thong-bao-tuyen-sinh-cao-dang-cong-nghe-thong-tin-chinh-quy-nam-2018/",
                                            "title": "Xem chi tiết"
                                        }
                                    ]
                                },
                                {
                                    "title": "THÔNG BÁO TUYỂN SINH CAO ĐẲNG QUẢN TRỊ MẠNG MÁY TÍNH VÀ SỬA CHỮA LẮP RÁP MÁY TÍNH CHÍNH QUY NĂM 2018",
                                    "image_url": "https://scontent.fsgn5-5.fna.fbcdn.net/v/t1.0-1/p200x200/29313930_922577844566702_3312368204189270016_n.png?_nc_cat=0&oh=1581cbf49833a4b4dd63f637ca53af6a&oe=5BEC6895",
                                    "buttons": [
                                        {
                                            "type": "web_url",
                                            "url": "http://cntt.caothang.edu.vn/thong-bao-tuyen-sinh-cao-dang-quan-tri-mang-may-tinh-chinh-quy-nam-2018/",
                                            "title": "Cao Đẳng Quảng Trị Mạng"
                                        },
                                        {
                                            "type": "web_url",
                                            "url": "http://cntt.caothang.edu.vn/thong-bao-tuyen-sinh-cao-dang-sua-chua-lap-rap-may-tinh-chinh-quy-nam-2018/",
                                            "title": "Cao Đẳng SCLRMT"
                                        }
                                    ]
                                },
                                {
                                    "title": "THÔNG BÁO TUYỂN SINH TRUNG CẤP CHUYÊN NGHIỆP CÔNG NGHỆ THÔNG TIN NĂM 2018",
                                    "image_url": "https://scontent.fsgn5-5.fna.fbcdn.net/v/t1.0-1/p200x200/29313930_922577844566702_3312368204189270016_n.png?_nc_cat=0&oh=1581cbf49833a4b4dd63f637ca53af6a&oe=5BEC6895",
                                    "buttons": [
                                        {
                                            "type": "web_url",
                                            "url": "http://cntt.caothang.edu.vn/thong-bao-tuyen-sinh-trung-cap-chuyen-nghiep-cong-nghe-thong-tin-nam-2018/",
                                            "title": "Xem chi tiết"
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

//gửi mail
const nodemailer = require('nodemailer'); // khai báo sử dụng module nodemailer
function guiMail(msg, nguoigui) {
    nodemailer.createTestAccount((err, account) => {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 456,
            secure: true, // true for 465, false for other ports
            auth: {
                user: 'mrcafein@gmail.com', // generated ethereal user
                pass: '01682665238ovi' // generated ethereal password
            }
        });
        // setup email data with unicode symbols
        let mailOptions = {
            from: '"Phong 👻" <foo@example.com>', // sender address
            to: 'vophong2309@gmail.com', // list of receivers
            subject: 'Hello ✔', // Subject line
            text: 'Hello world?', // plain text body
            html: '<b>Hello world?</b>' // html body
        };
    
        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        });
    });
}