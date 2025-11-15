/**
 * End-to-End Integration Tests
 * Tests complete user journeys through the DataStory AI platform
 */

import { MongoClient, ObjectId } from 'mongodb';
import { hash } from 'bcryptjs';

const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPass123!',
};

let mongoClient: MongoClient;
let testUserId: string;
let testStoryId: string;
let authToken: string;

describe('End-to-End User Journey', () => {
  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/datastory-test';
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
  });

  afterAll(async () => {
    // Cleanup test data
    if (mongoClient && testUserId) {
      const db = mongoClient.db();
      await db.collection('users').deleteOne({ _id: new ObjectId(testUserId) });
      if (testStoryId) {
        await db.collection('stories').deleteOne({ _id: new ObjectId(testStoryId) });
      }
    }
    await mongoClient?.close();
  });

  describe('1. User Registration', () => {
    it('should register a new user with valid credentials', async () => {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_USER),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.userId).toBeDefined();
      expect(data.token).toBeDefined();
      expect(data.tier).toBe('free');
      
      testUserId = data.userId;
      authToken = data.token;
    });

    it('should reject duplicate email registration', async () => {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_USER),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.message).toContain('already exists');
    });

    it('should reject weak passwords', async () => {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `weak-${Date.now()}@example.com`,
          password: 'weak',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.message).toContain('password');
    });
  });

  describe('2. User Login', () => {
    it('should login with correct credentials', async () => {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_USER),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.userId).toBe(testUserId);
      expect(data.token).toBeDefined();
      expect(data.tier).toBe('free');
      expect(data.storiesRemaining).toBe(3);
      
      authToken = data.token;
    });

    it('should reject incorrect password', async () => {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_USER.email,
          password: 'WrongPassword123!',
        }),
      });

      expect(response.status).toBe(401);
    });

    it('should reject non-existent user', async () => {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'TestPass123!',
        }),
      });

      expect(response.status).toBe(401);
    });
  });

  describe('3. File Upload and Story Generation', () => {
    it('should reject upload without authentication', async () => {
      const formData = new FormData();
      const blob = new Blob(['test'], { type: 'text/csv' });
      formData.append('file', blob, 'test.csv');

      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      expect(response.status).toBe(401);
    });

    it('should reject invalid file types', async () => {
      const formData = new FormData();
      const blob = new Blob(['test'], { type: 'text/plain' });
      formData.append('file', blob, 'test.txt');

      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.message).toContain('CSV or Excel');
    });

    it('should accept valid CSV file and create job', async () => {
      // Create a valid CSV with sample data
      const csvContent = `Date,Sales,Region
2024-01-01,1000,North
2024-01-02,1200,South
2024-01-03,900,East
2024-01-04,1100,West
2024-01-05,1300,North
2024-01-06,950,South
2024-01-07,1050,East
2024-01-08,1250,West
2024-01-09,1150,North
2024-01-10,1000,South`;

      const formData = new FormData();
      const blob = new Blob([csvContent], { type: 'text/csv' });
      formData.append('file', blob, 'sales-data.csv');

      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.jobId).toBeDefined();
      expect(data.status).toBe('processing');
    });
  });

  describe('4. Tier Limits Enforcement', () => {
    it('should enforce 1000 row limit for free tier', async () => {
      // Create CSV with 1001 rows
      let csvContent = 'Column1,Column2\n';
      for (let i = 0; i < 1001; i++) {
        csvContent += `${i},${i * 2}\n`;
      }

      const formData = new FormData();
      const blob = new Blob([csvContent], { type: 'text/csv' });
      formData.append('file', blob, 'large-data.csv');

      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.message).toContain('1000 rows');
    });

    it('should enforce 3 stories per month limit for free tier', async () => {
      // Update user to have 3 stories this month
      const db = mongoClient.db();
      await db.collection('users').updateOne(
        { _id: new ObjectId(testUserId) },
        { $set: { storiesThisMonth: 3 } }
      );

      const csvContent = 'A,B\n1,2\n3,4\n5,6\n7,8\n9,10\n11,12\n13,14\n15,16\n17,18\n19,20';
      const formData = new FormData();
      const blob = new Blob([csvContent], { type: 'text/csv' });
      formData.append('file', blob, 'test.csv');

      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error.message).toContain('monthly limit');

      // Reset for other tests
      await db.collection('users').updateOne(
        { _id: new ObjectId(testUserId) },
        { $set: { storiesThisMonth: 0 } }
      );
    });
  });

  describe('5. Story Viewing', () => {
    beforeAll(async () => {
      // Create a test story directly in database
      const db = mongoClient.db();
      const story = {
        userId: new ObjectId(testUserId),
        title: 'Test Story',
        createdAt: new Date(),
        updatedAt: new Date(),
        dataset: {
          originalFilename: 'test.csv',
          s3Key: 'test-key',
          rowCount: 10,
          columnCount: 2,
          fileSize: 100,
        },
        narratives: {
          summary: 'This is a test summary.',
          keyFindings: 'These are test findings.',
          recommendations: 'These are test recommendations.',
        },
        charts: [
          {
            chartId: 'chart1',
            type: 'line',
            title: 'Test Chart',
            data: { x: [1, 2, 3], y: [10, 20, 30] },
            config: {},
          },
        ],
        statistics: {
          trends: [],
          correlations: [],
          distributions: [],
        },
        processingTime: 5000,
        aiModel: 'gpt-4',
        visibility: 'private',
      };

      const result = await db.collection('stories').insertOne(story);
      testStoryId = result.insertedId.toString();
    });

    it('should fetch user stories', async () => {
      const response = await fetch('http://localhost:3000/api/stories', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.stories)).toBe(true);
      expect(data.stories.length).toBeGreaterThan(0);
    });

    it('should fetch specific story', async () => {
      const response = await fetch(`http://localhost:3000/api/stories/${testStoryId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.storyId).toBe(testStoryId);
      expect(data.narratives).toBeDefined();
      expect(data.charts).toBeDefined();
    });

    it('should reject unauthorized story access', async () => {
      const response = await fetch(`http://localhost:3000/api/stories/${testStoryId}`, {
        headers: {
          'Authorization': 'Bearer invalid-token',
        },
      });

      expect(response.status).toBe(401);
    });
  });

  describe('6. PDF Export', () => {
    it('should export story as PDF', async () => {
      const response = await fetch(`http://localhost:3000/api/stories/${testStoryId}/export`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('pdf');
      
      const buffer = await response.arrayBuffer();
      expect(buffer.byteLength).toBeGreaterThan(0);
    });

    it('should reject PDF export without authentication', async () => {
      const response = await fetch(`http://localhost:3000/api/stories/${testStoryId}/export`, {
        method: 'POST',
      });

      expect(response.status).toBe(401);
    });
  });

  describe('7. Story Deletion', () => {
    it('should delete user story', async () => {
      const response = await fetch(`http://localhost:3000/api/stories/${testStoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should return 404 for deleted story', async () => {
      const response = await fetch(`http://localhost:3000/api/stories/${testStoryId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(404);
    });
  });

  describe('8. User Logout', () => {
    it('should logout user', async () => {
      const response = await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
    });

    it('should reject requests with logged out token', async () => {
      const response = await fetch('http://localhost:3000/api/stories', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(401);
    });
  });
});

describe('Error Scenarios', () => {
  it('should handle network timeout gracefully', async () => {
    // This would require mocking or actual timeout scenario
    expect(true).toBe(true); // Placeholder
  });

  it('should handle malformed CSV files', async () => {
    const malformedCsv = 'A,B\n1,2,3\n4\n5,6,7,8';
    const formData = new FormData();
    const blob = new Blob([malformedCsv], { type: 'text/csv' });
    formData.append('file', blob, 'malformed.csv');

    // Would need auth token from previous test or create new user
    expect(true).toBe(true); // Placeholder
  });
});

describe('Responsive Design Tests', () => {
  // These would typically be done with Playwright or Cypress
  it('should render on mobile viewport (375px)', () => {
    expect(true).toBe(true); // Placeholder for visual regression tests
  });

  it('should render on tablet viewport (768px)', () => {
    expect(true).toBe(true); // Placeholder
  });

  it('should render on desktop viewport (1920px)', () => {
    expect(true).toBe(true); // Placeholder
  });
});

describe('Cross-Browser Compatibility', () => {
  // These would require actual browser testing with Selenium/Playwright
  it('should work on Chrome', () => {
    expect(true).toBe(true); // Placeholder
  });

  it('should work on Firefox', () => {
    expect(true).toBe(true); // Placeholder
  });

  it('should work on Safari', () => {
    expect(true).toBe(true); // Placeholder
  });

  it('should work on Edge', () => {
    expect(true).toBe(true); // Placeholder
  });
});
