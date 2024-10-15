require('./settings/config')
const { 
  default: sockConnect, 
  useMultiFileAuthState, 
  DisconnectReason, 
  fetchLatestBaileysVersion, 
  generateForwardMessageContent, 
  prepareWAMessageMedia, 
  generateWAMessageFromContent, 
  generateMessageID, 
  downloadContentFromMessage, 
  makeInMemoryStore,
  PHONENUMBER_MCC,
  jidDecode, 
  proto, 
  getAggregateVotesInPollMessage
} = require("@whiskeysockets/baileys")
const pino = require('pino')
const chalk = require('chalk')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const FileType = require('file-type')
const PhoneNumber = require('awesome-phonenumber')
const NodeCache = require("node-cache")
const readline = require("readline")
const path = require('path')

const pairing = process.argv.includes("--pairing-code")
const rline = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rline.question(text, resolve))
const store = makeInMemoryStore({
	logger: pino().child({ level: 'silent', stream: 'store' })
})

const color = (text, color) => {
  return !color ? chalk.green(text) : chalk.keyword(color)(text)
}

const {
    smsg,
    sleep,
    runtime,
    getBuffer,
    jsonformat,
    format,
    parseMention,
    getSizeMedia,
    getGroupAdmins
} = require('./lib/database/function')

async function startBotz() {
    const { state, saveCreds } = await useMultiFileAuthState('./session')
    const msgRetryCounterCache = new NodeCache()
    
    const sock = sockConnect({
        printQRInTerminal: !pairing,
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "20.0.4"],
        auth: state,
        generateHighQualityLinkPreview: true,
        getMessage: async (key) => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id)
                return msg.message || undefined
            }
            return {
                conversation: "hi im Asakura"
            }
        },
        msgRetryCounterCache
    })
    
    if (pairing && !sock.authState.creds.registered) {
    console.log(chalk.cyan('╭──────────────────────────────────────···'));
    console.log(`📨 ${chalk.redBright('Please type your WhatsApp number')}:`);
    console.log(chalk.cyan('├──────────────────────────────────────···'));
	let phoneNumber = await question(`   ${chalk.cyan('- Number')}: `);
	console.log(chalk.cyan('╰──────────────────────────────────────···'));
	phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
	if (!Object.keys(PHONENUMBER_MCC).some(a => phoneNumber.startsWith(a))) {
	console.log(chalk.cyan('╭─────────────────────────────────────────────────···'));
    console.log(`💬 ${chalk.redBright("Start with your country's WhatsApp code, Example 62xxx")}:`);
    console.log(chalk.cyan('╰─────────────────────────────────────────────────···'));
    console.log(chalk.cyan('╭──────────────────────────────────────···'));
    console.log(`📨 ${chalk.redBright('Please type your WhatsApp number')}:`);
    console.log(chalk.cyan('├──────────────────────────────────────···'));
    phoneNumber = await question(`   ${chalk.cyan('- Number')}: `);
    console.log(chalk.cyan('╰──────────────────────────────────────···'));
	phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
	}
	let code = await sock.requestPairingCode(phoneNumber)
	console.log(chalk.cyan('╭──────────────────────────────────────···'));
    console.log(` 💻 ${chalk.redBright('Your Pairing Code')}:`);
    console.log(chalk.cyan('├──────────────────────────────────────···'));
    console.log(`   ${chalk.cyan('- Code')}: ${code}`);
    console.log(chalk.cyan('╰──────────────────────────────────────···'));
	rline.close()
	}

    store.bind(sock.ev)
    
    sock.ev.on('call', async (caller) => {
	    console.log(caller)
    })

    sock.ev.on('messages.upsert', async chatUpdate => {
        try {
        msg = chatUpdate.messages[0]
        if (!msg.message) return
        msg.message = (Object.keys(msg.message)[0] === 'ephemeralMessage') ? msg.message.ephemeralMessage.message : msg.message
        if (!sock.public && !msg.key.fromMe && chatUpdate.type === 'notify') return
        if (msg.key.id.startsWith('BAE5') && msg.key.id.length === 16) return
        m = smsg(sock, msg, store)
        require("./server.js")(sock, m, chatUpdate, store)
        } catch (err) {
            console.log(err)
        }
    })

    sock.ev.on("group-participants.update", async (anu) => {
      console.log(anu)
    })
	
    // Setting
    sock.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }
    
    sock.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = sock.decodeJid(contact.id)
            if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
        }
    })

    sock.getName = (jid, withoutContact  = false) => {
        id = sock.decodeJid(jid)
        withoutContact = sock.withoutContact || withoutContact 
        let v
        if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
            v = store.contacts[id] || {}
            if (!(v.name || v.subject)) v = sock.groupMetadata(id) || {}
            resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = id === '0@s.whatsapp.net' ? {
            id,
            name: 'WhatsApp'
        } : id === sock.decodeJid(sock.user.id) ?
            sock.user :
            (store.contacts[id] || {})
            return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }
    
    sock.sendContact = async (jid, kon, quoted = '', opts = {}) => {
	let list = []
	for (let i of kon) {
	    list.push({
	    	displayName: await sock.getName(i),
	    	vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await sock.getName(i)}\nFN:${await sock.getName(i)}\nitem1.TEL;waid=${i.split('@')[0]}:${i.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
	    })
	}
	sock.sendMessage(jid, { contacts: { displayName: `${list.length} Kontak`, contacts: list }, ...opts }, { quoted })
    }
    
    sock.public = true
    sock.serializeM = (m) => smsg(sock, m, store)

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update	    
        if (connection === 'close') {
        let reason = new Boom(lastDisconnect?.error)?.output.statusCode
            if (reason === DisconnectReason.badSession) { console.log(`Bad Session File, Please Delete Session and Scan Again`); sock.logout(); }
            else if (reason === DisconnectReason.connectionClosed) { console.log("Connection closed, reconnecting...."); startBotz(); }
            else if (reason === DisconnectReason.connectionLost) { console.log("Connection Lost from Server, reconnecting..."); startBotz(); }
            else if (reason === DisconnectReason.connectionReplaced) { console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First"); sock.logout(); }
            else if (reason === DisconnectReason.loggedOut) { console.log(`Device Logged Out, Please Scan Again And Run.`); sock.logout(); }
            else if (reason === DisconnectReason.restartRequired) { console.log("Restart Required, Restarting..."); startBotz(); }
            else if (reason === DisconnectReason.timedOut) { console.log("Connection TimedOut, Reconnecting..."); startBotz(); }
            else if (reason === DisconnectReason.Multidevicemismatch) { console.log("Multi device mismatch, please scan again"); sock.logout(); }
            else sock.end(`Unknown DisconnectReason: ${reason}|${connection}`)
        }
        console.log('Connected...', update)
    })

    sock.ev.on('creds.update', saveCreds)

    /**
     * 
     * @param {*} jid 
     * @param {*} message 
     * @param {*} forceForward 
     * @param {*} options 
     * @returns 
     */
     
     sock.sendImage = async (jid, path, caption = '', quoted = '', options) => {
     let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
     return await sock.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted })}
     
     sock.sendText = (jid, text, quoted = '', options) => sock.sendMessage(jid, { text: text, ...options }, { quoted })
     
     sock.sendTextWithMentions = async (jid, text, quoted, options = {}) => sock.sendMessage(jid, { text: text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, ...options }, { quoted })
     
     sock.copyNForward = async (jid, message, forceForward = false, options = {}) => {
        let vtype
		if (options.readViewOnce) {
			message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
			vtype = Object.keys(message.message.viewOnceMessage.message)[0]
			delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
			delete message.message.viewOnceMessage.message[vtype].viewOnce
			message.message = {
				...message.message.viewOnceMessage.message
			}
		}

        let mtype = Object.keys(message.message)[0]
        let content = await generateForwardMessageContent(message, forceForward)
        let ctype = Object.keys(content)[0]
		let context = {}
        if (mtype != "conversation") context = message.message[mtype].contextInfo
        content[ctype].contextInfo = {
            ...context,
            ...content[ctype].contextInfo
        }
        const waMessage = await generateWAMessageFromContent(jid, content, options ? {
            ...content[ctype],
            ...options,
            ...(options.contextInfo ? {
                contextInfo: {
                    ...content[ctype].contextInfo,
                    ...options.contextInfo
                }
            } : {})
        } : {})
        await sock.relayMessage(jid, waMessage.message, { messageId:  waMessage.key.id })
        return waMessage
    }
    
    sock.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
	}
        
	return buffer
     }
    
    sock.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(quoted, messageType)
        let buffer = Buffer.from([])
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
	let type = await FileType.fromBuffer(buffer)
        trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
        // save to file
        await fs.writeFileSync(trueFileName, buffer)
        return trueFileName
    }
    
    sock.sendFile = async(jid, PATH, fileName, quoted = {}, options = {}) => {
let types = await sock.getFile(PATH, true)
let { filename, size, ext, mime, data } = types
let type = '', mimetype = mime, pathFile = filename
if (options.asDocument) type = 'document'
if (options.asSticker || /webp/.test(mime)) {
let { writeExif } = require('./lib/sticker.js')
let media = { mimetype: mime, data }
pathFile = await writeExif(media, { packname: global.packname, author: global.packname2, categories: options.categories ? options.categories : [] })
await fs.promises.unlink(filename)
type = 'sticker'
mimetype = 'image/webp'}
else if (/image/.test(mime)) type = 'image'
else if (/video/.test(mime)) type = 'video'
else if (/audio/.test(mime)) type = 'audio'
else type = 'document'
await sock.sendMessage(jid, { [type]: { url: pathFile }, mimetype, fileName, ...options }, { quoted, ...options })
return fs.promises.unlink(pathFile)}

    sock.cMod = (jid, copy, text = '', sender = sock.user.id, options = {}) => {
        //let copy = message.toJSON()
		let mtype = Object.keys(copy.message)[0]
		let isEphemeral = mtype === 'ephemeralMessage'
        if (isEphemeral) {
            mtype = Object.keys(copy.message.ephemeralMessage.message)[0]
        }
        let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
		let content = msg[mtype]
        if (typeof content === 'string') msg[mtype] = text || content
		else if (content.caption) content.caption = text || content.caption
		else if (content.text) content.text = text || content.text
		if (typeof content !== 'string') msg[mtype] = {
			...content,
			...options
        }
        if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
		else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
		if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
		else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
		copy.key.remoteJid = jid
		copy.key.fromMe = sender === sock.user.id

        return proto.WebMessageInfo.fromObject(copy)
    }


    /**
     * 
     * @param {*} path 
     * @returns 
     */

 
     
    sock.getFile = async (PATH, save) => {
        let res
        let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
        //if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
        let type = await FileType.fromBuffer(data) || {
            mime: 'application/octet-stream',
            ext: '.bin'
        }
        filename = path.join(__filename, '../' + new Date * 1 + '.' + type.ext)
        if (data && save) fs.promises.writeFile(filename, data)
        return {
            res,
            filename,
	    size: await getSizeMedia(data),
            ...type,
            data
        }

    }
    
    return sock
}

startBotz()


let file = require.resolve(__filename)
require('fs').watchFile(file, () => {
	require('fs').unwatchFile(file)
	console.log(__filename+' updated!')
	delete require.cache[file]
	require(file)
})