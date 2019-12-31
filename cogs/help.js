module.exports = {
    name: 'help',
    description: 'Helps user understand how to use the bot',
    execute(message, args, bot) {
        if (message.author.id == 221285118608801802) {
            var userColorPreference = 0xf2a93b;
        } else {
            var userColorPreference = 0x086587;
        }
        message.channel.send({
            embed: {
                color: userColorPreference,
                title: "LDS-Bot by anclint#9255",
                fields: [{
                        name: "Commands",
                        value: "``lds invite`` - provides the invite link for LDS-Bot \n ``lds github`` - provides the link for LDS-Bot GitHub repository \n ``lds randomverse`` - provides a random verse \n ``lds booknames`` - provides list of book names \n ``lds bookinfo <bookname>`` - provides info on the book inputted \n ``lds chapters <bookname>`` - provides list of all chapters and number of verses per chapter for book inputted \n ``lds servers`` - shows number of servers LDS-Bot is in \n ``lds users`` - shows number of users across all servers LDS-Bot is on",
                        inline: false
                    },
                    {
                        name: "Links",
                        value: "Support Server: https://discord.gg/G6P6Pq8 \n Github: https://github.com/anclint01/LDS-Bot \n Invite: https://bit.ly/2KoBoPr",
                        inline: false
                    }
                ],
                footer: {
                    text: "LDS-Bot",
                    icon_url: bot.user.avatarURL
                }
            }
        });
    },
};