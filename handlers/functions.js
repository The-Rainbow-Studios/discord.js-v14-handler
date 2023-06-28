const { EmbedBuilder, Collection, PermissionFlagsBits, PermissionsBitField, formatEmoji, userMention } = require("discord.js");
const Discord = require("discord.js");
const config = require("../botconfig/config.js");
const permissions = require("../botconfig/permissions.js");
const ee = require("../botconfig/embed.js");
const settings = require("../botconfig/settings.js");
const sourcebin = require("sourcebin_js");
const allEmojis = require("../botconfig/emojis.js");

//EXPORT ALL FUNCTIONS
module.exports.nFormatter = nFormatter;
module.exports.shuffle = shuffle;
module.exports.formatDate = formatDate;
module.exports.delay = delay;
module.exports.getRandomInt = getRandomInt;
module.exports.duration = duration;
module.exports.getRandomNum = getRandomNum;
module.exports.format = format;
module.exports.swap_pages = swap_pages;
module.exports.swap_pages2 = swap_pages2;
module.exports.escapeRegex = escapeRegex;
module.exports.arrayMove = arrayMove;
module.exports.isValidURL = isValidURL;
module.exports.GetUser = GetUser;
module.exports.GetRole = GetRole;
module.exports.GetGlobalUser = GetGlobalUser;
module.exports.parseMilliseconds = parseMilliseconds;
module.exports.onCoolDown = onCoolDown;
module.exports.GetGlobalUser = GetGlobalUser;
module.exports.formatDate = formatDate;
module.exports.generateCaptcha = generateCaptcha;
module.exports.create_transcript_buffer = create_transcript_buffer;
module.exports.replacemsg = replacedefaultmessages;
module.exports.createPaginationEmbed = createPaginationEmbed;
module.exports.createEmbed = createEmbed;
module.exports.smartSlice = smartSlice;
module.exports.postToBin = postToBin;
module.exports.containsLink = containsLink;
module.exports.containsDiscordInvite = containsDiscordInvite;
module.exports.parsePermissions = parsePermissions;
module.exports.gReRoll = gReRoll;
module.exports.generateGiveawayEmbed = generateGiveawayEmbed;
module.exports.disableButtons = disableButtons
/**
 *
 * @param {*} text The Text that should be replaced, usually from /botconfig/settings.json
 * @param {*} options Those Options are what are needed for the replaceMent! Valid ones are: {
 *   timeLeft: "",
 *   commandmemberpermissions: { memberpermissions: [] },
 *   commandalloweduserids: { alloweduserids: [] },
 *   commandrequiredroles: { requiredroles: [] },
 *   commandname: { name: "" },
 *   commandaliases: { aliases: [] },
 *   prefix: "",
 *   errormessage: { message: "" }
 *   errorstack: { stack: STACK }
 *   error: ERRORTYPE
 * }
 * @returns STRING
 */
function replacedefaultmessages(text, o = {}) {
  if (!text || text == undefined || text == null)
    throw "No Text for the replacedefault message added as First Parameter";
  const options = Object(o);
  if (!options || options == undefined || options == null) return String(text);
  return String(text)
    .replace(
      /%{timeleft}%/gi,
      options && options.timeLeft ? options.timeLeft.toFixed(1) : "%{timeleft}%"
    )
    .replace(
      /%{commandname}%/gi,
      options && options.command && options.command.name
        ? options.command.name
        : "%{commandname}%"
    )
    .replace(
      /%{commandaliases}%/gi,
      options && options.command && options.command.aliases
        ? options.command.aliases.map((v) => `\`${v}\``).join(",")
        : "%{commandaliases}%"
    )
    .replace(
      /%{prefix}%/gi,
      options && options.prefix ? options.prefix : "%{prefix}%"
    )
    .replace(
      /%{commandmemberpermissions}%/gi,
      options && options.command && options.command.memberpermissions
        ? parsePermissions(removeDuplicatesPerms(new PermissionsBitField(options.command.memberpermissions).toArray(), options.res.member.permissions.toArray()))
        : "%{commandmemberpermissions}%"
    )
    .replace(
      /%{commandbotpermissions}%/gi,
      options && options.command && options.command.botpermissions
        ? parsePermissions(removeDuplicatesPerms(new PermissionsBitField(options.command.botpermissions).toArray(), options.res.guild.members.me.permissions.toArray()))
        : "%{commandbotpermissions}%"
    )
    .replace(
      /%{commandalloweduserids}%/gi,
      options && options.command && options.command.alloweduserids
        ? options.command.alloweduserids.map((v) => `<@${v}>`).join(",")
        : "%{commandalloweduserids}%"
    )
    .replace(
      /%{commandrequiredroles}%/gi,
      options && options.command && options.command.requiredroles
        ? options.command.requiredroles.map((v) => `<@&${v}>`).join(",")
        : "%{commandrequiredroles}%"
    )
    .replace(
      /%{errormessage}%/gi,
      options && options.error && options.error.message
        ? options.error.message
        : options && options.error
        ? options.error
        : "%{errormessage}%"
    )
    .replace(
      /%{errorstack}%/gi,
      options && options.error && options.error.stack
        ? options.error.stack
        : options && options.error && options.error.message
        ? options.error.message
        : options && options.error
        ? options.error
        : "%{errorstack}%"
    )
    .replace(
      /%{error}%/gi,
      options && options.error ? options.error : "%{error}%"
    );
}

/**
 * @param {Number} num Length of the captcha
 * @returns STRING
 * @description Makes a captcha
 * @example generateCaptcha() // -> abcd12
 */

function generateCaptcha(length) {
  let charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  let retVal = "";

  for (let i = 0; i < length; i++) {
    retVal += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  return retVal;
}

/**
 *
 * @param {*} message A DiscordMessage, with the client, information
 * @param {*} command The Command with the command.name
 * @returns BOOLEAN
 */

function onCoolDown(message, command) {
  if (!message || !message.client)
    throw "No Message with a valid DiscordClient granted as First Parameter";
  if (!command || !command.name)
    throw "No Command with a valid Name granted as Second Parameter";
  if (settings.ownerIDS.includes(message.author?.id || message.member?.id))
    return false;
  const client = message.client;
  if (!client.cooldowns.has(command.name)) {
    //if its not in the cooldown, set it too there
    client.cooldowns.set(command.name, new Collection());
  }
  const now = Date.now(); //get the current time
  const timestamps = client.cooldowns.get(command.name); //get the timestamp of the last used commands
  const cooldownAmount =
    (command.cooldown || settings.default_cooldown_in_sec) * 1000; //get the cooldownamount of the command, if there is no cooldown there will be automatically 1 sec cooldown, so you cannot spam it^^
  if (timestamps.has(message.member.id)) {
    //if the user is on cooldown
    const expirationTime = timestamps.get(message.member.id) + cooldownAmount; //get the amount of time he needs to wait until he can run the cmd again
    if (now < expirationTime) {
      //if he is still on cooldonw
      const timeLeft = (expirationTime - now) / 1000; //get the lefttime
      //return true
      return timeLeft;
    } else {
      //if he is not on cooldown, set it to the cooldown
      timestamps.set(message.member.id, now);
      //set a timeout function with the cooldown, so it gets deleted later on again
      setTimeout(() => timestamps.delete(message.member.id), cooldownAmount);
      //return false aka not on cooldown
      return false;
    }
  } else {
    //if he is not on cooldown, set it to the cooldown
    timestamps.set(message.member.id, now);
    //set a timeout function with the cooldown, so it gets deleted later on again
    setTimeout(() => timestamps.delete(message.member.id), cooldownAmount);
    //return false aka not on cooldown
    return false;
  }
}

/**
 *
 * @param {*} milliseconds NUMBER | TIME IN MILLISECONDS
 * @returns Object of Formatted Time in Days to nanoseconds
 */
function parseMilliseconds(milliseconds) {
  if (typeof milliseconds !== "number") {
    throw new TypeError("Expected a number");
  }

  return {
    days: Math.trunc(milliseconds / 86400000),
    hours: Math.trunc(milliseconds / 3600000) % 24,
    minutes: Math.trunc(milliseconds / 60000) % 60,
    seconds: Math.trunc(milliseconds / 1000) % 60,
    milliseconds: Math.trunc(milliseconds) % 1000,
    microseconds: Math.trunc(milliseconds * 1000) % 1000,
    nanoseconds: Math.trunc(milliseconds * 1e6) % 1000,
  };
}

/**
 *
 * @param {*} string A WHOLE TEXT, checks if there is a URL IN IT
 * @returns BOOLEAN/THE URL
 */
function isValidURL(string) {
  const args = string.split(" ");
  let url;
  for (const arg of args) {
    try {
      url = new URL(arg);
      url = url.protocol === "http:" || url.protocol === "https:";
      break;
    } catch (_) {
      url = false;
    }
  }
  return url;
}

/**
 *
 * @param {*} message a DISCORDMESSAGE with the Content and guild and client information
 * @param {*} arg //a argument, for search for example
 * @returns BOOLEAN/DISCORDUSER
 */
function GetUser(message, arg) {
  var errormessage = ":x: I failed finding that User...";
  return new Promise(async (resolve, reject) => {
    var args = arg,
      client = message.client;
    if (!client || !message) return reject("CLIENT IS NOT DEFINED");
    if (!args || args == null || args == undefined)
      args = message.content.trim().split(/ +/).slice(1);
    let user = message.mentions.users.first();
    if (!user && args[0] && args[0].length == 18) {
      user = await client.users.fetch(args[0]);
      if (!user) return reject(errormessage);
      return resolve(user);
    } else if (!user && args[0]) {
      let alluser = message.guild.members.cache.map((member) =>
        String(member.user.tag).toLowerCase()
      );
      user = alluser.find((user) =>
        user.startsWith(args.join(" ").toLowerCase())
      );
      user = message.guild.members.cache.find(
        (me) => String(me.user.tag).toLowerCase() == user
      );
      if (!user || user == null || !user.id) {
        alluser = message.guild.members.cache.map((member) =>
          String(
            member.displayName + "#" + member.user.discriminator
          ).toLowerCase()
        );
        user = alluser.find((user) =>
          user.startsWith(args.join(" ").toLowerCase())
        );
        user = message.guild.members.cache.find(
          (me) =>
            String(
              me.displayName + "#" + me.user.discriminator
            ).toLowerCase() == user
        );
        if (!user || user == null || !user.id) return reject(errormessage);
      }
      user = await client.users.fetch(user.user.id);
      if (!user) return reject(errormessage);
      return resolve(user);
    } else {
      user = message.mentions.users.first() || message.author;
      return resolve(user);
    }
  });
}

/**
 *
 * @param {*} message a DISCORDMESSAGE with the Content and guild and client information
 * @param {*} arg //a argument, for search for example
 * @returns BOOLEAN/GUILDROLE
 */
function GetRole(message, arg) {
  var errormessage = ":x: I failed finding that Role...";
  return new Promise(async (resolve, reject) => {
    var args = arg,
      client = message.client;
    if (!client || !message) return reject("CLIENT IS NOT DEFINED");
    if (!args || args == null || args == undefined)
      args = message.content.trim().split(/ +/).slice(1);
    let user = message.mentions.roles
      .filter((role) => role.guild.id == message.guild.id)
      .first();
    if (!user && args[0] && args[0].length == 18) {
      user = message.guild.roles.cache.get(args[0]);
      if (!user) return reject(errormessage);
      return resolve(user);
    } else if (!user && args[0]) {
      let alluser = message.guild.roles.cache.map((role) =>
        String(role.name).toLowerCase()
      );
      user = alluser.find((r) =>
        r.split(" ").join("").includes(args.join("").toLowerCase())
      );
      user = message.guild.roles.cache.find(
        (role) => String(role.name).toLowerCase() === user
      );
      if (!user) return reject(errormessage);
      return resolve(user);
    } else {
      user = message.mentions.roles
        .filter((role) => role.guild.id == message.guild.id)
        .first();
      if (!user) return reject(errormessage);
      return resolve(user);
    }
  });
}

/**
 *
 * @param {*} message a DISCORDMESSAGE with the Content and guild and client information
 * @param {*} arg //a argument, for search for example
 * @returns BOOLEAN/DISCORDUSER
 */
function GetGlobalUser(message, arg) {
  var errormessage = ":x: I failed finding that User...";
  return new Promise(async (resolve, reject) => {
    var args = arg,
      client = message.client;
    if (!client || !message) return reject("CLIENT IS NOT DEFINED");
    if (!args || args == null || args == undefined)
      args = message.content.trim().split(/ +/).slice(1);
    let user = message.mentions.users.first();
    if (!user && args[0] && args[0].length == 18) {
      user = await client.users.fetch(args[0]);
      if (!user) return reject(errormessage);
      return resolve(user);
    } else if (!user && args[0]) {
      let alluser = [],
        allmembers = [];
      var guilds = Array.from(client.guilds.cache.values());
      for (const g of guilds) {
        var members = Array.from(g.members.cache.values());
        for (const m of members) {
          alluser.push(m.user.tag);
          allmembers.push(m);
        }
      }
      user = alluser.find((user) =>
        user.startsWith(args.join(" ").toLowerCase())
      );
      user = allmembers.find((me) => String(me.user.tag).toLowerCase() == user);
      if (!user || user == null || !user.id) {
        user = alluser.find((user) =>
          user.startsWith(args.join(" ").toLowerCase())
        );
        user = allmembers.find(
          (me) =>
            String(
              me.displayName + "#" + me.user.discriminator
            ).toLowerCase() == user
        );
        if (!user || user == null || !user.id) return reject(errormessage);
      }
      user = await client.users.fetch(user.user.id);
      if (!user) return reject(errormessage);
      return resolve(user);
    } else {
      user = message.mentions.users.first() || message.author;
      return resolve(user);
    }
  });
}

/**
 *
 * @param {*} array Shuffles a given array (mix)
 * @returns ARRAY
 */
function shuffle(array) {
  try {
    var j, x, i;
    for (i = array.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = array[i];
      array[i] = array[j];
      array[j] = x;
    }
    return array;
  } catch (e) {
    console.log(e);
  }
}

/**
 *
 * @param {*} date Date format (Date.now())
 * @returns Formatted Date
 */
function formatDate(date) {
  try {
    return new Intl.DateTimeFormat("en-US").format(date);
  } catch (e) {
    console.log(e);
    return false;
  }
}

/**
 *
 * @param {*} duration Number | Time in Milliseconds
 * @returns Object of Formatted Time in Days to milliseconds
 */
function parseDuration(duration) {
  let remain = duration;
  let days = Math.floor(remain / (1000 * 60 * 60 * 24));
  remain = remain % (1000 * 60 * 60 * 24);

  let hours = Math.floor(remain / (1000 * 60 * 60));
  remain = remain % (1000 * 60 * 60);

  let minutes = Math.floor(remain / (1000 * 60));
  remain = remain % (1000 * 60);

  let seconds = Math.floor(remain / 1000);
  remain = remain % 1000;

  let milliseconds = remain;

  return {
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
  };
}

/**
 *
 * @param {*} o Object of Time from days to nanoseconds/milliseconds
 * @param {*} useMilli Optional Boolean parameter, if it should use milliseconds or not in the showof
 * @returns Formatted Time
 */
function formatTime(o, useMilli = false) {
  let parts = [];
  if (o.days) {
    let ret = o.days + " Day";
    if (o.days !== 1) {
      ret += "s";
    }
    parts.push(ret);
  }
  if (o.hours) {
    let ret = o.hours + " Hr";
    if (o.hours !== 1) {
      ret += "s";
    }
    parts.push(ret);
  }
  if (o.minutes) {
    let ret = o.minutes + " Min";
    if (o.minutes !== 1) {
      ret += "s";
    }
    parts.push(ret);
  }
  if (o.seconds) {
    let ret = o.seconds + " Sec";
    if (o.seconds !== 1) {
      ret += "s";
    }
    parts.push(ret);
  }
  if (useMilli && o.milliseconds) {
    let ret = o.milliseconds + " ms";
    parts.push(ret);
  }
  if (parts.length === 0) {
    return "instantly";
  } else {
    return parts;
  }
}

/**
 *
 * @param {*} duration Number | Time in Millisceonds
 * @param {*} useMilli Optional Boolean parameter, if it should use milliseconds or not in the showof
 * @returns Formatted Time
 */
function duration(duration, useMilli = false) {
  let time = parseDuration(duration);
  return formatTime(time, useMilli);
}

/**
 *
 * @param {*} delayInms Number | Time in Milliseconds
 * @returns Promise, waiting for the given Milliseconds
 */
function delay(delayInms) {
  try {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(2);
      }, delayInms);
    });
  } catch (e) {
    console.log(e);
  }
}

/**
 *
 * @param {*} max Number | 0 - MAX
 * @returns Number
 */
function getRandomInt(max) {
  try {
    return Math.floor(Math.random() * Math.floor(max));
  } catch (e) {
    console.log(e);
  }
}

/**
 *
 * @param {*} min Number | min - max
 * @param {*} max Number | min - max
 * @returns Number
 */
function getRandomNum(min, max) {
  try {
    return Math.floor(Math.random() * Math.floor(max - min + min));
  } catch (e) {
    console.log(e);
  }
}

/**
 *
 * @param {*} millis Number | Time in Milliseconds
 * @returns Formatted time in: HH:MM:SS HH only if bigger then 0
 */
function format(millis) {
  try {
    var h = Math.floor(millis / 3600000),
      m = Math.floor(millis / 60000),
      s = ((millis % 60000) / 1000).toFixed(0);
    if (h < 1)
      return (
        (m < 10 ? "0" : "") +
        m +
        ":" +
        (s < 10 ? "0" : "") +
        s +
        " | " +
        Math.floor(millis / 1000) +
        " Seconds"
      );
    else
      return (
        (h < 10 ? "0" : "") +
        h +
        ":" +
        (m < 10 ? "0" : "") +
        m +
        ":" +
        (s < 10 ? "0" : "") +
        s +
        " | " +
        Math.floor(millis / 1000) +
        " Seconds"
      );
  } catch (e) {
    console.log(e);
  }
}

/**
 *
 * @param {*} str String of message, not replacing pings
 * @returns Only the Pinged message
 */
function escapeRegex(str) {
  try {
    return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
  } catch (e) {
    console.log(e);
  }
}

/**
 *
 * @param {*} array ARRAY | Complete Array to work with
 * @param {*} from NUMBER | Position of first ITEM
 * @param {*} to NUMBER | Position where to move it to
 * @returns ARRAY | the Moved Array
 */
function arrayMove(array, from, to) {
  try {
    array = [...array];
    const startIndex = from < 0 ? array.length + from : from;
    if (startIndex >= 0 && startIndex < array.length) {
      const endIndex = to < 0 ? array.length + to : to;
      const [item] = array.splice(from, 1);
      array.splice(endIndex, 0, item);
    }
    return array;
  } catch (e) {
    console.log(e);
  }
}

/**
 *
 * @param {*} num Number
 * @param {*} digits How many digits it should have: 10.231k == 3
 * @returns Formatted Number
 */
function nFormatter(num, digits = 2) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  return item
    ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
    : "0";
}

/**
 * @param {*} message Discord Message with a DiscordChannel (TEXTCHANNEL)
 * @param {*} desc A Description, STRING OR ARRAY
 * @param {*} TITLE Title of the Embed
 * @param {*} reactionemojis Emojis for swaping the pages, Default: ["⬅️", "⏹", "➡️"] | OPTIONAL
 * @param {*} sliceamount If an Array is beeing used, it is the amount of items, per page, if a string then the amount of letters per page, Default Array: 15, Default String: 1000 | OPTIONAL
 * @returns VOID, works by itself
 */
const { ButtonBuilder, ActionRowBuilder } = require("discord.js");
async function swap_pages(
  client,
  message,
  description,
  TITLE,
  reactionemojis = ["⬅️", "⏹", "➡️"],
  sliceamount = 15
) {
  let prefix = client.config.prefix;
  let cmduser = message.author;

  let currentPage = 0;
  //GET ALL EMBEDS
  let embeds = [];
  //if input is an array
  if (Array.isArray(description)) {
    try {
      let k = 20;
      for (let i = 0; i < description.length; i += 20) {
        const current = description.slice(i, k);
        k += 20;
        const embed = new EmbedBuilder()
          .setDescription(current)
          .setTitle(TITLE)
          .setColor(ee.color)
          .setFooter({ text: ee.footertext, iconURL: ee.footericon });
        embeds.push(embed);
      }
      embeds;
    } catch {}
  } else {
    try {
      let k = 1000;
      for (let i = 0; i < description.length; i += 1000) {
        const current = description.slice(i, k);
        k += 1000;
        const embed = new EmbedBuilder()
          .setDescription(current)
          .setTitle(TITLE)
          .setColor(ee.color)
          .setFooter({ text: ee.footertext, iconURL: ee.footericon });
        embeds.push(embed);
      }
      embeds;
    } catch {}
  }
  if (embeds.length === 0)
    return message.channel
      .send({
        embeds: [
          new EmbedBuilder()
            .setTitle(
              `${emoji.msg.ERROR} No Content added to the SWAP PAGES Function`
            )
            .setColor(ee.wrongcolor)
            .setFooter({ text: ee.footertext, iconURL: ee.footericon }),
        ],
      })
      .catch((e) => console.log("THIS IS TO PREVENT A CRASH"));
  if (embeds.length === 1)
    return message.channel
      .send({ embeds: [embeds[0]] })
      .catch((e) => console.log("THIS IS TO PREVENT A CRASH"));

  let button_back = new ButtonBuilder()
    .setStyle("SUCCESS")
    .setCustomId("1")
    .setEmoji("833802907509719130")
    .setLabel("Back");
  let button_home = new ButtonBuilder()
    .setStyle("DANGER")
    .setCustomId("2")
    .setEmoji("🏠")
    .setLabel("Home");
  let button_forward = new ButtonBuilder()
    .setStyle("SUCCESS")
    .setCustomId("3")
    .setEmoji("832598861813776394")
    .setLabel("Forward");
  const allbuttons = [
    new ActionRowBuilder().addComponents([
      button_back,
      button_home,
      button_forward,
    ]),
  ];
  //Send message with buttons
  let swapmsg = await message.channel.safeSend({
    content: `***Click on the __Buttons__ to swap the Pages***`,
    embeds: [embeds[0]],
    components: allbuttons,
  });
  //create a collector for the thinggy
  const collector = swapmsg.createMessageComponentCollector({
    filter: (i) =>
      i.isButton() &&
      i.user &&
      i.user.id == cmduser.id &&
      i.message.author.id == client.user.id,
    time: 180e3,
  }); //collector for 5 seconds
  //array of all embeds, here simplified just 10 embeds with numbers 0 - 9
  collector.on("collect", async (b) => {
    if (b.user.id !== message.author.id)
      return b.reply(
        `<:declined:780403017160982538> **Only the one who typed ${prefix}help is allowed to react!**`,
        true
      );
    //page forward
    if (b.customId == "1") {
      //b.reply("***Swapping a PAGE FORWARD***, *please wait 2 Seconds for the next Input*", true)
      if (currentPage !== 0) {
        currentPage -= 1;
        await swapmsg.edit({
          embeds: [embeds[currentPage]],
          components: allbuttons,
        });
        await b.deferUpdate();
      } else {
        currentPage = embeds.length - 1;
        await swapmsg.edit({
          embeds: [embeds[currentPage]],
          components: allbuttons,
        });
        await b.deferUpdate();
      }
    }
    //go home
    else if (b.customId == "2") {
      //b.reply("***Going Back home***, *please wait 2 Seconds for the next Input*", true)
      currentPage = 0;
      await swapmsg.edit({
        embeds: [embeds[currentPage]],
        components: allbuttons,
      });
      await b.deferUpdate();
    }
    //go forward
    else if (b.customId == "3") {
      //b.reply("***Swapping a PAGE BACK***, *please wait 2 Seconds for the next Input*", true)
      if (currentPage < embeds.length - 1) {
        currentPage++;
        await swapmsg.edit({
          embeds: [embeds[currentPage]],
          components: allbuttons,
        });
        await b.deferUpdate();
      } else {
        currentPage = 0;
        await swapmsg.edit({
          embeds: [embeds[currentPage]],
          components: allbuttons,
        });
        await b.deferUpdate();
      }
    }
  });
}
async function swap_pages2(client, message, embeds) {
  let currentPage = 0;
  let cmduser = message.author;
  if (embeds.length === 1)
    return message.channel
      .send({ embeds: [embeds[0]] })
      .catch((e) => console.log("THIS IS TO PREVENT A CRASH"));
  let button_back = new ButtonBuilder()
    .setStyle("SUCCESS")
    .setCustomId("1")
    .setEmoji("833802907509719130")
    .setLabel("Back");
  let button_home = new ButtonBuilder()
    .setStyle("DANGER")
    .setCustomId("2")
    .setEmoji("🏠")
    .setLabel("Home");
  let button_forward = new ButtonBuilder()
    .setStyle("SUCCESS")
    .setCustomId("3")
    .setEmoji("832598861813776394")
    .setLabel("Forward");
  const allbuttons = [
    new ActionRowBuilder().addComponents([
      button_back,
      button_home,
      button_forward,
    ]),
  ];
  let prefix = "/";
  //Send message with buttons
  let swapmsg = await message.channel.safeSend({
    content: `***Click on the __Buttons__ to swap the Pages***`,
    embeds: [embeds[0]],
    components: allbuttons,
  });
  //create a collector for the thinggy
  const collector = swapmsg.createMessageComponentCollector({
    filter: (i) =>
      i.isButton() &&
      i.user &&
      i.user.id == cmduser.id &&
      i.message.author.id == client.user.id,
    time: 180e3,
  }); //collector for 5 seconds
  //array of all embeds, here simplified just 10 embeds with numbers 0 - 9
  collector.on("collect", async (b) => {
    if (b.user.id !== message.author.id)
      return b.reply(
        `<:declined:780403017160982538> **Only the one who typed ${prefix}help is allowed to react!**`,
        true
      );
    //page forward
    if (b.customId == "1") {
      //b.reply("***Swapping a PAGE FORWARD***, *please wait 2 Seconds for the next Input*", true)
      if (currentPage !== 0) {
        currentPage -= 1;
        await swapmsg.edit({
          embeds: [embeds[currentPage]],
          components: allbuttons,
        });
        await b.deferUpdate();
      } else {
        currentPage = embeds.length - 1;
        await swapmsg.edit({
          embeds: [embeds[currentPage]],
          components: allbuttons,
        });
        await b.deferUpdate();
      }
    }
    //go home
    else if (b.customId == "2") {
      //b.reply("***Going Back home***, *please wait 2 Seconds for the next Input*", true)
      currentPage = 0;
      await swapmsg.edit({
        embeds: [embeds[currentPage]],
        components: allbuttons,
      });
      await b.deferUpdate();
    }
    //go forward
    else if (b.customId == "3") {
      //b.reply("***Swapping a PAGE BACK***, *please wait 2 Seconds for the next Input*", true)
      if (currentPage < embeds.length - 1) {
        currentPage++;
        await swapmsg.edit({
          embeds: [embeds[currentPage]],
          components: allbuttons,
        });
        await b.deferUpdate();
      } else {
        currentPage = 0;
        await swapmsg.edit({
          embeds: [embeds[currentPage]],
          components: allbuttons,
        });
        await b.deferUpdate();
      }
    }
  });
}

/**
 *
 * @param {*} message Discord Message
 * @param {*} args Array of Message Arguments
 * @returns Discord.User
 */

function GetGlobalUser(message, arg) {
  var errormessage = "<:no:833101993668771842> I failed finding that User...";
  return new Promise(async (resolve, reject) => {
    var args = arg,
      client = message.client;
    if (!client || !message) return reject("CLIENT IS NOT DEFINED");
    if (!args || args == null || args == undefined)
      args = message.content.trim().split(/ +/).slice(1);
    let user = message.mentions.users.first();
    if (!user && args[0] && args[0].length == 18) {
      user = await client.users.fetch(args[0]).catch(() => {});
      if (!user) return reject(errormessage);
      return resolve(user);
    } else if (!user && args[0]) {
      let alluser = [],
        allmembers = [];
      var guilds = [...client.guilds.cache.values()];
      for (const g of guilds) {
        var members = g.members.cache.map((NOVA) => NOVA);
        for (const m of members) {
          alluser.push(m.user.tag);
          allmembers.push(m);
        }
      }
      user = alluser.find((user) =>
        user.startsWith(args.join(" ").toLowerCase())
      );
      user = allmembers.find((me) => String(me.user.tag).toLowerCase() == user);
      if (!user || user == null || !user.id) {
        user = alluser.find((user) =>
          user.startsWith(args.join(" ").toLowerCase())
        );
        user = allmembers.find(
          (me) =>
            String(
              me.displayName + "#" + me.user.discriminator
            ).toLowerCase() == user
        );
        if (!user || user == null || !user.id) return reject(errormessage);
      }
      user = await client.users.fetch(user.user.id).catch(() => {});
      if (!user) return reject(errormessage);
      return resolve(user);
    } else {
      user = message.mentions.users.first() || message.author;
      return resolve(user);
    }
  });
}

/**
 * @param {Discord.Channel} channel Discord Channel
 * @param {Discord.Guild} guild Discord Guild
 * @param {Number} limit Number of Messages to fetch
 * @returns {Promise<Buffer>} Path to the html file
 * @description Creates a Buffer of the Transcript
 * @example create_transcript_buffer(channel, guild, 1000).then(async path => {
 * const attachment = new Discord.AttachmentBuilder(path, {name: "transcript.html" description: "Transcript of the Channel""});
 * await message.channel.safeSend({ files: [attachment] });
 * await fs.unlinkSync(path);
 * });
 */
async function create_transcript_buffer(Channel, Guild, Limit) {
  return new Promise(async (resolve, reject) => {
    try {
      let baseHTML =
        `<!DOCTYPE html>` +
        `<html lang="en">` +
        `<head>` +
        `<title>${Channel.name}</title>` +
        `<meta charset="utf-8" />` +
        `<meta name="viewport" content="width=device-width" />` +
        `<style>mark{background-color: #202225;color:#F3F3F3;}@font-face{font-family:Whitney;src:url(https://cdn.jsdelivr.net/gh/mahtoid/DiscordUtils@master/whitney-300.woff);font-weight:300}@font-face{font-family:Whitney;src:url(https://cdn.jsdelivr.net/gh/mahtoid/DiscordUtils@master/whitney-400.woff);font-weight:400}@font-face{font-family:Whitney;src:url(https://cdn.jsdelivr.net/gh/mahtoid/DiscordUtils@master/whitney-500.woff);font-weight:500}@font-face{font-family:Whitney;src:url(https://cdn.jsdelivr.net/gh/mahtoid/DiscordUtils@master/whitney-600.woff);font-weight:600}@font-face{font-family:Whitney;src:url(https://cdn.jsdelivr.net/gh/mahtoid/DiscordUtils@master/whitney-700.woff);font-weight:700}body{font-family:Whitney,"Helvetica Neue",Helvetica,Arial,sans-serif;font-size:17px}a{text-decoration:none}a:hover{text-decoration:underline}img{object-fit:contain}.markdown{max-width:100%;line-height:1.3;overflow-wrap:break-word}.preserve-whitespace{white-space:pre-wrap}.spoiler{display:inline-block}.spoiler--hidden{cursor:pointer}.spoiler-text{border-radius:3px}.spoiler--hidden .spoiler-text{color:transparent}.spoiler--hidden .spoiler-text::selection{color:transparent}.spoiler-image{position:relative;overflow:hidden;border-radius:3px}.spoiler--hidden .spoiler-image{box-shadow:0 0 1px 1px rgba(0,0,0,.1)}.spoiler--hidden .spoiler-image *{filter:blur(44px)}.spoiler--hidden .spoiler-image:after{content:"SPOILER";color:#dcddde;background-color:rgba(0,0,0,.6);position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-weight:600;padding:100%;border-radius:20px;letter-spacing:.05em;font-size:.9em}.spoiler--hidden:hover .spoiler-image:after{color:#fff;background-color:rgba(0,0,0,.9)}blockquote{margin:.1em 0;padding-left:.6em;border-left:4px solid;border-radius:3px}.pre{font-family:Consolas,"Courier New",Courier,monospace}.pre--multiline{margin-top:.25em;padding:.5em;border:2px solid;border-radius:5px}.pre--inline{padding:2px;border-radius:3px;font-size:.85em}.mention{border-radius:3px;padding:0 2px;color:#dee0fc;background:rgba(88,101,242,.3);font-weight:500}.mention:hover{background:rgba(88,101,242,.6)}.emoji{width:1.25em;height:1.25em;margin:0 .06em;vertical-align:-.4em}.emoji--small{width:1em;height:1em}.emoji--large{width:2.8em;height:2.8em}.chatlog{max-width:100%}.message-group{display:grid;margin:0 .6em;padding:.9em 0;border-top:1px solid;grid-template-columns:auto 1fr}.reference-symbol{grid-column:1;border-style:solid;border-width:2px 0 0 2px;border-radius:8px 0 0 0;margin-left:16px;margin-top:8px}.attachment-icon{float:left;height:100%;margin-right:10px}.reference{display:flex;grid-column:2;margin-left:1.2em;margin-bottom:.25em;font-size:.875em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;align-items:center}.reference-av{border-radius:50%;height:16px;width:16px;margin-right:.25em}.reference-name{margin-right:.25em;font-weight:600}.reference-link{flex-grow:1;overflow:hidden;text-overflow:ellipsis}.reference-link:hover{text-decoration:none}.reference-content>*{display:inline}.reference-edited-tst{margin-left:.25em;font-size:.8em}.ath-av-container{grid-column:1;width:40px;height:40px}.ath-av{border-radius:50%;height:40px;width:40px}.messages{grid-column:2;margin-left:1.2em;min-width:50%}.messages .bot-tag{top:-.2em}.ath-name{font-weight:500}.tst{margin-left:.3em;font-size:.75em}.message{padding:.1em .3em;margin:0 -.3em;background-color:transparent;transition:background-color 1s ease}.content{font-size:.95em;word-wrap:break-word}.edited-tst{margin-left:.15em;font-size:.8em}.attachment{margin-top:.3em}.attachment-thumbnail{vertical-align:top;max-width:45vw;max-height:225px;border-radius:3px}.attachment-container{height:40px;width:100%;max-width:520px;padding:10px;border:1px solid;border-radius:3px;overflow:hidden;background-color:#2f3136;border-color:#292b2f}.attachment-icon{float:left;height:100%;margin-right:10px}.attachment-filesize{color:#72767d;font-size:12px}.attachment-filename{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.embed{display:flex;margin-top:.3em;max-width:520px}.embed-color-pill{flex-shrink:0;width:.25em;border-top-left-radius:3px;border-bottom-left-radius:3px}.embed-content-container{display:flex;flex-direction:column;padding:.5em .6em;border:1px solid;border-top-right-radius:3px;border-bottom-right-radius:3px}.embed-content{display:flex;width:100%}.embed-text{flex:1}.embed-ath{display:flex;margin-bottom:.3em;align-items:center}.embed-ath-icon{margin-right:.5em;width:20px;height:20px;border-radius:50%}.embed-ath-name{font-size:.875em;font-weight:600}.embed-title{margin-bottom:.2em;font-size:.875em;font-weight:600}.embed-description{font-weight:500;font-size:.85em}.embed-fields{display:flex;flex-wrap:wrap}.embed-field{flex:0;min-width:100%;max-width:506px;padding-top:.6em;font-size:.875em}.embed-field--inline{flex:1;flex-basis:auto;min-width:150px}.embed-field-name{margin-bottom:.2em;font-weight:600}.embed-field-value{font-weight:500}.embed-thumbnail{flex:0;margin-left:1.2em;max-width:80px;max-height:80px;border-radius:3px}.embed-image-container{margin-top:.6em}.embed-image{max-width:500px;max-height:400px;border-radius:3px}.embed-footer{margin-top:.6em}.embed-footer-icon{margin-right:.2em;width:20px;height:20px;border-radius:50%;vertical-align:middle}.embed-footer-text{display:inline;font-size:.75em;font-weight:500}.reactions{display:flex}.reaction{display:flex;align-items:center;margin:.35em .1em .1em .1em;padding:.2em .35em;border-radius:8px}.reaction-count{min-width:9px;margin-left:.35em;font-size:.875em}.bot-tag{position:relative;margin-left:.3em;margin-right:.3em;padding:.05em .3em;border-radius:3px;vertical-align:middle;line-height:1.3;background:#7289da;color:#fff;font-size:.625em;font-weight:500}.postamble{margin:1.4em .3em .6em .3em;padding:1em;border-top:1px solid}body{background-color:#36393e;color:#dcddde}a{color:#0096cf}.spoiler-text{background-color:rgba(255,255,255,.1)}.spoiler--hidden .spoiler-text{background-color:#202225}.spoiler--hidden:hover .spoiler-text{background-color:rgba(32,34,37,.8)}.quote{border-color:#4f545c}.pre{background-color:#2f3136!important}.pre--multiline{border-color:#282b30!important;color:#b9bbbe!important}.preamble__entry{color:#fff}.message-group{border-color:rgba(255,255,255,.1)}.reference-symbol{border-color:#4f545c}.reference-icon{width:20px;display:inline-block;vertical-align:bottom}.reference{color:#b5b6b8}.reference-link{color:#b5b6b8}.reference-link:hover{color:#fff}.reference-edited-tst{color:rgba(255,255,255,.2)}.ath-name{color:#fff}.tst{color:rgba(255,255,255,.2)}.message--highlighted{background-color:rgba(114,137,218,.2)!important}.message--pinned{background-color:rgba(249,168,37,.05)}.edited-tst{color:rgba(255,255,255,.2)}.embed-color-pill--default{background-color:#4f545c}.embed-content-container{background-color:rgba(46,48,54,.3);border-color:rgba(46,48,54,.6)}.embed-ath-name{color:#fff}.embed-ath-name-link{color:#fff}.embed-title{color:#fff}.embed-description{color:rgba(255,255,255,.6)}.embed-field-name{color:#fff}.embed-field-value{color:rgba(255,255,255,.6)}.embed-footer{color:rgba(255,255,255,.6)}.reaction{background-color:rgba(255,255,255,.05)}.reaction-count{color:rgba(255,255,255,.3)}.info{display:flex;max-width:100%;margin:0 5px 10px 5px}.guild-icon-container{flex:0}.guild-icon{max-width:88px;max-height:88px}.metadata{flex:1;margin-left:10px}.guild-name{font-size:1.2em}.channel-name{font-size:1em}.channel-topic{margin-top:2px}.channel-message-count{margin-top:2px}.channel-timezone{margin-top:2px;font-size:.9em}.channel-date-range{margin-top:2px}</style>` +
        `<script>function scrollToMessage(e,t){var o=document.getElementById("message-"+t);null!=o&&(e.preventDefault(),o.classList.add("message--highlighted"),window.scrollTo({top:o.getBoundingClientRect().top-document.body.getBoundingClientRect().top-window.innerHeight/2,behavior:"smooth"}),window.setTimeout(function(){o.classList.remove("message--highlighted")},2e3))}function scrollToMessage(e,t){var o=document.getElementById("message-"+t);o&&(e.preventDefault(),o.classList.add("message--highlighted"),window.scrollTo({top:o.getBoundingClientRect().top-document.body.getBoundingClientRect().top-window.innerHeight/2,behavior:"smooth"}),window.setTimeout(function(){o.classList.remove("message--highlighted")},2e3))}function showSpoiler(e,t){t&&t.classList.contains("spoiler--hidden")&&(e.preventDefault(),t.classList.remove("spoiler--hidden"))}</script>` +
        `<script>document.addEventListener('DOMContentLoaded', () => {document.querySelectorAll('.pre--multiline').forEach((block) => {hljs.highlightBlock(block);});});</script>` +
        `</head>`;
      let messagesArray = [];
      msglimit = Limit || 1000;
      let messageCollection = new Collection(); //make a new collection
      let channelMessages = await Channel.messages
        .fetch({
          //fetch the last 100 messages
          limit: 100,
        })
        .catch(() => {}); //catch any error
      messageCollection = messageCollection.concat(channelMessages); //add them to the Collection
      let tomanymsgs = 1; //some calculation for the messagelimit
      if (Number(msglimit) === 0) msglimit = 100; //if its 0 set it to 100
      let messagelimit = Number(msglimit) / 100; //devide it by 100 to get a counter
      if (messagelimit < 1) messagelimit = 1; //set the counter to 1 if its under 1
      while (channelMessages.size === 100) {
        //make a loop if there are more then 100 messages in this channel to fetch
        if (tomanymsgs === messagelimit) break; //if the counter equals to the limit stop the loop
        tomanymsgs += 1; //add 1 to the counter
        let lastMessageId = channelMessages.lastKey(); //get key of the already fetched messages above
        channelMessages = await Channel.messages
          .fetch({
            limit: 100,
            before: lastMessageId,
          })
          .catch(() => {}); //Fetch again, 100 messages above the already fetched messages
        if (channelMessages)
          //if its true
          messageCollection = messageCollection.concat(channelMessages); //add them to the collection
      }
      let Messages = [...messageCollection.values()];
      let messagescount = Messages.length;
      let msgs = Messages.reverse(); //reverse the array to have it listed like the discord chat
      //now for every message in the array make a new paragraph!
      await msgs.forEach(async (msg) => {
        //Aug 02, 2021 12:20 AM
        if (msg.type == "DEFAULT") {
          let time = moment(msg.createdTimestamp).format(
            "MMM DD, YYYY HH:mm:ss"
          );
          let subcontent =
            `<div class="message-group">` +
            `<div class="ath-av-container"><img class="ath-av"src="${msg.author.displayAvatarURL(
              { dynamic: true }
            )}" /></div>` +
            `<div class="messages">` +
            `<span class="ath-name" title="${msg.author.username}" style="color: ${msg.member.roles.highest.hexColor};">${msg.author.tag}</span>`;
          if (msg.author.bot) subcontent += `<span class="bot-tag">BOT</span>`;
          subcontent +=
            `<span class="tst">ID: ${msg.author.id} | </span>` +
            `<span class="tst">${time} ${
              msg.editedTimestamp ? `(edited)` : msg.editedAt ? `(edited)` : ""
            }</span>` +
            `<div class="message">`;
          if (msg.content) {
            subcontent += `<div class="content"><div class="markdown"><span class="preserve-whitespace">${markdowntohtml(
              String(msg.cleanContent ? msg.cleanContent : msg.content).replace(
                /\n/gi,
                "<br/>"
              )
            )}</div></div>`;
          }
          if (msg.embeds[0]) {
            subcontent += `<div class="embed"><div class=embed-color-pill style=background-color:"${
              msg.embeds[0].color ? msg.embeds[0].color : "transparent"
            }"></div><div class=embed-content-container><div class=embed-content><div class=embed-text>`;

            if (msg.embeds[0].author) {
              subcontent += `<div class="embed-ath">`;
              if (msg.embeds[0].author.iconURL) {
                subcontent += `<img class="embed-ath-icon" src="${msg.embeds[0].author.iconURL}">`;
              }
              if (msg.embeds[0].author.name) {
                subcontent += `<div class="embed-ath-name"><span class="markdown">${markdowntohtml(
                  String(msg.embeds[0].author.name).replace(/\n/gi, "<br/>")
                )}</span></div>`;
              }
              subcontent += `</div>`;
            }
            if (msg.embeds[0].title) {
              subcontent += `<div class="embed-title"><span class="markdown">${markdowntohtml(
                String(msg.embeds[0].title).replace(/\n/gi, "<br/>")
              )}</span></div>`;
            }
            if (msg.embeds[0].description) {
              subcontent += `<div class="embed-description preserve-whitespace"><span class="markdown" style="color: rgba(255,255,255,.6) !important;">${markdowntohtml(
                String(msg.embeds[0].description).replace(/\n/gi, "<br/>")
              )}</span></div>`;
            }
            if (msg.embeds[0].image) {
              subcontent += `<div class="embed-image-container"><img class="embed-footer-image" src="${msg.embeds[0].image.url}"></div>`;
            }
            if (msg.embeds[0].fields && msg.embeds[0].fields.length > 0) {
              subcontent += `<div class="embed-fields">`;
              for (let i = 0; i < msg.embeds[0].fields.length; i++) {
                subcontent += `<div class="embed-field ${
                  msg.embeds[0].fields[i].inline ? `embed-field--inline` : ``
                }">`;
                const field = msg.embeds[0].fields[i];
                if (field.key) {
                  subcontent += `<div class="embed-field-name">${markdowntohtml(
                    String(field.key).replace(/\n/gi, "<br/>")
                  )}</div>`;
                }
                if (field.value) {
                  subcontent += `<div class="embed-field-value">${markdowntohtml(
                    String(field.value).replace(/\n/gi, "<br/>")
                  )}</div>`;
                }
                subcontent += `</div>`;
              }
              subcontent += `</div>`;
            }
            if (msg.embeds[0].footer) {
              subcontent += `<div class="embed-footer">`;
              if (msg.embeds[0].footer.iconURL) {
                subcontent += `<img class="embed-footer-icon" src="${msg.embeds[0].footer.iconURL}">`;
              }
              if (msg.embeds[0].footer.text) {
                subcontent += `<div class="embed-footer-text"><span class="markdown">${markdowntohtml(
                  String(msg.embeds[0].footer.text).replace(/\n/gi, "<br/>")
                )}</span></div>`;
              }
              subcontent += `</div>`;
            }
            subcontent += `</div>`;
            if (msg.embeds[0].thumbnail && msg.embeds[0].thumbnail.url) {
              subcontent += `<img class="embed-thumbnail" src="${msg.embeds[0].thumbnail.url}">`;
            }
            subcontent += `</div></div></div>`;
          }
          if (msg.reactions && msg.reactions.cache.size > 0) {
            subcontent += `<div class="reactions">`;
            for (const reaction of msg.reactions.cache.map((r) => r)) {
              subcontent += `<div class=reaction>${
                reaction.emoji?.url
                  ? `<img class="emoji emoji--small" src="${
                      reaction.emoji?.url
                    }" alt="${
                      "<" + reaction.emoji?.animated
                        ? "a"
                        : "" +
                          ":" +
                          reaction.emoji?.name +
                          ":" +
                          reaction.emoji?.id +
                          ">"
                    }">`
                  : reaction.emoji?.name.toString()
              }<span class="reaction-count">${reaction.count}</span></div>`;
            }
            subcontent += `</div>`;
          }
          subcontent += `</div></div></div>`;
          messagesArray.push(subcontent);
        }
        if (msg.type == "PINS_ADD") {
          let time = moment(msg.createdTimestamp).format(
            "MMM DD, YYYY HH:mm:ss"
          );
          let subcontent =
            `<div class="message-group">` +
            `<div class="ath-av-container"><img class="ath-av"src="https://cdn-0.emojis.wiki/emoji-pics/twitter/pushpin-twitter.png" style="background-color: #000;filter: alpha(opacity=40);opacity: 0.4;" /></div>` +
            `<div class="messages">` +
            `<span class="ath-name" title="${msg.author.username}" style="color: ${msg.member.roles.highest.hexColor};">${msg.author.tag}</span>`;
          if (msg.author.bot) subcontent += `<span class="bot-tag">BOT</span>`;
          subcontent += `<span class="tst" style="font-weight:500;color:#848484;font-size: 14px;">pinned a message to this channel.</span><span class="tst">${time}</span></div></div></div>`;
          messagesArray.push(subcontent);
        }
      });
      baseHTML +=
        `<body><div class="info"><div class="guild-icon-container"> <img class="guild-icon" src="${Guild.iconURL(
          { dynamic: true }
        )}" />` +
        `</div><div class="metadata">` +
        `<div class="guild-name"><strong>Guild:</strong> ${Guild.name} (<mark>${Guild.id})</mark></div>` +
        `<div class="channel-name"><strong>Channel:</strong> ${Channel.name} (<mark>${Channel.id})</mark></div>` +
        `<div class="channel-message-count"><mark>${messagescount} Messages</mark></div>` +
        `<div class="channel-timezone"><strong>Timezone-Log-Created:</strong> <mark>${moment(
          Date.now()
        ).format(
          "MMM DD, YYYY HH:mm"
        )}</mark> | <em>[MEZ] Europe/London</em></div>` +
        `</div></div>` +
        `<div class="chatlog">`;
      baseHTML += messagesArray.join("\n");
      baseHTML += `<div class="message-group"><div class="ath-av-container"><img class="ath-av"src="https://logosmarken.com/wp-content/uploads/2020/12/Discord-Logo.png" /></div><div class="messages"><span class="ath-name" style="color: #ff5151;">TICKET LOG INFORMATION</span><span class="bot-tag">✓ SYSTEM</span><span class="timestamp">Mind this Information</span><div class="message " ><div class="content"><div class="markdown"><span class="preserve-whitespace"><i><blockquote>If there are Files, Attachments, Videos or Images, they won't always be displayed cause they will be unknown and we don't want to spam an API like IMGUR!</blockquote></i></span></div></div></div></div></div></div></body></html>`;
      fs.writeFileSync(`${process.cwd()}/${Channel.name}.html`, baseHTML); //write everything in the docx file
      resolve(`${process.cwd()}/${Channel.name}.html`);
      return;
      function markdowntohtml(tomarkdown) {
        mentionReplace(tomarkdown.split(" "));
        function mentionReplace(splitted) {
          for (arg of splitted) {
            const memberatches = arg.match(/<@!?(\d+)>/);
            const rolematches = arg.match(/<@&(\d+)>/);
            const channelmatches = arg.match(/<#(\d+)>/);
            if (rolematches) {
              let role = Guild.roles.cache.get(rolematches[1]);
              if (role) {
                let torpleace = new RegExp(rolematches[0], "g");
                tomarkdown = tomarkdown.replace(
                  torpleace,
                  `<span title="${role.id}" style="color: ${role.hexColor};">@${role.name}</span>`
                );
              }
            }
            if (memberatches) {
              let member = Guild.members.cache.get(memberatches[1]);
              if (member) {
                let torpleace = new RegExp(memberatches[0], "g");
                tomarkdown = tomarkdown.replace(
                  torpleace,
                  `<span class="mention" title="${member.id}">@${member.user.username}</span>`
                );
              }
            }
            if (channelmatches) {
              let channel = Guild.channels.cache.get(channelmatches[1]);
              if (channel) {
                let torpleace = new RegExp(channelmatches[0], "g");
                tomarkdown = tomarkdown.replace(
                  torpleace,
                  `<span class="mention" title="${channel.id}">@${channel.name}</span>`
                );
              }
            }
          }
        }
        var output = "";
        var BLOCK = "block";
        var INLINE = "inline";
        var parseMap = [
          {
            // <p>
            pattern: /\n(?!<\/?\w+>|\s?\*|\s?[0-9]+|>|\&gt;|-{5,})([^\n]+)/g,
            replace: "$1<br/>",
            type: BLOCK,
          },
          {
            // <blockquote>
            pattern: /\n(?:&gt;|\>)\W*(.*)/g,
            replace: "<blockquote><p>$1</p></blockquote>",
            type: BLOCK,
          },
          {
            // <ul>
            pattern: /\n\s?\*\s*(.*)/g,
            replace: "<ul>\n\t<li>$1</li>\n</ul>",
            type: BLOCK,
          },
          {
            // <ol>
            pattern: /\n\s?[0-9]+\.\s*(.*)/g,
            replace: "<ol>\n\t<li>$1</li>\n</ol>",
            type: BLOCK,
          },
          {
            // <strong>
            pattern: /(\*\*|__)(.*?)\1/g,
            replace: "<strong>$2</strong>",
            type: INLINE,
          },
          {
            // <em>
            pattern: /(\*)(.*?)\1/g,
            replace: "<em>$2</em>",
            type: INLINE,
          },
          {
            // <a>
            pattern: /([^!])\[([^\[]+)\]\(([^\)]+)\)/g,
            replace: '$1<a href="$3">$2</a>',
            type: INLINE,
          },
          {
            // <img>
            pattern: /!\[([^\[]+)\]\(([^\)]+)\)/g,
            replace: '<img src="$2" alt="$1" />',
            type: INLINE,
          },
          {
            // <code>
            pattern: /`(.*?)`/g,
            replace: "<mark>$1</mark>",
            type: INLINE,
          },
        ];
        function parse(string) {
          output = "\n" + string + "\n";
          parseMap.forEach(function (p) {
            output = output.replace(p.pattern, function () {
              return replace.call(this, arguments, p.replace, p.type);
            });
          });
          output = clean(output);
          output = output.trim();
          output = output.replace(/[\n]{1,}/g, "\n");
          return output;
        }
        function replace(matchList, replacement, type) {
          var i, $$;
          for (i in matchList) {
            if (!matchList.hasOwnProperty(i)) {
              continue;
            }
            replacement = replacement.split("$" + i).join(matchList[i]);
            replacement = replacement.split("$L" + i).join(matchList[i].length);
          }
          if (type === BLOCK) {
            replacement = replacement.trim() + "\n";
          }
          return replacement;
        }
        function clean(string) {
          var cleaningRuleArray = [
            {
              match: /<\/([uo]l)>\s*<\1>/g,
              replacement: "",
            },
            {
              match: /(<\/\w+>)<\/(blockquote)>\s*<\2>/g,
              replacement: "$1",
            },
          ];
          cleaningRuleArray.forEach(function (rule) {
            string = string.replace(rule.match, rule.replacement);
          });
          return string;
        }

        let output__ = parse(tomarkdown);
        return output__;
      }
    } catch (e) {
      reject(e);
      return;
    }
  });
}

/**
 *
 * @param {*} title String | The title of the embed
 * @param {*} text Array | The text to paginate
 * @param {*} res Interaction/Message | The interaction or message that triggered the command
 * @returns Null | does the work
 */

async function createPaginationEmbed(title, text, res) {
  const msg = await res
    .reply({ embeds: [await createEmbed(0, 0, text, title, res)] })
    .then(async (msg) => {
      if (text.length <= 10) return;

      let button1 = new Discord.ButtonBuilder()
        .setCustomId("back_button")
        .setEmoji("⬅️")
        .setStyle(Discord.ButtonStyle.Primary)
        .setDisabled(true);

      let button2 = new Discord.ButtonBuilder()
        .setCustomId("forward_button")
        .setEmoji("➡️")
        .setStyle(Discord.ButtonStyle.Primary);

      let row = new Discord.ActionRowBuilder().addComponents(button1, button2);

      msg.edit({
        embeds: [await createEmbed(0, 0, text, title, res)],
        components: [row],
      });

      let currentIndex = 0;
      const collector = res.channel.createMessageComponentCollector({
        componentType: Discord.ComponentType.Button,
        time: 60000,
      });

      collector.on("collect", async (btn) => {
        if (btn.user.id == (res.user?.id || res.author?.id) && btn.message.id == msg.id) {
          btn.customId === "back_button"
            ? (currentIndex -= 10)
            : (currentIndex += 10);

          let btn1 = new Discord.ButtonBuilder()
            .setCustomId("back_button")
            .setEmoji("⬅️")
            .setStyle(Discord.ButtonStyle.Primary)
            .setDisabled(true);

          let btn2 = new Discord.ButtonBuilder()
            .setCustomId("forward_button")
            .setEmoji("➡️")
            .setStyle(Discord.ButtonStyle.Primary)
            .setDisabled(true);

          if (currentIndex !== 0) btn1.setDisabled(false);
          if (currentIndex + 10 < text.length) btn2.setDisabled(false);

          let row2 = new Discord.ActionRowBuilder().addComponents(btn1, btn2);

          msg.edit({
            embeds: [
              await createEmbed(currentIndex, currentIndex, text, title, res),
            ],
            components: [row2],
          });
          btn.deferUpdate();
        }
      });

      collector.on("end", async (btn) => {
        let btn1Disable = new Discord.ButtonBuilder()
          .setCustomId("back_button")
          .setEmoji("⬅️")
          .setStyle(Discord.ButtonStyle.Primary)
          .setDisabled(true);

        let btn2Disable = new Discord.ButtonBuilder()
          .setCustomId("forward_button")
          .setEmoji("➡️")
          .setStyle(Discord.ButtonStyle.Primary)
          .setDisabled(true);

        let rowDisable = new Discord.ActionRowBuilder().addComponents(
          btn1Disable,
          btn2Disable
        );

        msg.edit({
          embeds: [
            await createEmbed(currentIndex, currentIndex, text, title, res),
          ],
          components: [rowDisable],
        });
      });
    });
}

/**
 *
 *
 * @param {*} text Array | The text to paginate
 * @param {*} title String | The title of the embed
 * @param {*} res Interaction/Message | The interaction or message that triggered the command
 * @returns Array of one embed
 */

async function createEmbed(start, end, text, title, res, len = 10) {
  result = (text.slice(start, end + len)).join("\n")
  let embed = new Discord.EmbedBuilder()
    .setTitle(title)
    .setDescription(result)
    .setFooter(
      {text: `Page ${Math.floor(start / len) + 1} of ${Math.floor(text.length / len) + 1}`, iconURL: ee.iconURL}
    ).setColor(ee.color);

  return embed;
}

/**
 * @param {String} str
 * @param {Number} length
 * @returns {String}
 * @example
 * smartSlice("Hello World", 5);
 * // => "Hello"
 * smartSlice("Hello World", 50);
 * // => "Hello World"
 * smartSlice("Hello World", 8);
 * // => "Hello"
 */

function smartSlice(str, length) {
  if (str.length <= length) {
    return str;
  }

  let slicedText = str.slice(0, length);
  const lastSpaceIndex = slicedText.lastIndexOf(" ");

  if (lastSpaceIndex !== -1) {
    slicedText = slicedText.slice(0, lastSpaceIndex);
  }

  return slicedText;
}

/**
 * 
 * @param {String} content | The content to post to sourcebin
 * @param {String} title | The title of the sourcebin
 * @param {String} language | The language of the sourcebin
 * @param {String} name | The name of the sourcebin
 * @param {String} description | The description of the sourcebin
 * @returns {Object} | The sourcebin object
 * @example
 * await postToBin("Hello World", "Hello World", "js", "NOVA Bot", "This was created using NOVA Bot")
 * // => { url: 'https://sourceb.in/xxxxxx', short: 'xxxxxx', raw: 'https://cdn.sourceb.in/bins/xxxxxx/0' }
 */

async function postToBin(content, title, language = "js", name = "NOVA Bot", description = "This was created using NOVA Bot") {
  try {
    const response = await sourcebin.create(
      [
        {
          name: name,
          content,
          languageId: language,
        },
      ],
      {
        title,
        description: description,
      }
    );
    return {
      url: response.url,
      short: response.short,
      raw: `https://cdn.sourceb.in/bins/${response.key}/0`,
    };
  } catch (ex) {
    console.log(ex);
  }
}

/**
 * 
 * @param {String} text | The text to check
 * @returns {Boolean} | Whether the text contains a link or not
 */

function containsLink(text) {
  return /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/.test(
    text
  );
}

/**
 * 
 * @param {String} text | The text to check
 * @returns {Boolean} | Whether the text contains a discord invite or not
 */

function containsDiscordInvite(text) {
  return /(https?:\/\/)?(www.)?(discord.(gg|io|me|li|link|plus)|discorda?p?p?.com\/invite|invite.gg|dsc.gg|urlcord.cf)\/[^\s/]+?(?=\b)/.test(
    text
  );
}

/**
 * @param {Array} perms | The permissions to parse
 * @returns {String} | The parsed permissions
  */
function parsePermissions(perms) {
  const permissionWord = `permission${perms.length > 1 ? "s" : ""}`;
  return "`" + perms.map((perm) => permissions[perm]).join(", ") + "` " + permissionWord;
}

/**
 * 
 * @param {Array} arr1 | The first array
 * @param {Array} arr2 | The second array
 * @returns {Array} | The array with the duplicates removed
 */
function removeDuplicatesPerms(arr1, arr2) {
  if (arr1.includes("Administrator")) return [];
  return arr1.filter((x) => !arr2.includes(x));
}

/**

Generates a giveaway embed based on the provided data and options.
@param {EmbedBuilder} oldData - The old data of the giveaway embed.
@param {Object} options - The options for the giveaway embed.
@param {String} options.color - The color of the embed. Defaults to ee.color if not provided.
@param {String} options.EmbedAuthor - The author of the embed. Defaults to null if not provided.
@param {String} options.banner - The banner image of the embed. Defaults to null if not provided.
@param {String} options.prize - The prize of the giveaway.
@param {Number} options.winnerCount - The number of winners for the giveaway.
@param {String} options.host - The host of the giveaway.
@param {String} options.entriesLimit - The limit of entries for the giveaway. Defaults to "infinite" if not provided.
@param {Number} options.time - The time remaining for the giveaway.
@param {String[]} options.multi - An array of multipliers for the giveaway. Defaults to an empty array if not provided.
@param {String[]} options.requirements - An array of requirements for the giveaway. Defaults to an empty array if not provided.
@param {String} type - The type of the giveaway embed.
@returns {EmbedBuilder} - The generated giveaway embed.
*/

function generateGiveawayEmbed(oldData, options = {
  color: ee.color,
  EmbedAuthor: null,
  banner: null,
  prize: null,
  winnerCount: null,
  host: null,
  entriesLimit: "infinte",
  time: null,
}, type = "main") {
  const embed = new EmbedBuilder(oldData)
  if (type && !["noEntries", "End"].includes(type)) {

      embed.setColor(options.color ?? ee.color)
          .setAuthor(options.EmbedAuthor || null)
          .setImage(options.banner || null)
          .setDescription(`
  ${formatEmoji(allEmojis.Giveaway, false)} **Giveaway Details**
  ${formatEmoji(allEmojis.blankspace, false)}${formatEmoji(allEmojis.nova_prize, false)} Prize: **${options.prize}**
  ${formatEmoji(allEmojis.blankspace, false)}${formatEmoji(allEmojis.nova_winner, false)} No. of Winners: ${options.winnerCount}
  ${formatEmoji(allEmojis.blankspace, false)}${formatEmoji(allEmojis.nova_host, false)} Host: ${options.host} ${options.entriesLimit != 'infinite' ? `\n ${formatEmoji(allEmojis.blankspace, false)}${formatEmoji(allEmojis.nova_thumb_point, false)} Entry will stop at ${options.entriesLimit} Entries` : ``}
  ${formatEmoji(allEmojis.blankspace, false)}${formatEmoji(allEmojis.nova_clock, false)} Ends: <t:${((Date.now() + options.time) / 1000).toFixed(0)}>  [<t:${((Date.now() + options.time) / 1000).toFixed(0)}:R>]
  ${options?.multi?.length == 0 ? `` : `\n${formatEmoji(allEmojis.nova_multiplier, false)} **Multiplier**\n`.concat(options.multi)}
  ${options?.requirements?.length == 0 ? `` : `${formatEmoji(allEmojis.nova_requirments, false)} **Requirements**\n`.concat(options.requirements)}
  `)

      return embed;
  }
  else if (type && type == "noEntries") {
      embed.setColor(typeof oldData == "undefined" ? options.color ?? ee.color : oldData.color ?? ee.color)
          .setAuthor(typeof oldData == "undefined" ? options.EmbedAuthor ?? null : oldData.author ?? null)
          .setImage(typeof oldData == "undefined" ? options.banner ?? null : oldData.image ?? null)
          .setDescription(`
  ${formatEmoji(allEmojis.Giveaway, false)} **Giveaway Details**
  ${formatEmoji(allEmojis.blankspace, false)}${formatEmoji(allEmojis.nova_prize, false)} Prize: **${options.prize}**
  ${formatEmoji(allEmojis.blankspace, false)}${formatEmoji(allEmojis.nova_winner, false)} Winners: **No Winners**
  ${formatEmoji(allEmojis.blankspace, false)}${formatEmoji(allEmojis.nova_host, false)} Host: ${userMention(options.host)} ${options.entriesLimit != 'infinite' ? `\n ${formatEmoji(allEmojis.blankspace, false)}${formatEmoji(allEmojis.nova_thumb_point, false)} Entry stopped at ${options.entriesLimit} Entries` : ``}
  ${formatEmoji(allEmojis.blankspace, false)}${allEmojis.nova_no} Ends: Giveaway Cancelled 
  ${options.multi.length == 0 ? `` : `\n${formatEmoji(allEmojis.nova_multiplier, false)} **Multiplier**\n`.concat(options.multi)}
  ${options.requirements.length == 0 ? `` : `${formatEmoji(allEmojis.nova_requirments, false)} **Requirements**\n`.concat(options.requirements)}
  `).setFooter(typeof oldData == "undefined" ? options.footer ?? { text: "Giveaway has been cancelled due to no participation" } : oldData.footer ?? { text: "Giveaway has been cancelled due to no participation" })

      return embed;
  }
  else if (type && type == "End") {
      embed.setColor(options.color ?? ee.color)
          .setAuthor(typeof oldData == "undefined" ? options.EmbedAuthor ?? null : oldData.author ?? null)
          .setImage(typeof oldData == "undefined" ? options.banner ?? null : oldData.image ?? null)
          .setDescription(`
  ${formatEmoji(allEmojis.Giveaway, false)} **Giveaway Details**
  ${formatEmoji(allEmojis.blankspace, false)}${formatEmoji(allEmojis.nova_prize, false)} Prize: **${options.prize}**
  ${formatEmoji(allEmojis.blankspace, false)}${formatEmoji(allEmojis.nova_winner, false)} Winners: ${options.winners.length != 0 ? options.winners : '\`Error came\` :skull:'}
  ${formatEmoji(allEmojis.blankspace, false)}${formatEmoji(allEmojis.nova_host, false)} Host: ${userMention(options.host)} ${options.entriesLimit != 'infinite' ? `\n ${formatEmoji(allEmojis.blankspace, false)}${formatEmoji(allEmojis.nova_thumb_point, false)} Entry stopped at ${options.entriesLimit} Entries` : ``}
  ${formatEmoji(allEmojis.blankspace, false)}${formatEmoji(allEmojis.nova_clock, false)} Ended At: <t:${((Date.now()) / 1000).toFixed(0)}>  [<t:${((Date.now()) / 1000).toFixed(0)}:R>]
  ${options.multi.length == 0 ? `` : `\n${formatEmoji(allEmojis.nova_multiplier, false)} **Multiplier**\n`.concat(options.multi)}
  ${options.requirements.length == 0 ? `` : `${formatEmoji(allEmojis.nova_requirments, false)} **Requirements**\n`.concat(options.requirements)}
  `).setFooter(typeof oldData == "undefined" ? options.footer ?? { text: "Giveaway has been ended." } : oldData.footer ?? { text: "Giveaway has been ended." })

      return embed
  }
}
/**
 * 
 * @param {Array} entries | The entries array
 * @param {Number} winnerCount | The number of winner to be selected
 * @returns {Object} | The object containing the new entries, winnerId and winners
 */

function gReRoll(entries, winnerCount) {
  let winnerId = ``
  let winners = []
  try {
      for (let i = 0; i < winnerCount && entries?.length != 0; i++) {
          let rid = entries[Math.floor(Math.random() * entries?.length)];
          if (winnerId.length == 0) winnerId = winnerId + `<@${rid}>`;
          else winnerId = winnerId + `, <@${rid}>`;

          winners.push(rid);

          let r = [];
          entries.forEach(x => {
              if (x != rid) r.push(x)
          });
          entries = r;
      };
  } catch (error) { };

  return { entries, winnerId, winners }
}


/**

Disables all buttons in the given array of components.
@param {Array} msg - Message Data.
@returns {Array} - The updated array of components with disabled buttons.
*/

function disableButtons(msg) {
  const components = msg.components;
  for (let x = 0; x < components.length; x++) {
    for (let y = 0; y < components[x].components.length; y++) {
      components[x].components[y].data.disabled = true;
    }
  }
  return components;
}