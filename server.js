require("./settings/config")
require('./lib/database/logic.js')
const {
  getGroupAdmins,
  jsonformat,
  runtime,
  getBuffer,
  fetchJson,
  parseMention,
  TelegraPh,
  sizeString,
  isUrl,
  getRandom,
  sleep,
} = require("./lib/database/function")

const {
  proto,
  prepareWAMessageMedia,
  MessageType,
  getDevice,
  biley,
  downloadContentFromMessage,
  generateWAMessageFromContent,
  generateMessageID,
} = require("@whiskeysockets/baileys")

module.exports = sock = async (sock, m, chatUpdate, store) => {
  try {
    var body =
    m.mtype === "conversation" ? m.message.conversation :
    m.mtype == "imageMessage" ? m.message.imageMessage.caption :
    m.mtype == "videoMessage" ? m.message.videoMessage.caption :
    m.mtype == "extendedTextMessage" ? m.message.extendedTextMessage.text :
    m.mtype == "buttonsResponseMessage" ? m.message.buttonsResponseMessage.selectedButtonId :
    m.mtype == "listResponseMessage" ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
    m.mtype == "templateButtonReplyMessage" ? m.message.templateButtonReplyMessage.selectedId :
    m.mtype === "messageContextInfo" ?
    m.message.buttonsResponseMessage?.selectedButtonId ||
    m.message.listResponseMessage?.singleSelectReply.selectedRowId ||
    m.message.InteractiveResponseMessage.NativeFlowResponseMessage || m.text : ""
    
    var budy = typeof m.text == "string" ? m.text : ""
    var prefix = ['.', '/'] ? /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi.test(body) ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi)[0] : "" : jprefix
    const isCmd = body.startsWith(prefix)
    const type = Object.keys(m.message)[0]
    const command = isCmd ? body.slice(prefix.length).trim().split(" ").shift().toLowerCase() : ""
    const args = body.trim().split(/ +/).slice(1)
    const sockId = await sock.decodeJid(sock.user.id)
    const fs = require("fs")
    const util = require("util")
    const axios = require("axios")
    const cheerio = require("cheerio")
    const figlet = require("figlet")
    const chalk = require("chalk")
    const { format } = require('util')
    const speed = require("performance-now")
    const moment = require("moment-timezone")
    const { englishAi } = require('./lib/database/chatAi.js')   
    
    const { exec, spawn, execSync } = require("child_process")
    const tanggal = moment().tz("Asia/Jakarta").format("ll")
    const ffmpegkntl = require("fluent-ffmpeg")
    const botNumber = sockId.split("@")[0]
    const ownId = ownNumb.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
    const ownNumber = ownNumb.replace(/[^0-9]/g, "")
    const dtext = text = q =  (text = args.join(" "))
    const quoted = m.quoted ? m.quoted : m
    const from = sender = m.key.remoteJid
    const mime = (quoted.msg || quoted).mimetype || ""
    const groupMetadata = m.isGroup ? await sock.groupMetadata(m.chat).catch((e) => { }) : ""
    
    const senderName = m.pushName || m.sender
    const groupName = m.isGroup ? groupMetadata.subject : "";
    const groupDescription = m.isGroup ? groupMetadata.desc : ""
    const participants = m.isGroup ? await groupMetadata.participants : ""
    const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : ""
    const isGroupAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false
    const isBotGroupAdmins = m.isGroup ? groupAdmins.includes(sockId) : false
    const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false
    const isGroup = m.chat.endsWith("@g.us")
    
    const numberQuery = m.text.replace(new RegExp("[()+-/ +/]", "gi"), "") + "@s.whatsapp.net"
    const mentionByTag = m.type == "extendedTextMessage" && message.extendedTextMessage.contextInfo != null ? message.extendedTextMessage.contextInfo.mentionedJid : []
    const Input = mentionByTag[0] ? mentionByTag[0] : dtext ? numberQuery : false
    const content = JSON.stringify(m.message)
    var isAuthor = autOwn.replace(/[^0-9]/g, "").includes(m.sender.split("@")[0])
    var isOwner = ownId.includes(m.sender)
    var isMe = sockId.includes(m.sender)
    var isCreator = isOwner || isAuthor || isMe
    
    //==================Function m.reply=================//
    
    m.reply = (text, chatId = m.chat, options = {}) =>
    Buffer.isBuffer(text) ? sock.sendMedia(chatId, text, "file", "", m, { ...options }) : sock.sendText(chatId, text, m, { ...options })

    //==================Function reply=================//
    
    const reply = (text) => {
      sock.sendMessage(m.chat, { text: text.toString() }, { quoted: m })
    }
    
    const ai = (teks) => {
      sock.sendMessage(m.chat, { text: teks, contextInfo: { mentionedJid: [m.sender], isForwarded: true, forwardingScore: '99999999999999', forwardedNewsletterMessageInfo: { newsletterJid: '120363276657866274@newsletter', newsletterName: 'Saya Menggunakan WhatsApp', serverMessageId: -1 }}}, {quoted:m})
    }
    
    //==================Moment-timezone================//
    
    const hariini = moment.tz('Asia/Jakarta').format('dddd, DD MMMM YYYY')
    const wib = moment.tz('Asia/Jakarta').format('HH : mm : ss')
    const wit = moment.tz('Asia/Jayapura').format('HH : mm : ss')
    const wita = moment.tz('Asia/Makassar').format('HH : mm : ss')
    const time2 = moment().tz('Asia/Jakarta').format('HH:mm:ss')
    
    if(time2 < "23:59:00") {
      var ucapanWaktu = 'Selamat Malam 🏙️'
    }
    if(time2 < "19:00:00") {
      var ucapanWaktu = 'Selamat Petang 🌆'
    }
    if(time2 < "18:00:00") {
      var ucapanWaktu = 'Selamat Sore 🌇'
    }
    if(time2 < "15:00:00") {
      var ucapanWaktu = 'Selamat Siang 🌤️'
    }
    if(time2 < "10:00:00") {
      var ucapanWaktu = 'Selamat Pagi 🌄'
    }
    if(time2 < "05:00:00") {
      var ucapanWaktu = 'Selamat Subuh 🌆'
    }
    if(time2 < "03:00:00") {
      var ucapanWaktu = 'Selamat Tengah Malam 🌃'
    }
        
    //==================Color=================//
    
    const color = (text, color) => {
      return !color ? chalk.green(text) : chalk.keyword(color)(text)
    }
    const bgcolor = (text, bgcolor) => {
      return !color ? chalk.green(text) : chalk.keyword(color)(text)
    }
        
    //==================Database=================//
    
    const mute = require("./event/mute.json")
    const isMute = mute.includes(m.chat) ? true : false
    if (m.isGroup && isMute && !isCreator) {
      return
    }
    
    
    //==================Function alya=================//
    
    async function alya(txt) {
      const alya = global.image[Math.floor(Math.random() * global.image.length)]
      const pik = {
        contextInfo: {
          mentionedJid: [m.sender],
          externalAdReply: {
            showAdAttribution: true,
            title: 'Bot alya-x9',
            body: '@ copyright x9',
            thumbnailUrl: alya,
            mediaType: 1,
            renderLargerThumbnail: false
          },
        },
        text: txt,
      }
      return sock.sendMessage(m.chat, pik, { quoted: m })
    }
    
    //==================Function PickRandom=================//
    
    function pickRandom(list) {
      return list[Math.floor(Math.random() * list.length)]
    }
    
    //==================Function Url=================//

    const isUrl = (url) => {
      return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.~#?&/=]*)/, "gi"))
    }
    
    //==================ReactionMessage=================//
    
    const reactionMessage =
      require("@whiskeysockets/baileys").proto.Message.ReactionMessage.create({
        key: m.key,
        text: "",
      })
      
      //==================Extended=================//

    const isMedia = type === "imageMessage" || type === "videoMessage"
    const isQuotedImage =
      type === "extendedTextMessage" && content.includes("imageMessage")
    const isQuotedVideo =
      type === "extendedTextMessage" && content.includes("videoMessage")
    const isQuotedAudio =
      type === "extendedTextMessage" && content.includes("audioMessage")
    const isQuotedSticker =
      type === "extendedTextMessage" && content.includes("stickerMessage")

    async function downloadAndSaveMediaMessage(type_file, path_file) {
      if (type_file === "image") {
        var stream = await downloadContentFromMessage(
          msg.message.imageMessage ||
          msg.message.extendedTextMessage?.contextInfo.quotedMessage
            .imageMessage,
          "image",
        )
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk])
        }
        fs.writeFileSync(path_file, buffer)
        return path_file
      } else if (type_file === "video") {
        var stream = await downloadContentFromMessage(
          msg.message.videoMessage ||
          msg.message.extendedTextMessage?.contextInfo.quotedMessage
            .videoMessage,
          "video",
        )
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk])
        }
        fs.writeFileSync(path_file, buffer)
        return path_file
      } else if (type_file === "sticker") {
        var stream = await downloadContentFromMessage(
          msg.message.stickerMessage ||
          msg.message.extendedTextMessage?.contextInfo.quotedMessage
            .stickerMessage,
          "sticker",
        )
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk])
        }
        fs.writeFileSync(path_file, buffer)
        return path_file
      } else if (type_file === "audio") {
        var stream = await downloadContentFromMessage(
          msg.message.audioMessage ||
          msg.message.extendedTextMessage?.contextInfo.quotedMessage
            .audioMessage,
          "audio",
        )
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk])
        }
        fs.writeFileSync(path_file, buffer)
        return path_file
      }
    }
    
    //==================Consol=================//

    if (command) {
      console.log(
      chalk.black(chalk.bgWhite('[ PESAN ]')),
      chalk.black(chalk.bgRed(budy || m.mtype)) +
      '\n' +
      chalk.magenta("$ [ FROM ]"),
      chalk.green(m.pushName),
      '\n' +
      chalk.blueBright("$ [ GROUP ]"),
      chalk.green(m.isGroup ? groupMetadata.subject : 'Private Chat') +
      "\n" +
      chalk.yellow.bold('<======================================================>')
      )
    }
    

    let timestamp = speed()
    let latensi = speed() - timestamp
       
    if (!sock.public) {
      if (!isCreator) return
    }
    
    if (global.autoTyping) {
    if (command) { sock.sendPresenceUpdate('composing', from)}}
    
    if (!global.db) global.db = { data: { chats: {} } };
    if (!global.db.data) global.db.data = { chats: {} };
    if (!global.db.data.chats) global.db.data.chats = {};

    let chats = global.db.data.chats[m.chat];
    if (typeof chats !== 'object') global.db.data.chats[m.chat] = {};
    chats = global.db.data.chats[m.chat]; // Update after initializing if needed
    if (chats) {
      if (!('autoai' in chats)) chats.autoai = true;
    } else {
      global.db.data.chats[m.chat] = {
        autoai: true,
      };
    }
    
    switch (command) {
      
      case 'sendimg': {
        sock.sendMessage(m.chat, { image: { url: dtext }}, { quoted: m })
      }
      break
      
      case 'pinterest': {
        try {
          const api = await fetchJson(`https://api.lolhuman.xyz/api/pinterestdl?apikey=${lol}&url=${dtext}`);
          sock.sendMessage(m.chat, {image: {url: api.result }})
        } catch (error) {
          m.reply("gagal")
        }
      }
      break
    
      case 'ai':
        m.reply("hallom3k")
      break;
      
      
      //==================Bash=================//
      
      default:
              
      if (budy.startsWith("=>")) {
        if (!isOwner) return
        console.log(chalk.bgBlue("[ B A S H ]"))
        try {
          let evaled = await eval(budy.slice(2))
          if (typeof evaled !== "string")
          evaled = require("util").inspect(evaled)
          await m.reply(evaled)
        } catch (err) {
          await reply(String(err))
        }
      }
      
      if (body.startsWith('>')) {
          if (!isOwner) return;
          console.log("E V A L3")
          function _(stdout) {
            reply(`${stdout}`)
          }
          let ev_kode = m.body.trim().split(/ +/)[0];
          let ev_teks;
          try {
            ev_teks = await eval(`(async () => { ${ev_kode == ">>" ? "return" : ""} ${text}})()`);
          } catch (e) {
            ev_teks = e;
          } finally {
            await _(require("util").format(ev_teks).trim());
          }
        }
      
      //==================Exec=================//

      if (budy.startsWith("$")) {
        if (!isOwner) return
        console.log(chalk.bgBlue("[ E X E C ]"))
        require("child_process").exec(budy.slice(2), (err, stdout) => {
          if (err) return reply(`${err}`)
          if (stdout) return reply(stdout)
        })
      }
    }
  } catch (err) {
    const errId = isOwner ? m.chat : ownNumb.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
    sock.sendMessage(errId, { text: require("util").format(err) }, { quoted: m })
    console.log("\x1b[1;31m" + err + "\x1b[0m")
  }
}

let file = require.resolve(__filename)
require("fs").watchFile(file, () => {
  require("fs").unwatchFile(file)
  console.log("\x1b[0;32m" + __filename + " \x1b[1;32mupdated!\x1b[0m")
  delete require.cache[file]
  require(file)
})