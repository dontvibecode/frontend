import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, SubmitRequest } from '@/types/api';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body: SubmitRequest = await request.json();
    
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' } as any,
        { status: 400 }
      );
    }

    // Mock response data following the template
    const mockResponse: ApiResponse = {
      breakdown: "Here's a comprehensive breakdown of your coding issue. The problem seems to stem from a fundamental misunderstanding of how asynchronous operations work in JavaScript. When you're dealing with promises and async/await, the execution flow is different from synchronous code.",
      explanation: "The issue you're experiencing is a common one in modern web development. Your code is trying to access data before it's been fetched from the API. This happens because JavaScript doesn't wait for asynchronous operations to complete unless explicitly told to do so using await or .then() methods.",
      recommendedReadings: [
        {
          title: "Understanding JavaScript Promises and Async/Await",
          Url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises",
          sourceDescription: "MDN Web Docs comprehensive guide on JavaScript promises",
          readingTime: 15
        },
        {
          title: "Async/Await Best Practices",
          Url: "https://javascript.info/async-await",
          sourceDescription: "JavaScript.info tutorial on modern async patterns",
          readingTime: 10
        },
        {
          title: "Error Handling in Async JavaScript",
          Url: "https://blog.logrocket.com/async-await-error-handling-node-js/",
          sourceDescription: "LogRocket article on proper error handling techniques",
          readingTime: 8
        }
      ],
      exercises: [
        {
          filename: "async-practice.js",
          text: "Practice implementing proper async/await patterns with error handling",
          code: `// Exercise: Fix the async function to properly handle promises
          async function fetchUserData(userId) {
            try {
              const response = await fetch(\`/api/users/\${userId}\`);
              if (!response.ok) {
                throw new Error('Failed to fetch user data');
              }
              const userData = await response.json();
              return userData;
            } catch (error) {
              console.error('Error fetching user data:', error);
              throw error;
            }
          }

          // Usage example
          async function displayUser(userId) {
            try {
              const user = await fetchUserData(userId);
              console.log('User:', user);
            } catch (error) {
              console.log('Failed to display user');
            }
          }`
        },
        {
          filename: "promise-chain.js",
          text: "Convert callback-based code to use promises and async/await",
          code: `// Exercise: Refactor this callback-based code to use async/await
          function processData(data, callback) {
            setTimeout(() => {
              const processed = data.map(item => item * 2);
              callback(null, processed);
            }, 1000);
          }

          // Convert to:
          async function processDataAsync(data) {
            return new Promise((resolve) => {
              setTimeout(() => {
                const processed = data.map(item => item * 2);
                resolve(processed);
              }, 1000);
            });
          }

          // Usage:
          async function main() {
            const data = [1, 2, 3, 4, 5];
            const result = await processDataAsync(data);
            console.log(result);
          }`
        }
      ]
    };

    // Artificial delay to simulate API response time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' } as any,
      { status: 500 }
    );
  }
}
