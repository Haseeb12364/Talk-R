import type { ChatMessage } from '../types';

export const messagesByConversation: Record<string, ChatMessage[]> = {
  'maya-chen': [
    { id: 'maya-1', sender: 'them', text: 'Hey! How did the little gallery opening go?', time: '10:18' },
    { id: 'maya-2', sender: 'me', text: 'It was lovely. Found the sweetest corner café after, too.', time: '10:20' },
    { id: 'maya-3', sender: 'them', text: 'I knew you’d find a good one ☕', time: '10:21' },
    { id: 'maya-4', sender: 'me', text: 'We should go together next time you’re free.', time: '10:23' },
    { id: 'maya-5', sender: 'them', text: 'Absolutely! I’m sending you the photos now ✨', time: '10:24' },
  ],
  'jordan-lee': [
    { id: 'jordan-1', sender: 'them', text: 'Did you get a chance to listen to the voice note?', time: '9:38' },
    { id: 'jordan-2', sender: 'me', text: 'Just listened — that sounds like a great plan.', time: '9:41' },
  ],
  'sofia-ramirez': [
    { id: 'sofia-1', sender: 'me', text: 'I found a little place by the water for Saturday.', time: '9:12' },
    { id: 'sofia-2', sender: 'them', text: 'That place looks perfect!', time: '9:18' },
  ],
};
