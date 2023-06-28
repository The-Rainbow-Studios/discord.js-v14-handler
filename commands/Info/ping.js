const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../../botconfig/config.js");

const settings = require("../../botconfig/settings.js");
const mongoose = require("mongoose");
module.exports = {
  name: "ping", //the command name for the Slash Command
  slashName: "ping", //the command name for the Slash Command
  category: "Info",
  description: "Gives you information on how fast the Bot is", //the command description for Slash Command Overview
  cooldown: 1,
  memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
 botpermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [
    //OPTIONAL OPTIONS, make the array empty / dont add this option if you don't need options!
    //INFORMATIONS! You can add Options, but mind that the NAME MUST BE LOWERCASED! AND NO SPACES!!!, for the CHOCIES you need to add a array of arrays; [ ["",""] , ["",""] ]
    //{"Integer": { name: "ping_amount", description: "How many times do you want to ping?", required: true }}, //to use in the code: interacton.getInteger("ping_amount")
    //{"String": { name: "ping_amount", description: "How many times do you want to ping?", required: true }}, //to use in the code: interacton.getString("ping_amount")
    //{"User": { name: "ping_a_user", description: "To Ping a user lol", required: false }}, //to use in the code: interacton.getUser("ping_a_user")
    //{"Channel": { name: "what_channel", description: "To Ping a Channel lol", required: false }}, //to use in the code: interacton.getChannel("what_channel")
    //{"Role": { name: "what_role", description: "To Ping a Role lol", required: false }}, //to use in the code: interacton.getRole("what_role")
    //{"IntChoices": { name: "what_ping", description: "What Ping do you want to get?", required: true, choices: [["Bot", 1], ["Discord Api", 2]] }, //here the second array input MUST BE A NUMBER // TO USE IN THE CODE: interacton.getInteger("what_ping")
    //here the second array input MUST BE A STRING // TO USE IN THE CODE: interacton.getString("what_ping")
  ],
  usage: "ping",
  slashRun: async (client, interaction) => {
    try {
      //things u can directly access in an interaction!
      const {
        member,
        channelId,
        guildId,
        applicationId,
        commandName,
        deferred,
        replied,
        ephemeral,
        options,
        id,
        createdTimestamp,
      } = interaction;
      const { guild } = member;
	  await interaction.deferReply({ ephemeral: false }).catch((e) => {console.log(e)});
	  const ping = Math.floor(createdTimestamp - interaction.createdTimestamp);
	  const result = await mongoose.connection.db.admin().ping();
	  const mongooseSeconds = (result.ok % 60000) / 1000;
	  var pingSeconds = (ping % 60000) / 1000;
	  var apiSeconds = (client.ws.ping % 60000) / 1000;
	  interaction.editReply({
		embeds: [
			new EmbedBuilder()
      .setTitle(`🏓 Pong!`)
      .setColor(client.embed.color)
      .addFields({
        name: `📡 Websocket Latency`,
        value: `>>> \`\`\`yml
        ${ping}ms (${pingSeconds}s)\`\`\``,
        inline: true,
        }, 
        {
        name: `🛰 API Latency`,
        value: `>>> \`\`\`yml
        ${client.ws.ping}ms (${apiSeconds}s)\`\`\``,
        inline: true,
        },
        {
        name: `📂 Database Latency`,
        value: `>>> \`\`\`yml
        ${result.ok}ms (${mongooseSeconds}s)\`\`\``,
        inline: false,
        })

		]
	  });

    } catch (e) {
      console.log(e);
    }
  },
  messageRun: async (
    client,
    message,
    args,
    plusArgs,
    cmdUser,
    text,
    prefix
  ) => {
    const msg = await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`Calculating ping...`)
          .setColor(client.embed.color),
      ],
    });
    const ping = Math.floor(msg.createdTimestamp - message.createdTimestamp);
    const result = await mongoose.connection.db.admin().ping();
    const mongooseSeconds = (result.ok % 60000) / 1000;
    var pingSeconds = (ping % 60000) / 1000;
    var apiSeconds = (client.ws.ping % 60000) / 1000;
    msg.edit({
      embeds: [
        new EmbedBuilder()
          .setTitle(`🏓 Pong!`)
          .setColor(client.embed.color)
          .addFields({
            name: `📡 Websocket Latency`,
            value: `>>> \`\`\`yml
            ${ping}ms (${pingSeconds}s)\`\`\``,
            inline: true,
            }, 
            {
            name: `🛰 API Latency`,
            value: `>>> \`\`\`yml
            ${client.ws.ping}ms (${apiSeconds}s)\`\`\``,
            inline: true,
            },
            {
            name: `📂 Database Latency`,
            value: `>>> \`\`\`yml
            ${result.ok}ms (${mongooseSeconds}s)\`\`\``,
            inline: false,
            })
  
      ]
    });
  },
};
