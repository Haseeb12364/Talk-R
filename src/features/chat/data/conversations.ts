import type { Conversation } from '../types';

export const conversations: Conversation[] = [
  { id: 'maya-chen', name: 'Maya Chen', initials: 'MC', color: '#F4B4A5', message: 'Sent you a little something ✨', time: 'Now', unread: 2, online: true },
  { id: 'jordan-lee', name: 'Jordan Lee', initials: 'JL', color: '#A9C7BB', message: 'Voice message · 0:18', time: '9:41', online: true },
  { id: 'sofia-ramirez', name: 'Sofia Ramirez', initials: 'SR', color: '#C6B5DC', message: 'That place looks perfect!', time: '9:18', unread: 1 },
  { id: 'sunday-club', name: 'The Sunday Club', initials: 'SC', color: '#E9C77D', message: 'Avery: brunch this weekend? 🥐', time: 'Yesterday', unread: 4, muted: true },
  { id: 'noah-williams', name: 'Noah Williams', initials: 'NW', color: '#9DB8D2', message: 'You: I’ll send it over tonight', time: 'Yesterday', delivered: true },
  { id: 'amara-okafor', name: 'Amara Okafor', initials: 'AO', color: '#DEA99A', message: 'Loved your photos from the trip', time: 'Tue', online: true },
  { id: 'ethan-park', name: 'Ethan Park', initials: 'EP', color: '#B9C69A', message: 'Haha, exactly what I was thinking', time: 'Mon', delivered: true },
];

export const onlineContacts = conversations.filter((conversation) => conversation.online);
export const storyContacts = [
  conversations[0],
  conversations[1],
  conversations[2],
  conversations[5],
  conversations[6],
].filter((conversation): conversation is Conversation => Boolean(conversation));

export const currentUser: Conversation = {
  id: 'current-user',
  name: 'Alex Rivera',
  initials: 'AR',
  color: '#DEA99A',
  message: '',
  time: '',
  online: true,
};
