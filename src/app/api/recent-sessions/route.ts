import { NextResponse } from "next/server";
import { RecentSession } from "@/types/api";

export async function GET(): Promise<NextResponse<RecentSession[]>> {
  try {
    // Mock data for recent sessions
    const mockSessions: RecentSession[] = [
      {
        id: "1",
        title: "JavaScript Array Loop Issue",
        prompt:
          "I'm trying to loop through a list of numbers in JavaScript and remove all the even ones, but my code is skipping some of them. Why?",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        language: "javascript",
        status: "completed",
        json: {
          breakdown:
            "The issue you're experiencing is a classic JavaScript array mutation problem. When you remove elements from an array while iterating through it with a for loop, you're changing the array length and indices during iteration, which causes the loop to skip elements.",
          explanation:
            "This happens because when you remove an element at index i, all subsequent elements shift down by one position. However, your loop counter continues to increment, effectively skipping the element that moved into the position you just processed. This is why some even numbers remain in your array.",
          recommendedReadings: [
            {
              title: "JavaScript Array Methods: splice() vs filter()",
              Url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice",
              sourceDescription:
                "MDN documentation on array manipulation methods",
              readingTime: 8,
            },
            {
              title: "Iterating Arrays Safely in JavaScript",
              Url: "https://javascript.info/array-methods",
              sourceDescription:
                "Comprehensive guide on array iteration patterns",
              readingTime: 12,
            },
          ],
          exercises: [
            {
              filename: "array-filter-fix.js",
              text: "Fix the array filtering logic using proper methods",
              code: `// Problem: This code skips elements when removing
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Incorrect approach (modifies array during iteration)
for (let i = 0; i < numbers.length; i++) {
  if (numbers[i] % 2 === 0) {
    numbers.splice(i, 1);
  }
}

// Correct approaches:
// Method 1: Iterate backwards
const numbers1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
for (let i = numbers1.length - 1; i >= 0; i--) {
  if (numbers1[i] % 2 === 0) {
    numbers1.splice(i, 1);
  }
}

// Method 2: Use filter (recommended)
const numbers2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const oddNumbers = numbers2.filter(num => num % 2 !== 0);

console.log('Original approach result:', numbers);
console.log('Backwards iteration:', numbers1);
console.log('Filter method:', oddNumbers);`,
            },
          ],
        },
      },
      {
        id: "2",
        title: "React State Management Problem",
        prompt:
          "My React component state is not updating when I call setState. The component doesn't re-render even though I'm passing new data.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        language: "javascript",
        status: "completed",
        json: {
          breakdown:
            "The issue you're encountering is likely related to React's state update mechanism. React may not re-render if you're directly mutating the existing state object or if you're not properly updating the state in a way that React can detect changes.",
          explanation:
            "React uses Object.is() comparison to determine if state has changed. If you're modifying an object or array directly (mutation), React won't detect the change because the reference remains the same. You need to create a new object or array to trigger a re-render.",
          recommendedReadings: [
            {
              title: "React State Updates and Re-renders",
              Url: "https://react.dev/learn/state-as-a-snapshot",
              sourceDescription:
                "Official React documentation on state updates",
              readingTime: 10,
            },
            {
              title: "Avoiding Object Mutations in React",
              Url: "https://react.dev/learn/updating-objects-in-state",
              sourceDescription:
                "Guide on properly updating objects in React state",
              readingTime: 8,
            },
          ],
          exercises: [
            {
              filename: "state-update-fix.jsx",
              text: "Fix React state updates to trigger re-renders",
              code: `import React, { useState } from 'react';

function UserProfile() {
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    preferences: { theme: 'light', notifications: true }
  });

  // ❌ Wrong: Direct mutation won't trigger re-render
  const updateUserWrong = () => {
    user.name = 'Jane Doe';
    user.preferences.theme = 'dark';
    setUser(user); // Same reference, no re-render
  };

  // ✅ Correct: Create new objects
  const updateUserCorrect = () => {
    setUser(prevUser => ({
      ...prevUser,
      name: 'Jane Doe',
      preferences: {
        ...prevUser.preferences,
        theme: 'dark'
      }
    }));
  };

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Theme: {user.preferences.theme}</p>
      <button onClick={updateUserCorrect}>
        Update User
      </button>
    </div>
  );
}`,
            },
          ],
        },
      },
      {
        id: "3",
        title: "CSS Flexbox Layout Issue",
        prompt:
          "I can't get my flexbox layout to center properly. The items are not aligning as expected and there's weird spacing.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        language: "css",
        status: "completed",
        json: {
          breakdown:
            "Flexbox centering issues usually stem from not understanding the main axis vs cross axis, or missing key properties like justify-content and align-items.",
          explanation:
            "To center items in flexbox, you need to control both axes: justify-content for the main axis and align-items for the cross axis. The direction of these axes depends on your flex-direction property.",
          recommendedReadings: [
            {
              title: "CSS Flexbox Guide",
              Url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
              sourceDescription: "Complete guide to CSS Flexbox",
              readingTime: 15,
            },
          ],
          exercises: [
            {
              filename: "flexbox-centering.css",
              text: "Practice flexbox centering techniques",
              code: `.container {
  display: flex;
  justify-content: center; /* horizontal center */
  align-items: center; /* vertical center */
  height: 100vh;
}`,
            },
          ],
        },
      },
      {
        id: "4",
        title: "Async/Await Error Handling",
        prompt:
          "My async function is throwing unhandled promise rejections. How do I properly handle errors in async/await code?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        language: "javascript",
        status: "completed",
        json: {
          breakdown:
            "Unhandled promise rejections occur when async operations fail but aren't wrapped in try-catch blocks or don't have proper error handling.",
          explanation:
            "Every async operation should be wrapped in a try-catch block, and you should always handle both success and failure cases in your async functions.",
          recommendedReadings: [
            {
              title: "Async/Await Error Handling",
              Url: "https://javascript.info/async-await#error-handling",
              sourceDescription:
                "JavaScript.info guide on async error handling",
              readingTime: 10,
            },
          ],
          exercises: [
            {
              filename: "async-error-handling.js",
              text: "Practice proper async/await error handling",
              code: `async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}`,
            },
          ],
        },
      },
      {
        id: "5",
        title: "Python List Comprehension",
        prompt:
          "I'm trying to create a list comprehension in Python but getting syntax errors. Can you help me understand the correct syntax?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        language: "python",
        status: "completed",
        json: {
          breakdown:
            "List comprehension syntax follows the pattern: [expression for item in iterable if condition]. Common errors include incorrect ordering or missing components.",
          explanation:
            "List comprehensions provide a concise way to create lists. The syntax is [expression for item in iterable] with an optional if condition at the end.",
          recommendedReadings: [
            {
              title: "Python List Comprehensions",
              Url: "https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions",
              sourceDescription:
                "Official Python documentation on list comprehensions",
              readingTime: 8,
            },
          ],
          exercises: [
            {
              filename: "list-comprehension.py",
              text: "Practice Python list comprehension syntax",
              code: `# Basic list comprehension
squares = [x**2 for x in range(10)]

# With condition
even_squares = [x**2 for x in range(10) if x % 2 == 0]

# Nested comprehension
matrix = [[j for j in range(3)] for i in range(3)]`,
            },
          ],
        },
      },
      {
        id: "6",
        title: "Database Connection Timeout",
        prompt:
          "My Node.js application keeps timing out when connecting to the database. The connection works sometimes but fails randomly.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
        language: "javascript",
        status: "failed",
        json: {
          breakdown:
            "Database connection timeouts can be caused by network issues, connection pool exhaustion, or improper connection management.",
          explanation:
            "Random connection failures often indicate connection pool issues or network instability. You need to implement proper connection pooling and retry logic.",
          recommendedReadings: [
            {
              title: "Node.js Database Connection Pooling",
              Url: "https://node-postgres.com/features/pooling",
              sourceDescription:
                "Guide on database connection pooling in Node.js",
              readingTime: 12,
            },
          ],
          exercises: [
            {
              filename: "db-connection.js",
              text: "Implement proper database connection handling",
              code: `const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function queryDatabase(query, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}`,
            },
          ],
        },
      },
      {
        id: "7",
        title: "Git Merge Conflict Resolution",
        prompt:
          "I have a complex merge conflict in Git and I'm not sure how to resolve it properly without losing important changes.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
        language: "git",
        status: "completed",
        json: {
          breakdown:
            "Git merge conflicts occur when Git can't automatically merge changes from different branches. You need to manually resolve the conflicts by choosing which changes to keep.",
          explanation:
            "Merge conflicts show conflict markers (<<<<<<<, =======, >>>>>>>) that indicate the conflicting sections. You need to edit the file to keep the desired changes and remove the markers.",
          recommendedReadings: [
            {
              title: "Resolving Git Merge Conflicts",
              Url: "https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging#_basic_merge_conflicts",
              sourceDescription:
                "Official Git documentation on merge conflicts",
              readingTime: 10,
            },
          ],
          exercises: [
            {
              filename: "merge-conflict-example.txt",
              text: "Example of resolving a merge conflict",
              code: `# Before resolution:
function calculateTotal(products) {
  return products.reduce((total, product) => total + product.cost, 0);
}

# After resolution:
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}`,
            },
          ],
        },
      },
      {
        id: "8",
        title: "TypeScript Interface Extension",
        prompt:
          "How do I properly extend TypeScript interfaces? I'm getting type errors when trying to inherit from multiple interfaces.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
        language: "typescript",
        status: "completed",
        json: {
          breakdown:
            "TypeScript interfaces can be extended using the 'extends' keyword. When extending multiple interfaces, you need to ensure there are no conflicting property types.",
          explanation:
            "Interface extension allows you to create new interfaces based on existing ones. You can extend multiple interfaces, but conflicting properties must be resolved properly.",
          recommendedReadings: [
            {
              title: "TypeScript Interface Inheritance",
              Url: "https://www.typescriptlang.org/docs/handbook/interfaces.html#extending-interfaces",
              sourceDescription:
                "Official TypeScript documentation on interface extension",
              readingTime: 8,
            },
          ],
          exercises: [
            {
              filename: "interface-extension.ts",
              text: "Practice TypeScript interface extension",
              code: `interface Animal {
  name: string;
  age: number;
}

interface Flyable {
  fly(): void;
  altitude: number;
}

interface Swimmable {
  swim(): void;
  depth: number;
}

// Single inheritance
interface Dog extends Animal {
  breed: string;
  bark(): void;
}

// Multiple inheritance
interface Duck extends Animal, Flyable, Swimmable {
  quack(): void;
}`,
            },
          ],
        },
      },
    ];

    // Sort by timestamp (most recent first)
    const sortedSessions = mockSessions.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Artificial delay to simulate API response time
    await new Promise((resolve) => setTimeout(resolve, 700));

    return NextResponse.json(sortedSessions);
  } catch (error) {
    console.error("Error fetching recent sessions:", error);
    return NextResponse.json([] as RecentSession[], { status: 500 });
  }
}
