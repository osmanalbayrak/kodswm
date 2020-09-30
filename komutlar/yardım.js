const Discord = require('discord.js');

exports.run = async (client, message, args) => {
	//kendi URL'lerini eklersn :D
  var embed = new Discord.RichEmbed()
  .setColor('RANDOM')
  .setAuthor("CodePack", client.user.avatarURL)
  .addField("Sistemin amacı nedir? Sistem ne işe yaramaktadır?", "Gerekli bilgiyi [buraya tıklayarak](https://https://code-pack-kod-paylasim.glitch.me/hakkimizda) görebilirsiniz.")
	.addField("Kod nasıl ekleyeceğim?", "[Buraya tıklayarak](https://https://code-pack-kod-paylasim.glitch.me/kodekle) kod ekleyebileceğiniz yere ışınlanabilirsiniz.")
  .addField("Sistemdeki tüm kodları nereden görebilirim?", "[Buraya tıklayarak](https://https://code-pack-kod-paylasim.glitch.me/kodlar) görebilirsiniz.")

  message.channel.send({embed: embed})
  
};

exports.conf = {
	enabled: true,
	guildOnly: true,
	aliases: ['y', 'help', 'h', 'bilgi', 'info'],
	permLevel: 0,
	kategori: 'genel'
}

exports.help = {
	name: 'yardım',
	description: 'Sistem hakkında bilgi gösterir.',
	usage: 'yardım'
}