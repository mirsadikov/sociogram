import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ChatService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getUserChats(id: string): Promise<any[]> {
    const query = `
SELECT uc.chat_id as id, uc.created_at, json_build_object('id', u.id, 'name', u.name, 'email', u.email) as "receiver",
json_build_object('content', m.content, 'created_at', m.created_at) as "last_message"
FROM "UserChat" uc
JOIN "User" u ON u.id = uc.receiver_id
JOIN "Message" m ON m.id = (
  SELECT m2.id
  FROM "Message" m2
  WHERE m2.chat_id = uc.chat_id
  ORDER BY m2.created_at DESC
  LIMIT 1
)
WHERE user_id = $1
ORDER BY m.created_at DESC`;
    return await this.databaseService.query(query, [id]);
  }

  async createChat(chatData: any, senderId: string): Promise<any> {
    // check if chat already exists
    let query =
      'SELECT * FROM "UserChat" WHERE (user_id = $1 AND receiver_id = $2) OR (user_id = $2 AND receiver_id = $1)';
    const userChats = await this.databaseService.query(query, [
      senderId,
      chatData.receiver_id,
    ]);

    // insert into chat
    let newChat;
    if (userChats.length === 0) {
      query = 'INSERT INTO "Chat" default values RETURNING *';
      const res = await this.databaseService.query(query, []);
      newChat = res[0];
    }

    // insert into userchat
    query =
      'INSERT INTO "UserChat" (user_id, receiver_id, chat_id) VALUES ($1, $2, $3), ($2, $1, $3) on conflict do nothing';
    await this.databaseService.query(query, [
      senderId,
      chatData.receiver_id,
      newChat.id,
    ]);

    // insert into message
    query =
      'INSERT INTO "Message" (content, chat_id, author_id) VALUES ($1, $2, $3) RETURNING *';
    const newMessage = await this.databaseService.query(query, [
      chatData.message,
      newChat.id,
      senderId,
    ]);

    // get receiver info
    query = 'SELECT id, name, email FROM "User" WHERE id = $1';
    const receiver = await this.databaseService.query(query, [
      chatData.receiver_id,
    ]);

    // get sender info
    const sender = await this.databaseService.query(query, [senderId]);

    return {
      chat: newChat,
      messages: newMessage,
      last_message: newMessage[0],
      receiver: receiver[0],
      sender: sender[0],
    };
  }

  async getMessagesByChatId(
    userId: string,
    receiverId: string,
  ): Promise<any[]> {
    const query = `
SELECT m.*
FROM "UserChat" uc 
JOIN "Message" m ON m.chat_id = uc.chat_id
WHERE uc.user_id = $1 AND uc.receiver_id = $2
ORDER BY m.created_at ASC`;
    return await this.databaseService.query(query, [userId, receiverId]);
  }

  async sendMessage(
    userId: string,
    receiverId: string,
    message: string,
  ): Promise<any> {
    const query = `
INSERT INTO "Message" (content, chat_id, author_id)
SELECT $1, uc.chat_id, $2
FROM "UserChat" uc
WHERE uc.user_id = $2 AND uc.receiver_id = $3
RETURNING *`;

    const newMessage = (
      await this.databaseService.query(query, [message, userId, receiverId])
    )[0];

    const sender = (
      await this.databaseService.query(
        'SELECT id, name, email FROM "User" WHERE id = $1',
        [userId],
      )
    )[0];

    return {
      message: newMessage,
      sender,
    };
  }
}
