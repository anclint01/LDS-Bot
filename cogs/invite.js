module.exports = {
    name: 'invite',
    description: 'Link to invite LDS-Bot',
    execute(message, args) {
		message.channel.send("https://discordapp.com/oauth2/authorize?permissions=93184&scope=bot&client_id=639271772818112564");
    },
};