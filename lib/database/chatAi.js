var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const axios = require("axios")
/**
 * Scraped By Kaviaann
 * Protected By MIT LICENSE
 * Whoever caught removing wm will be sued
 * @description Any Request? Contact me : vielynian@gmail.com
 * @author Kaviaann 2024
 * @copyright https://whatsapp.com/channel/0029Vac0YNgAjPXNKPXCvE2e
 */
async function englishAi() {
    return __awaiter(this, arguments, void 0, function* (chat = [
        {
            content: "you are alya, your goal is to help the user about their problems",
            role: "user",
        },
        {
            content: "hi! what can i help you today?⭐",
            role: "assistant",
            refusal: null,
        },
        {
            content: "what is your name?",
            role: "user",
        },
    ]) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!chat || !Array.isArray(chat) || chat.length < 1)
                    return reject(Error("Enter valid chat object [ IEnglishAiChat ]"));
                const a = yield axios
                    .post("https://api.deepenglish.com/api/gpt/chat", {
                    messages: chat,
                    temperature: 0.9,
                }, {
                    headers: {
                        Origin: "https://members.deepenglish.com",
                        Referer: "https://members.deepenglish.com/",
                        Host: "api.deepenglish.com",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
                    },
                })
                    .then((v) => v.data);
                const p = chat;
                yield p.push(yield a.data.choices.shift().message);
                return yield resolve({
                    history: [...p],
                    response: (yield ((_a = p.pop()) === null || _a === void 0 ? void 0 : _a.content)) || "",
                });
            }
            catch (e) {
                reject(e);
            }
        }));
    });
}
module.exports.englishAi = englishAi