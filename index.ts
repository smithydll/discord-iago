import { Client, Intents, TextChannel } from 'discord.js';
const { token, channelId } = require('./config.json');
const { messages, prompts, reacts, cron } = require('./messages.json');

const client = new Client({ intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES ] });

type cronType = 'minute' | 'hour' | 'day' | 'month' | 'weekday';

var randomTime : { [key : string] : number } = {};

const calculateRandomTime = (type? : cronType) => {
  const date = new Date();
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  var newRandomTime = {
    minute: Math.floor(Math.random() * 60),
    hour: Math.floor(Math.random() * 24),
    day: Math.floor(Math.random() * lastDayOfMonth),
    month: Math.floor(Math.random() * 12),
    weekday: Math.floor(Math.random() * 7)
  };

  switch (type) {
    case 'minute':
      randomTime = { ...randomTime, minute: newRandomTime.minute };
      break;
    case 'hour':
      randomTime = { ...randomTime, hour: newRandomTime.hour };
      break;
    case 'day':
      randomTime = { ...randomTime, day: newRandomTime.day };
      break;
    case 'month':
      randomTime = { ...randomTime, month: newRandomTime.month };
      break;
    case 'weekday':
      randomTime = { ...randomTime, weekday: newRandomTime.weekday };
      break;
    default:
      randomTime = newRandomTime;
      break;
  }
}

const getCurrent = (date : Date, type : cronType) : number => {
  switch (type) {
    case 'minute':
      return date.getMinutes();
    case 'hour':
      return date.getHours();
    case 'day':
      return date.getDate();
    case 'month':
      return date.getMonth();
    case "weekday":
      return date.getDay();
  }

  return -1;
}

const getEndsIn = (current : number, type : cronType) : number => {
  const now = new Date();
  switch (type) {
    case 'minute':
      return (new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0)).getTime() - now.getTime();
    case 'hour':
      return (new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0)).getTime() - now.getTime();
    case 'day':
      return (new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0)).getTime() - now.getTime();
    case 'month':
      return (new Date(now.getFullYear() + 1, 0, 0, 0, 0, 0)).getTime() - now.getTime();
    case "weekday":
      return (new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 0, 0, 0)).getTime() - now.getTime();
  }

  return 0;
}

const matchCron = (date : Date, cron : string, type : cronType) => {
  const current = getCurrent(date, type);

  if (cron == '*') {
    return true;
  } else if (cron == current.toString()) {
    return true;
  } else if (cron.indexOf(',') >= 0) {
    const parts = cron.split(',');

    if (parts.indexOf(current.toString()) >= 0) {
      return true;
    }
  } else if (cron.indexOf('-') >= 0) {
    const parts = cron.split('-');

    if (parts.length == 2) {
      const start = parseInt(parts[0]);
      const end = parseInt(parts[1]);

      if (start <= current && current <= end) {
        return true;
      }
    }
  } else if (type == 'day' && cron == 'L') {
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    if (lastDayOfMonth == current) {
      return true;
    }
  } else if (type == 'weekday' && cron.endsWith('L')) {
    const weekDay = parseInt(cron.substring(0, cron.length - 1));
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    if (weekDay == current) {
      if (date.getDate() > lastDayOfMonth - 7) {
        return true;
      }
    }
  } else if (type == 'weekday' && cron.indexOf('#') >= 0) {
    const parts = cron.split('#');

    if (parts.length == 2) {
      const weekDay = parseInt(parts[0]);
      const nth = parseInt(parts[1]);
      const week = Math.ceil(date.getDate() / 7);

      if (weekDay == current && week == nth) {
        return true;
      }
    }
  } else if (cron == 'R') {
    if (randomTime[type] == current) {
      const endsIn = getEndsIn(current, type);

      // wait until the end of the `type` to re-roll
      setTimeout(() => {
        calculateRandomTime(type);
      }, endsIn);

      return true;
    }
  }

  return false;
}

client.once('ready', () => {
  const channel = client.channels.cache.get(channelId) as TextChannel;

  calculateRandomTime();

  setInterval(() => {
    // Check for cron condition once a minute
    cron?.forEach((job : { condition : string, messages : Array<string> }) => {
      const [ minute, hour, day, month, weekDay ] = job.condition.split(' ');
      const date = new Date();

      if (matchCron(date, minute, 'minute') &&
        matchCron(date, hour, 'hour') &&
        matchCron(date, day, 'day') &&
        matchCron(date, month, 'month') &&
        matchCron(date, weekDay, 'weekday')
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
