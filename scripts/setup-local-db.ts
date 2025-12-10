import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { CreateTableCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
  region: 'us-east-1',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'local',
    secretAccessKey: 'local',
  },
});

async function createTable() {
  try {
    await client.send(
      new CreateTableCommand({
        TableName: 'towatch-table',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'itemId', KeyType: 'RANGE' },
        ],
        AttributeDefinitions: [
          { AttributeName: 'userId', AttributeType: 'S' },
          { AttributeName: 'itemId', AttributeType: 'S' },
        ],
        BillingMode: 'PAY_PER_REQUEST',
      })
    );
    console.log('Table created successfully');
  } catch (error: any) {
    if (error.name === 'ResourceInUseException') {
      console.log('Table already exists');
    } else {
      console.error('Error creating table:', error);
    }
  }
}

createTable();