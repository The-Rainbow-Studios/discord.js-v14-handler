const config = require(`../../botconfig/config.js`);

const settings = require(`../../botconfig/settings.js`);
const { onCoolDown, replacemsg } = require(`../../handlers/functions`);
const Discord = require("discord.js");
const { discordTimestamp } = require("visa2discord");
const { createPaginationEmbed } = require("../../handlers/functions.js");
module.exports = async (client, message) => {
  try {
    //if the message is not in a guild (aka in dms), return aka ignore the inputs
    if (
      !message.guild ||
      message.guild.available === false ||
      !message.channel ||
      message.webhookId ||
      message.author.bot
    )
      return;
    //if the channel is on partial fetch it
    if (message.channel?.partial) await message.channel.fetch().catch(() => {});
    if (message.member?.partial) await message.member.fetch().catch(() => {});
   

    // if the message  author is a bot, return aka ignore the inputs
    if (message.author.bot) return;
    const prefix = config.prefix;
    const prefixRegex = new RegExp(
      `^(<@!?${client.user.id}>|${escapeRegex(prefix)})`
    );
    if (!prefixRegex.test(message.content)) return;
    const [, mPrefix] = message.content.match(prefixRegex);
    const args = message.content
      .slice(mPrefix.length)
      .trim()
      .split(/ +/)
      .filter(Boolean);
    const cmd = args.length > 0 ? args.shift().toLowerCase() : "";
    const cmdString = args.length > 0 ? cmd + " " + args[0].toLowerCase() : "";
    if (cmd.length == 0 || !cmd) {
      if (mPrefix.includes(client.user.id)) {
        message.reply({
          embeds: [
            new Discord.EmbedBuilder()
              .setColor(client.embed.color)
              .setFooter({
                text: client.embed.footertext,
                iconURL: client.embed.footericon,
              })
              .setTitle(`:thumbsup: **My Prefix here, is __\`${prefix}\`__**`),
          ],
        });
      }
      return;
    }
    let command =
      client.commands.get(cmdString) ||
      client.commands.get(client.aliases.get(cmdString)) ||
      client.commands.get(cmd) ||
      client.commands.get(client.aliases.get(cmd));
    if (command?.name.toLowerCase() === cmdString) args.shift();
    if (command) {
      //if user data is not there then ask him to accept bot rules and add him in the database
      //if cmd is restricted check if user is moderator or developer
      if (
        String(command.restricted) === "true"      ) {
        return message
          .reply({
            embeds: [
              new Discord.EmbedBuilder()
                .setColor(client.embed.wrongcolor)
                .setFooter({
                  text: client.embed.footertext,
                  iconURL: client.embed.footericon,
                })
                .setTitle(
                  replacemsg(settings.messages.notallowed_to_exec_cmd.title)
                )
                .setDescription(
                  replacemsg(
                    settings.messages.notallowed_to_exec_cmd.description
                      .restricted,
                    {
                      command: command,
                      prefix: prefix,
                      res: message,
                    }
                  )
                ),
            ],
          })
          .then((msg) => {
            setTimeout(() => {
              msg.delete().catch((e) => {
                console.log(String(e).grey);
              });
            }, settings.timeout.notallowed_to_exec_cmd.memberpermissions);
          })
          .catch((e) => {
            console.log(String(e).grey);
          });
      }

      //check if command is disabled, also check if person is owner then let him pass
      if (
        String(command.enabled) === "false") {
        return message
          .reply({
            embeds: [
              new Discord.EmbedBuilder()
                .setColor(client.embed.wrongcolor)
                .setFooter({
                  text: client.embed.footertext,
                  iconURL: client.embed.footericon,
                })
                .setTitle(
                  replacemsg(settings.messages.notallowed_to_exec_cmd.title)
                )
                .setDescription(
                  replacemsg(
                    settings.messages.notallowed_to_exec_cmd.description
                      .disabled,
                    {
                      command: command,
                      prefix: prefix,
                      res: message,
                    }
                  )
                ),
            ],
          })
          .then((msg) => {
            setTimeout(() => {
              msg.delete().catch((e) => {
                console.log(String(e).grey);
              });
            }, settings.timeout.notallowed_to_exec_cmd.memberpermissions);
          })
          .catch((e) => {
            console.log(String(e).grey);
          });
      }
      if (command.specialFunction) {
        Promise.resolve(
          command.specialFunction?.(client, message)
        );
      }
      if (onCoolDown(message, command)) {
        return message.reply({
          embeds: [
            new Discord.EmbedBuilder()
              .setColor(client.embed.wrongcolor)
              .setFooter({
                text: client.embed.footertext,
                iconURL: client.embed.footericon,
              })
              .setTitle(
                replacemsg(settings.messages.cooldown, {
                  prefix: prefix,
                  command: command,
                  timeLeft: onCoolDown(message, command),
                  res: message,
                })
              ),
          ],
        });
      }
      try {
        //if Command has specific permission return error
        if (
          command.memberpermissions &&
          command.memberpermissions.length > 0 &&
          !message.member.permissions.has(command.memberpermissions)
        ) {
          return message
            .reply({
              embeds: [
                new Discord.EmbedBuilder()
                  .setColor(client.embed.wrongcolor)
                  .setFooter({
                    text: client.embed.footertext,
                    iconURL: client.embed.footericon,
                  })
                  .setTitle(
                    replacemsg(settings.messages.notallowed_to_exec_cmd.title)
                  )
                  .setDescription(
                    replacemsg(
                      settings.messages.notallowed_to_exec_cmd.description
                        .memberpermissions,
                      {
                        command: command,
                        prefix: prefix,
                        res: message,
                      }
                    )
                  ),
              ],
            })
            .then((msg) => {
              setTimeout(() => {
                msg.delete().catch((e) => {
                  console.log(String(e).grey);
                });
              }, settings.timeout.notallowed_to_exec_cmd.memberpermissions);
            })
            .catch((e) => {
              console.log(String(e).grey);
            });
        }
        //if bot needs specific permissions return error
        if (
          command.botpermissions &&
          command.botpermissions.length > 0 &&
          (!message.guild.members.me.permissions.has(command.botpermissions) ||
            message.channel
              .permissionsFor(message.guild.members.me)
              .missing(command.botpermissions).length > 0)
        ) {
          return message
            .reply({
              content: `${
                settings.messages.notallowed_to_exec_cmd.titlebotperms
              }\n> ${replacemsg(
                settings.messages.notallowed_to_exec_cmd.description
                  .botpermissions,
                {
                  command: command,
                  prefix: prefix,
                  res: message,
                }
              )}`,
            })
            .then((msg) => {
              setTimeout(() => {
                msg.delete().catch((e) => {
                  console.log(String(e).grey);
                });
              }, settings.timeout.notallowed_to_exec_cmd.memberpermissions);
            })
            .catch((e) => {
              console.log(String(e).grey);
            });
        }
        //if Command has specific needed roles return error
        if (
          command.requiredroles &&
          command.requiredroles.length > 0 &&
          message.member.roles.cache.size > 0 &&
          !message.member.roles.cache.some((r) =>
            command.requiredroles.includes(r.id)
          )
        ) {
          return message
            .reply({
              embeds: [
                new Discord.EmbedBuilder()
                  .setColor(client.embed.wrongcolor)
                  .setFooter({
                    text: client.embed.footertext,
                    iconURL: client.embed.footericon,
                  })
                  .setTitle(
                    replacemsg(settings.messages.notallowed_to_exec_cmd.title)
                  )
                  .setDescription(
                    replacemsg(
                      settings.messages.notallowed_to_exec_cmd.description
                        .requiredroles,
                      {
                        command: command,
                        prefix: prefix,
                        res: message,
                      }
                    )
                  ),
              ],
            })
            .then((msg) => {
              setTimeout(() => {
                msg.delete().catch((e) => {
                  console.log(String(e).grey);
                });
              }, settings.timeout.notallowed_to_exec_cmd.requiredroles);
            })
            .catch((e) => {
              console.log(String(e).grey);
            });
        }
        //if Command has specific users return error
        if (
          command.alloweduserids &&
          command.alloweduserids.length > 0 &&
          !command.alloweduserids.includes(message.author.id)
        ) {
          return message
            .reply({
              embeds: [
                new Discord.EmbedBuilder()
                  .setColor(client.embed.wrongcolor)
                  .setFooter({
                    text: client.embed.footertext,
                    iconURL: client.embed.footericon,
                  })
                  .setTitle(
                    replacemsg(settings.messages.notallowed_to_exec_cmd.title)
                  )
                  .setDescription(
                    replacemsg(
                      settings.messages.notallowed_to_exec_cmd.description
                        .alloweduserids,
                      {
                        command: command,
                        prefix: prefix,
                        res: message,
                      }
                    )
                  ),
              ],
            })
            .then((msg) => {
              setTimeout(() => {
                msg.delete().catch((e) => {
                  console.log(String(e).grey);
                });
              }, settings.timeout.notallowed_to_exec_cmd.alloweduserids);
            })
            .catch((e) => {
              console.log(String(e).grey);
            });
        }
        //if command has minimum args, and user dont entered enough, return error
        if (
          command.minargs &&
          command.minargs > 0 &&
          args.length < command.minargs
        ) {
          const embed = new Discord.EmbedBuilder()
            .setColor(client.embed.color)
            .setTitle(`Detailed Information about: \`${command.name}\``);

          if (command.aliases && command.aliases.length > 0)
            embed.addFields({
              name: "**Aliases**",
              value: command.aliases.map((alias) => `\`${alias}\``).join(", "),
            });

          embed.addFields({
            name: "**Cooldown**",
            value: command.cooldown
              ? `\`${command.cooldown} Seconds\``
              : `\`${settings.default_cooldown_in_sec} Second\``,
          });

          if (command.usage)
            embed.addFields({
              name: "**Usage**",
              value: `\`${prefix}${command.usage}\``,
            });

          embed.setDescription(`${Discord.codeBlock(
            "diff",
            `- [] = optional argument
- <> = required argument
- Do NOT type these when using commands!`
          )}
    > ${command.description}`);
          return message
            .reply({
              embeds: [embed],
            })
            .then((msg) => {
              setTimeout(() => {
                msg.delete().catch((e) => {
                  console.log(String(e).grey);
                });
              }, settings.timeout.minargs);
            })
            .catch((e) => {
              console.log(String(e).grey);
            });
        }
        //if command has maximum args, and user enters too many, return error
        if (
          command.maxargs &&
          command.maxargs > 0 &&
          args.length > command.maxargs
        ) {
          const embed = new Discord.EmbedBuilder()
            .setColor(client.embed.color)
            .setTitle(`Detailed Information about: \`${command.name}\``);

          if (command.aliases && command.aliases.length > 0)
            embed.addFields({
              name: "**Aliases**",
              value: command.aliases.map((alias) => `\`${alias}\``).join(", "),
            });

          embed.addFields({
            name: "**Cooldown**",
            value: command.cooldown
              ? `\`${command.cooldown} Seconds\``
              : `\`${settings.default_cooldown_in_sec} Second\``,
          });

          if (command.usage)
            embed.addFields({
              name: "**Usage**",
              value: `\`${prefix}${command.usage}\``,
            });

          embed.setDescription(`${Discord.codeBlock(
            "diff",
            `- [] = optional argument
- <> = required argument
- Do NOT type these when using commands!`
          )}
    > ${command.description}`);
          return message
            .reply({
              embeds: [embed],
            })
            .then((msg) => {
              setTimeout(() => {
                msg.delete().catch((e) => {
                  console.log(String(e).grey);
                });
              }, settings.timeout.maxargs);
            })
            .catch((e) => {
              console.log(String(e).grey);
            });
        }

        //if command has minimum args (splitted with "++"), and user dont entered enough, return error
        if (
          command.minplusargs &&
          command.minplusargs > 0 &&
          args.join(" ").split("++").filter(Boolean).length <
            command.minplusargs
        ) {
          const embed = new Discord.EmbedBuilder()
            .setColor(client.embed.color)
            .setTitle(`Detailed Information about: \`${command.name}\``);

          if (command.aliases && command.aliases.length > 0)
            embed.addFields({
              name: "**Aliases**",
              value: command.aliases.map((alias) => `\`${alias}\``).join(", "),
            });

          embed.addFields({
            name: "**Cooldown**",
            value: command.cooldown
              ? `\`${command.cooldown} Seconds\``
              : `\`${settings.default_cooldown_in_sec} Second\``,
          });

          if (command.usage)
            embed.addFields({
              name: "**Usage**",
              value: `\`${prefix}${command.usage}\``,
            });

          embed.setDescription(`${Discord.codeBlock(
            "diff",
            `- [] = optional argument
- <> = required argument
- Do NOT type these when using commands!`
          )}
    > ${command.description}`);
          return message
            .reply({
              embeds: [embed],
            })
            .then((msg) => {
              setTimeout(() => {
                msg.delete().catch((e) => {
                  console.log(String(e).grey);
                });
              }, settings.timeout.minplusargs);
            })
            .catch((e) => {
              console.log(String(e).grey);
            });
        }
        //if command has maximum args (splitted with "++"), and user enters too many, return error
        if (
          command.maxplusargs &&
          command.maxplusargs > 0 &&
          args.join(" ").split("++").filter(Boolean).length >
            command.maxplusargs
        ) {
          const embed = new Discord.EmbedBuilder()
            .setColor(client.embed.color)
            .setTitle(`Detailed Information about: \`${command.name}\``);

          if (command.aliases && command.aliases.length > 0)
            embed.addFields({
              name: "**Aliases**",
              value: command.aliases.map((alias) => `\`${alias}\``).join(", "),
            });

          embed.addFields({
            name: "**Cooldown**",
            value: command.cooldown
              ? `\`${command.cooldown} Seconds\``
              : `\`${settings.default_cooldown_in_sec} Second\``,
          });

          if (command.usage)
            embed.addFields({
              name: "**Usage**",
              value: `\`${prefix}${command.usage}\``,
            });

          embed.setDescription(`${Discord.codeBlock(
            "diff",
            `- [] = optional argument
- <> = required argument
- Do NOT type these when using commands!`
          )}
    > ${command.description}`);
          return message
            .reply({
              embeds: [embed],
            })
            .then((msg) => {
              setTimeout(() => {
                msg.delete().catch((e) => {
                  console.log(String(e).grey);
                });
              }, settings.timeout.maxplusargs);
            })
            .catch((e) => {
              console.log(String(e).grey);
            });
        }
        //run the command with the parameters:  client, message, args, Cmduser, text, prefix,
        command.messageRun(
          client,
          message,
          args,
          args.join(" ").split("++").filter(Boolean),
          message.member,
          args.join(" "),
          prefix
        );
      } catch (error) {
        if (settings.somethingwentwrong_cmd) {
          return message
            .reply({
              embeds: [
                new Discord.EmbedBuilder()
                  .setColor(client.embed.wrongcolor)
                  .setFooter({
                    text: client.embed.footertext,
                    iconURL: client.embed.footericon,
                  })
                  .setTitle(
                    replacemsg(settings.messages.somethingwentwrong_cmd.title, {
                      prefix: prefix,
                      command: command,
                      res: message,
                    })
                  )
                  .setDescription(
                    replacemsg(
                      settings.messages.somethingwentwrong_cmd.description,
                      {
                        error: error,
                        prefix: prefix,
                        command: command,
                        res: message,
                      }
                    )
                  ),
              ],
            })
            .then((msg) => {
              setTimeout(() => {
                msg.delete().catch((e) => {
                  console.log(String(e).grey);
                });
              }, 4000);
            })
            .catch((e) => {
              console.log(String(e).grey);
            });
        }
      }
    } //if the command is not found send an info msg
    else {
      if (
        client.commands.filter((cmdss) => cmdss.name.startsWith(cmd)).size > 1
      ) {
        const cmdList = client.commands
          .filter((cmdss) => cmdss.name.startsWith(cmd))
          .map((cmdss) => {
            return `\`${cmdss.name}\` \n ${cmdss.description}`;
          });
        await createPaginationEmbed(`\`${cmd}\``, cmdList, message);
        return;
      }
      return message
        .reply({
          embeds: [
            new Discord.EmbedBuilder()
              .setColor(client.embed.wrongcolor)
              .setFooter({
                text: client.embed.footertext,
                iconURL: client.embed.footericon,
              })
              .setTitle(
                replacemsg(settings.messages.unknown_cmd, {
                  prefix: prefix,
                })
              ),
          ],
        })
        .then((msg) => {
          setTimeout(() => {
            msg.delete().catch(() => {
            });
          }, 4000);
        })
        .catch(() => {
        });
    }
  } catch (e) {
    console.log(e);
  }
};

function escapeRegex(str) {
  try {
    return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
  } catch {
    return str;
  }
}

function formatRelativeTime(timestamp) {
  const currentTime = new Date().getTime();
  const timeDifference = currentTime - timestamp;

  // Convert time difference to seconds
  const seconds = Math.floor(timeDifference / 1000);

  if (seconds < 60) {
    return seconds + " seconds";
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return minutes + " minutes";
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return hours + " hours";
  } else {
    const days = Math.floor(seconds / 86400);
    return days + " days";
  }
}
