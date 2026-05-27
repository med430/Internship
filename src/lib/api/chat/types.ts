export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  readBy: string[];
  createdAt: string;
  updatedAt: string;
}
