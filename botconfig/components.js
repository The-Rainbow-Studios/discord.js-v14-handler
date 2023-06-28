const { ButtonBuilder, ButtonStyle, EmbedBuilder, ActionRowBuilder } = require("discord.js");
const allEmojis = require("./emojis.js");
module.exports = {
    yes: new ButtonBuilder()
        .setStyle(ButtonStyle.Success)
        .setLabel("Yes")
        .setCustomId("yes")
        .setEmoji(allEmojis.nova_yes),
    no: new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setLabel("No")
        .setCustomId("no")
        .setEmoji(allEmojis.nova_no),
    cancel: new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setLabel("Cancel")
        .setCustomId("cancel")
        .setEmoji(allEmojis.nova_no),
    /**
     * 
     * @param {String} url | The URL to redirect to 
     * @param {String} label | The label of the button, defaults to "Click Here"
     * @param {Snowflake} emoji | The emoji to use, defaults to the link emoji
     * @returns {Discord.ButtonBuilder} | The button
     */
    link: function (url, label = "Click Here", emoji = allEmojis.nova_link) {
        return new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel(label)
            .setURL(url)
            .setEmoji(emoji);
    }

};