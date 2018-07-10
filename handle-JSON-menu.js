const fs = require('fs');

let submenu = [];
let submenu_item = [];
let buttonURL = [];
let results = {
    data: [
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
                                            "type": "web_url",
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
        }
    ]
};


let items = results.data[0].persistent_menu[0].call_to_actions;

submenu.push(items[0]);
console.log('submenu '+ submenu[0].title +' bao gom:');
console.log(submenu);
console.log('---------------------');


buttonURL.push(items[1]);
console.log('button url '+buttonURL[0].title+' bao gom');
console.log(buttonURL);
console.log('--------------------');
// for (var i in submenu[i].call_to_actions) {
//     submenu_item.push(submenu[i].call_to_actions[i]);
// }
let err = results.data[0].persistent_menu[0].call_to_actions[0].call_to_actions[4].call_to_actions[1].url;
console.log('lõi ' + err);
console.log('-------------');

for (let i = 0; i < submenu[0].call_to_actions.length; i++) {
    if(submenu[0].call_to_actions[i].type == 'nested'){
        for(let j = 0; j < submenu[0].call_to_actions[i].call_to_actions.length; j++){
            let title = 'item' + j;
            let item = `{${title}: ${JSON.stringify(submenu[0].call_to_actions[i].call_to_actions[j])}}`;
            submenu_item.push(item);
        }
    }else{
        submenu_item.push(submenu[0].call_to_actions[i]);
    }
    
}

console.log('submenu_item');
for (const i in submenu_item) {
    if (submenu_item.hasOwnProperty(i)) {
        // console.log('item['+i+']');
        console.log(submenu_item[i]);
    }
}