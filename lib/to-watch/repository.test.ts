import { DynamoDBDocumentClient, PutCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { addToWatchItem, listToWatchItems, removeToWatchItem } from './repository';

const sendMock = jest.fn();

jest.mock('@aws-sdk/lib-dynamodb', () => {
  const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: jest.fn().mockReturnValue({ send: sendMock }),
    },
    PutCommand: jest.fn().mockImplementation((input) => ({ input })),
    QueryCommand: jest.fn().mockImplementation((input) => ({ input })),
    DeleteCommand: jest.fn().mockImplementation((input) => ({ input })),
  };
});

jest.mock('@aws-sdk/client-dynamodb', () => {
  const actual = jest.requireActual('@aws-sdk/client-dynamodb');
  return {
    ...actual,
    DynamoDBClient: jest.fn().mockImplementation(() => ({})),
  };
});

describe('to-watch repository', () => {
  const env = process.env;

  beforeEach(() => {
    jest.resetModules();
    sendMock.mockReset();
    process.env = { ...env, DDB_TO_WATCH_TABLE: 'to-watch', AWS_REGION: 'us-east-1' };
  });

  afterAll(() => {
    process.env = env;
  });

  it('throws when table name is missing', async () => {
    process.env.DDB_TO_WATCH_TABLE = '';
    await expect(
      addToWatchItem({
        userId: 'user-1',
        itemId: 'movie:1',
        type: 'movie',
        title: 'Test',
        poster: '/poster',
        year: 2020,
        tmdbId: 1,
      })
    ).rejects.toThrow('DDB_TO_WATCH_TABLE');
  });

  it('adds an item with conditional put to prevent duplicates', async () => {
    await addToWatchItem({
      userId: 'user-1',
      itemId: 'movie:1',
      type: 'movie',
      title: 'Test Movie',
      poster: '/poster',
      year: 2020,
      tmdbId: 1,
    });

    expect(PutCommand).toHaveBeenCalledTimes(1);
    const call = (PutCommand as jest.Mock).mock.calls[0][0];
    expect(call.TableName).toBe('to-watch');
    expect(call.ConditionExpression).toContain('attribute_not_exists');
    expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({ input: call }));
  });

  it('queries items by userId', async () => {
    sendMock.mockResolvedValueOnce({
      Items: [
        {
          userId: 'user-1',
          itemId: 'movie:1',
          type: 'movie',
          title: 'Test Movie',
          poster: '/poster',
          year: 2020,
          tmdbId: 1,
          createdAt: 'now',
        },
      ],
    });

    const results = await listToWatchItems('user-1');

    expect(QueryCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: 'to-watch',
        KeyConditionExpression: '#userId = :userId',
      })
    );
    expect(results).toHaveLength(1);
    expect(results[0].itemId).toBe('movie:1');
  });

  it('deletes an item by key', async () => {
    await removeToWatchItem('user-1', 'movie:1');

    expect(DeleteCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: 'to-watch',
        Key: { userId: 'user-1', itemId: 'movie:1' },
      })
    );
    expect(sendMock).toHaveBeenCalled();
  });
});

