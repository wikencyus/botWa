const { proto, delay, prepareWAMessageMedia, getContentType, areJidsSameUser, generateWAMessage, downloadContentFromMessage } = require('@whiskeysockets/baileys')
const fs = require('fs')
const Crypto = require('crypto')
const axios = require('axios')
const util = require('util')
const { defaultMaxListeners } = require('stream')

const unixTimestampSeconds = (date = new Date()) => Math.floor(date.getTime() / 1000)

exports.unixTimestampSeconds = unixTimestampSeconds

exports.generateMessageTag = (epoch) => {
    let tag = (0, exports.unixTimestampSeconds)().toString();
    if (epoch)
        tag += '.--' + epoch; // attach epoch if provided
    return tag;
}

exports.getBuffer = async (url, options) => {
	try {
		options ? options : {}
		const res = await axios({
			method: "get",
			url,
			headers: {
				'DNT': 1,
				'Upgrade-Insecure-Request': 1
			},
			...options,
			responseType: 'arraybuffer'
		})
		return res.data
	} catch (err) {
		return err
	}
}

exports.fetchJson = async (url, options) => {
try {
options ? options : {}
const res = await axios({
method: 'GET',
url: url,
headers: {
'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
},
...options
})
return res.data
} catch (err) {
return err
}
}

exports.runtime = function(seconds) {
	seconds = Number(seconds);
	var d = Math.floor(seconds / (3600 * 24));
	var h = Math.floor(seconds % (3600 * 24) / 3600);
	var m = Math.floor(seconds % 3600 / 60);
	var s = Math.floor(seconds % 60);
	var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
	var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
	var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
	var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
	return dDisplay + hDisplay + mDisplay + sDisplay;
}


exports.sizeString = function (des) {
  if (des === 0) return '0 Bytes';
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(des) / Math.log(1024));
  return parseFloat((des / Math.pow(1024, i)).toFixed(0)) + ' ' + sizes[i];
};

exports.getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`
}

exports.sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

exports.jsonformat = (string) => {
    return JSON.stringify(string, null, 2)
}

function format(...args) {
	return util.format(...args)
}

function isUrl(string) {
	try {
		new URL(string);
		return true;
	} catch (err) {
		return false;
	}
}


exports.logic = (check, inp, out) => {
	if (inp.length !== out.length) throw new Error('Input and Output must have same length')
	for (let i in inp)
		if (util.isDeepStrictEqual(check, inp[i])) return out[i]
	return null
}

exports.bytesToSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

exports.getSizeMedia = (path) => {
    return new Promise((resolve, reject) => {
        if (/http/.test(path)) {
            axios.get(path)
            .then((res) => {
                let length = parseInt(res.headers['content-length'])
                let size = exports.bytesToSize(length, 3)
                if(!isNaN(length)) resolve(size)
            })
        } else if (Buffer.isBuffer(path)) {
            let length = Buffer.byteLength(path)
            let size = exports.bytesToSize(length, 3)
            if(!isNaN(length)) resolve(size)
        } else {
            reject('error')
        }
    })
}



exports.parseMention = (text = '') => {
  return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
}

exports.getGroupAdmins = (participants) => {
        let admins = []
        for (let i of participants) {
            i.admin === "superadmin" ? admins.push(i.id) :  i.admin === "admin" ? admins.push(i.id) : ''
        }
        return admins || []
     }
     

/**
 * Serialize Message
 * @param {WArxhlection} rxhl 
 * @param {Object} m 
 * @param {store} store 
 */
exports.smsg = (sock, m, store) => {
    if (!m) return m
    let M = proto.WebMessageInfo
    if (m.key) {
        m.id = m.key.id
        m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16
        m.chat = m.key.remoteJid
        m.fromMe = m.key.fromMe
        m.isGroup = m.chat.endsWith('@g.us')
        m.sender = sock.decodeJid(m.fromMe && sock.user.id || m.participant || m.key.participant || m.chat || '')
        if (m.isGroup) m.participant = sock.decodeJid(m.key.participant) || ''
    }
    if (m.message) {
        m.mtype = getContentType(m.message)
        m.msg = (m.mtype == 'viewOnceMessage' ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype])
        m.body = m.message.conversation || m.msg.caption || m.msg.text || (m.mtype == 'listResponseMessage') && m.msg.singleSelectReply.selectedRowId || (m.mtype == 'buttonsResponseMessage') && m.msg.selectedButtonId || (m.mtype == 'viewOnceMessage') && m.msg.caption || m.text
        let quoted = m.quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null
        m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
        if (m.quoted) {
            let type = Object.keys(m.quoted)[0]
			m.quoted = m.quoted[type]
            if (['productMessage'].includes(type)) {
				type = Object.keys(m.quoted)[0]
				m.quoted = m.quoted[type]
			}
            if (typeof m.quoted === 'string') m.quoted = {
				text: m.quoted
			}
            m.quoted.mtype = type
            m.quoted.id = m.msg.contextInfo.stanzaId
			m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat
            m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 : false
			m.quoted.sender = sock.decodeJid(m.msg.contextInfo.participant)
			m.quoted.fromMe = m.quoted.sender === sock.decodeJid(sock.user.id)
            m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || ''
			m.quoted.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
            m.getQuotedObj = m.getQuotedMessage = async () => {
			if (!m.quoted.id) return false
			let message = await sock.sendMessage(jid, data, { quoted, ...options })
			let q = await store.loadMessage(m.chat, m.quoted.id, sock)
 			return exports.smsg(sock, q, store)
            }
            let vM = m.quoted.fakeObj = M.fromObject({
                key: {
                    remoteJid: m.quoted.chat,
                    fromMe: m.quoted.fromMe,
                    id: m.quoted.id
                },
                message: quoted,
                ...(m.isGroup ? { participant: m.quoted.sender } : {})
            })

            /**
             * 
             * @returns 
             */
            m.quoted.delete = () => sock.sendMessage(m.quoted.chat, { delete: vM.key })
            
            sock.downloadMediaMessage = async (message) => {
            let mime = (message.msg || message).mimetype || ''
            let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
            const stream = await downloadContentFromMessage(message, messageType)
            let buffer = Buffer.from([])
            for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])}
            return buffer}

	   /**
		* 
		* @param {*} jid 
		* @param {*} forceForward 
		* @param {*} options 
		* @returns 
	   */
            m.quoted.copyNForward = (jid, forceForward = false, options = {}) => sock.copyNForward(jid, vM, forceForward, options)

            /**
              *
              * @returns
            */
            m.quoted.download = () => sock.downloadMediaMessage(m.quoted)
        }
    }
    if (m.msg.url) m.download = () => sock.downloadMediaMessage(m.msg)
    m.text = m.msg.text || m.msg.caption || m.message.conversation || m.msg.contentText || m.msg.selectedDisplayText || m.msg.title || ''

    /**
	* Copy this message
	*/
	m.copy = () => exports.smsg(sock, M.fromObject(M.toObject(m)))

	/**
	 * 
	 * @param {*} jid 
	 * @param {*} forceForward 
	 * @param {*} options 
	 * @returns 
	 */
	m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => sock.copyNForward(jid, m, forceForward, options)
	
	sock.appenTextMessage = async(text, chatUpdate) => {
        let messages = await generateWAMessage(m.chat, { text: text, mentions: m.mentionedJid }, {
            userJid: sock.user.id,
            quoted: m.quoted && m.quoted.fakeObj
        })
        messages.key.fromMe = areJidsSameUser(m.sender, sock.user.id)
        messages.key.id = m.key.id
        messages.pushName = m.pushName
        if (m.isGroup) messages.participant = m.sender
        let msg = {
            ...chatUpdate,
            messages: [proto.WebMessageInfo.fromObject(messages)],
            type: 'append'
        }
        sock.ev.emit('messages.upsert', msg)
    }

    return m
}


let file = require.resolve(__filename)
require('fs').watchFile(file, () => {
	require('fs').unwatchFile(file)
	console.log(__filename+' updated!')
	delete require.cache[file]
	require(file)
})