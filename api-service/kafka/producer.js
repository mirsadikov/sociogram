import { Kafka } from 'kafkajs';
import { KAFKA_HOST } from '../config/secrets.js';

const kafka = new Kafka({
  clientId: 'sociogram',
  brokers: [KAFKA_HOST],
});

const producer = kafka.producer();

export const stream = async (res) => {
  try {
    await producer.connect();
    await producer.send({
      topic: 'notification',
      messages: [{ value: JSON.stringify(res) }],
    });
  } catch (error) {
    console.error('Error sending message', error);
  }
};
