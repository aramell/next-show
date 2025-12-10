import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

export type ToWatchType = 'movie' | 'tv';

export interface ToWatchItem {
  userId: string;
  mediaId: string;
  type: ToWatchType;
  title: string;
  poster: string | null;
  year: number;
  tmdbId: number;
  createdAt: string;
}

type AddToWatchInput = Omit<ToWatchItem, 'createdAt'> & { createdAt?: string };

const docClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
  })
);

function getTableName(): string {
  const tableName = process.env.DDB_TO_WATCH_TABLE || 'user-media';
  if (!tableName) {
    throw new Error('DDB_TO_WATCH_TABLE environment variable is required');
  }
  return tableName;
}

export async function addToWatchItem(input: AddToWatchInput): Promise<void> {
  const tableName = getTableName();
  console.log(tableName)
  const item: ToWatchItem = {
    ...input,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };

  const command = new PutCommand({
    TableName: tableName,
    Item: item,
    ConditionExpression: 'attribute_not_exists(#userId) AND attribute_not_exists(#mediaId)',
    ExpressionAttributeNames: {
      '#userId': 'userId',
      '#mediaId': 'mediaId',
    },
  });

  await docClient.send(command);
}

export async function listToWatchItems(userId: string): Promise<ToWatchItem[]> {
  const tableName = getTableName();

  const command = new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: '#userId = :userId',
    ExpressionAttributeNames: {
      '#userId': 'userId',
    },
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  });

  const response = await docClient.send(command);
  return (response.Items as ToWatchItem[]) ?? [];
}

export async function removeToWatchItem(userId: string, mediaId: string): Promise<void> {
  const tableName = getTableName();

  const command = new DeleteCommand({
    TableName: tableName,
    Key: { userId, mediaId },
  });

  await docClient.send(command);
}

