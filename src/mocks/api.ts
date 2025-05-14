import { Channel, PublishParams, PublishResult, TelegramUser } from "../types";

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function mockLogin(): Promise<TelegramUser> {
  await delay(800);
  return { telegramId: '123456789', username: 'ivan_test' };
}

export async function fetchChannels(): Promise<Channel[]> {
  await delay(600);
  return [
    { id: '1', username: '@testchannel', title: 'Test Channel' },
    { id: '2', username: '@newsfeed', title: 'Daily News' },
    { id: '3', username: '@techblog', title: 'Tech Updates' },
  ];
}

export async function addChannel(data: { username: string, botToken?: string }): Promise<Channel> {
  await delay(700);
  // Simulate creating a new channel with a random ID
  const title = data.username.replace('@', '') + ' Channel';
  return {
    id: Math.floor(Math.random() * 1000).toString(),
    username: data.username,
    title,
    botToken: data.botToken
  };
}

export async function generateText(prompt: string): Promise<string> {
  await delay(1200);
  return `Сгенерированный текст для «${prompt}»:\n\nЭто пример автоматически созданного контента на основе вашего запроса. В реальном приложении здесь будет находиться действительно сгенерированный текст от API искусственного интеллекта, который будет более содержательным и релевантным вашему запросу.`;
}

export async function generateImage(prompt: string): Promise<string> {
  await delay(1500);
  console.log('generateImage', prompt);
  // TODO: add real image generation
  return `https://picsum.photos/id/237/200/300`;
}

export async function generateTags(text: string): Promise<string[]> {
  await delay(900);
  // Generate some random tags based on the input text
  const words = text.split(' ').filter(word => word.length > 3);
  const tags = words.length > 0 
    ? words.slice(0, Math.min(5, words.length)).map(word => `#${word.toLowerCase().replace(/[^a-zA-Zа-яА-Я0-9]/g, '')}`)
    : ['#tag1', '#tag2', '#tag3', '#content', '#telegram'];
  return tags;
}

export async function publish(params: PublishParams): Promise<PublishResult> {
  await delay(1000);
  // 10% chance of simulated failure
  const success = Math.random() > 0.1;
  return {
    success,
    message: success 
      ? `Успешно опубликовано в канале ${params.channelId}`
      : 'Ошибка публикации. Пожалуйста, попробуйте снова.'
  };
}
