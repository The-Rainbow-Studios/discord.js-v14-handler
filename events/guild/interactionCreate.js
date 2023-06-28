//Import Modules
const config = require(`../../botconfig/config.js`);

const settings = require(`../../botconfig/settings.js`);
const { onCoolDown, replacemsg } = require("../../handlers/functions");
const Discord = require("discord.js");
module.exports = async (client, interaction) => {
  if (interaction.isAutocomplete()) {
    //DO STUFF HERE
  }
  if (interaction.isContextMenuCommand()) {
    //DO STUFF HERE
  }
  if (interaction.isButton()) {
    //DO STUFF HERE

  }
  
  const CategoryName = interaction.commandName;
  let command = false;
  try {
    if (
      client.slashCommands.has(
        CategoryName + interaction.options.getSubcommand()
      )
    ) {
      command = client.slashCommands.get(
        CategoryName + interaction.options.getSubcommand()
      );
    }
  } catch {
    if (client.slashCommands.has("normal" + CategoryName)) {
      command = client.slashCommands.get("normal" + CategoryName);
    }
  }
  if (command) {

    //if cmd is restricted check if user is moderator or developer
    if (String(command.restricted) === "true") {
      return interaction
      .reply({
        embeds: [
          new Discord.EmbedBuilder()
            .setColor(client.embed.wrongcolor)
            .setFooter({ text: client.embed.footertext, iconURL: client.embed.footericon })
            .setTitle(
              replacemsg(settings.messages.notallowed_to_exec_cmd.title)
            )
            .setDescription(
              replacemsg(
                settings.messages.notallowed_to_exec_cmd.description.restricted,
                {
                  command: command,
                  prefix: prefix,
                  res: interaction,
                }
              )
            ),
        ],
      })
    }
    //check if command is disabled, also check if person is owner then let him pass
    if (String(command.enabled) === "false") {
      return interaction.reply({
        embeds: [
          new Discord.EmbedBuilder()
            .setColor(client.embed.wrongcolor)
            .setFooter({ text: client.embed.footertext, iconURL: client.embed.footericon })
            .setTitle(
              replacemsg(settings.messages.notallowed_to_exec_cmd.title)
            )
            .setDescription(
              replacemsg(
                settings.messages.notallowed_to_exec_cmd.description.disabled,
                {
                  command: command,
                  prefix: client.config.prefix,
                  res: interaction,
                }
              )
            ),
        ],
      });
    }

          if(command.specialFunction) {
            Promise.resolve(command.specialFunction?.(client, interaction))
          }
    if (onCoolDown(interaction, command)) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new Discord.EmbedBuilder()
            .setColor(client.embed.wrongcolor)
            .setFooter({ text: client.embed.footertext, iconURL: client.embed.footericon })
            .setTitle(
              replacemsg(settings.messages.cooldown, {
                prefix: client.config.prefix,
                command: command,
                timeLeft: onCoolDown(interaction, command),
                res: interaction,
              })
            ),
        ],
      });
    }
    //if Command has specific permission return error
    if (
      command.memberpermissions &&
      command.memberpermissions.length > 0 &&
      !interaction.member.permissions.has(command.memberpermissions)
    ) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new Discord.EmbedBuilder()
            .setColor(client.embed.wrongcolor)
            .setFooter({ text: client.embed.footertext, iconURL: client.embed.footericon })
            .setTitle(
              replacemsg(settings.messages.notallowed_to_exec_cmd.title)
            )
            .setDescription(
              replacemsg(
                settings.messages.notallowed_to_exec_cmd.description
                  .memberpermissions,
                {
                  command: command,
                  prefix: client.config.prefix,
                  res: interaction,
                }
              )
            ),
        ],
      });
    }
    //if bot has not enough permissions return error
    if (
      command.botpermissions &&
      command.botpermissions.length > 0 &&
      (!interaction.guild.members.me.permissions.has(command.botpermissions) ||
        interaction.channel
          .permissionsFor(interaction.guild.members.me)
          .missing(command.botpermissions).length > 0)
    ) {
      return interaction.reply({
        ephemeral: true,
        content: `${
          settings.messages.notallowed_to_exec_cmd.titlebotperms
        }\n> ${replacemsg(
          settings.messages.notallowed_to_exec_cmd.description.botpermissions,
          {
            command: command,
            prefix: prefix,
            res: interaction,
          }
        )}`,
      });
    }
    //if Command has specific needed roles return error
    if (
      command.requiredroles &&
      command.requiredroles.length > 0 &&
      interaction.member.roles.cache.size > 0 &&
      !interaction.member.roles.cache.some((r) =>
        command.requiredroles.includes(r.id)
      )
    ) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new Discord.EmbedBuilder()
            .setColor(client.embed.wrongcolor)
            .setFooter({ text: client.embed.footertext, iconURL: client.embed.footericon })
            .setTitle(
              replacemsg(settings.messages.notallowed_to_exec_cmd.title)
            )
            .setDescription(
              replacemsg(
                settings.messages.notallowed_to_exec_cmd.description
                  .requiredroles,
                {
                  command: command,
                  prefix: client.config.prefix,
                  res: interaction,
                }
              )
            ),
        ],
      });
    }
    //if Command has specific users return error
    if (
      command.alloweduserids &&
      command.alloweduserids.length > 0 &&
      !command.alloweduserids.includes(interaction.member.id)
    ) {
      return message.channel.send({
        ephemeral: true,
        embeds: [
          new Discord.EmbedBuilder()
            .setColor(client.embed.wrongcolor)
            .setFooter({ text: client.embed.footertext, iconURL: client.embed.footericon })
            .setTitle(
              replacemsg(settings.messages.notallowed_to_exec_cmd.title)
            )
            .setDescription(
              replacemsg(
                settings.messages.notallowed_to_exec_cmd.description
                  .alloweduserids,
                {
                  command: command,
                  prefix: client.config.prefix,
                  res: interaction,
                }
              )
            ),
        ],
      });
    }
    //execute the Command
    command.slashRun(client, interaction);
  }
};
