import { Client, Intents, TextChannel } from 'discord.js';
const { token, channelId } = require('./config.json');
const { messages, prompts, reacts, cron } = require('./messages.json');

const client = new Client({ intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES ] });

client.once('ready', () => {
  const channel = client.channels.cache.get(channelId) as TextChannel;

  setInterval(() => {
    // Check for cron condition once a minute
    cron?.forEach((job : { condition : string, messages : Array<string> }) => {
      const [ minute, hour, day, month, weekDay ] = job.condition.split(' ');
      const date = new Date();

      if ((minute == '*' || minute == date.getMinutes().toString()) &&
        (hour == '*' || hour == date.getHours().toString()) &&
        (day == '*' || day == date.getDate().toString()) &&
        (month == '*' || month == date.getMonth().toString()) &&
        (weekDay == '*' || weekDay == date.getDay().toString())
      ) {
        const messageIndex = Math.floor(Math.random() * job.messages.length);

        channel.send(job.messages[messageIndex]);
      }
    });
  }, 60000);

  console.log("Ready...");
});

client.on('messageCreate', (message) => {
  if (message.author.bot) {
    return;
  }

  // messages to reply to
  if (prompts) {
      Object.keys(prompts).forEach((key) => {
      if (message.content.toLocaleLowerCase().includes(key)) {
        const messageIndex = Math.floor(Math.random() * prompts[key].length);

        message.channel.send(prompts[key][messageIndex]);
      }
    });
  }

  // messages to react to
  if (reacts) {
    Object.keys(reacts).forEach((key) => {
      if (message.content.toLocaleLowerCase().includes(key)) {
        const reactIndex = Math.floor(Math.random() * reacts[key].length);

        message.react(reacts[key][reactIndex]).catch(() => {});
      }
    });
  }
  
});

client.login(token);
