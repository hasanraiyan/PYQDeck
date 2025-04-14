// src/data/beuData.js

// ========================================================================
// == CRITICAL: REPLACE THE CONTENT OF THIS beuData OBJECT WITH YOUR FULL DATASET ==
// == Make sure 'icon', 'chapter', and 'year' fields are present and accurate. ==
// ========================================================================
const beuData = {
    branches: [
      {
        id: 'it',
        name: 'Information Technology',
        icon: { set: 'Ionicons', name: 'laptop-outline' },
        semesters: [
          {
            id: 'it_sem3',
            number: 3,
            subjects: [
              {
                id: 'it301',
                name: 'Object-Oriented Programming Using C++',
                code: 'IT301',
                questions: [
                  {
                    questionId: 'it301_2019_1a',
                    year: 2019,
                    qNumber: 'Q1a',
                    chapter: 'Module 3: Classes and Data Abstraction',
                    text: 'Which feature allows open recursion among the following?\n\n*   (i) Use of `this` pointer\n*   (ii) Use of pointers\n*   (iii) Use of pass by value\n*   (iv) Use of parameterized constructor',
                    type: 'MCQ',
                    marks: 2,
                  },
                  {
                    questionId: 'it301_2019_1b',
                    year: 2019,
                    qNumber: 'Q1b',
                    chapter: 'Module 4: Overloading, Templates and Inheritance',
                    text: 'If same message is passed to objects of several different classes and all of those can respond in a different way, what is this feature called?\n\n*   (i) Inheritance\n*   (ii) Overloading\n*   (iii) Polymorphism\n*   (iv) Overriding',
                    type: 'MCQ',
                    marks: 2,
                  },
                  {
                    questionId: 'it301_2021_3a',
                    year: 2021,
                    qNumber: 'Q3a',
                    chapter: 'Module 1: Introduction to C++ and OOP',
                    text: 'Explain the difference between procedural programming and object-oriented programming.',
                    type: 'Explanation',
                    marks: 7,
                  },
                  {
                      questionId: 'it301_2021_misc',
                      year: 2021,
                      qNumber: 'Misc1',
                      chapter: null, // Example of uncategorized
                      text: 'What is the purpose of the `main` function in C++?',
                      type: 'Explanation',
                      marks: 5,
                  },
                  {
                    questionId: 'it301_2019_2a',
                    year: 2019,
                    qNumber: 'Q2a',
                    chapter: 'Module 1: Introduction to C++ and OOP',
                    text: 'What is Object-oriented Programming (OOP)? Write the basic concepts of OOP (e.g., Encapsulation, Abstraction, Inheritance, Polymorphism).',
                    type: 'Explanation',
                    marks: 7,
                  },
                  {
                    questionId: 'it301_2019_2b',
                    year: 2019,
                    qNumber: 'Q2b',
                    chapter: 'Module 3: Classes and Data Abstraction',
                    text: 'What do you mean by class and object? Give a simple example.',
                    type: 'Explanation with Example',
                    marks: 7,
                  },
                   {
                    questionId: 'it301_2019_9a',
                    year: 2019,
                    qNumber: 'Q9a',
                    chapter: 'Module 4: Overloading, Templates and Inheritance',
                    text: 'With the help of an example program, differentiate between Function Overloading and Function Overriding.',
                    type: 'Differentiate with Example',
                    marks: 7,
                  },
                ],
              },
              {
                id: 'it302',
                name: 'Data Structures & Algorithms',
                code: 'IT302',
                questions: [
                   {
                    questionId: 'it302_2021_1a',
                    year: 2021,
                    qNumber: 'Q1a',
                    chapter: 'Module 1: Analysis of Algorithms',
                    text: 'What is the time complexity (Big-O notation) of Linear Search in the worst case?\n\n* (i) O(1)\n* (ii) O(log n)\n* (iii) O(n)\n* (iv) O(n^2)',
                    type: 'MCQ',
                    marks: 2,
                  },
                  {
                    questionId: 'it302_2022_6a',
                    year: 2022,
                    qNumber: 'Q6a',
                    chapter: 'Module 4: Trees',
                    text: 'Define a Binary Search Tree (BST). Construct a BST for the following sequence of numbers: `50, 30, 70, 20, 40, 60, 80`.',
                    type: 'Definition & Problem',
                    marks: 7,
                  },
                   {
                    questionId: 'it302_2022_7a',
                    year: 2022,
                    qNumber: 'Q7a',
                    chapter: 'Module 5: Graphs',
                    text: 'Explain Depth First Search (DFS) algorithm with an example.',
                    type: 'Explanation with Example',
                    marks: 7,
                  },
                ],
              },
            ],
          },
          {
            id: 'it_sem4',
            number: 4,
            subjects: [
              {
                id: 'it401',
                name: 'Web Technologies',
                code: 'IT401',
                questions: [], // Example: Subject with no questions yet
              },
               {
                id: 'it402',
                name: 'Database Management Systems',
                code: 'IT402',
                questions: [
                  {
                      questionId: 'it402_2023_1a',
                      year: 2023,
                      qNumber: 'Q1a',
                      chapter: 'Module 1: Introduction',
                      text: 'What is a DBMS?',
                      type: 'Definition',
                      marks: 2,
                  }
                ],
              },
            ],
          },
        ],
      },
      // Add other branches here following the same structure...
      {
        id: 'cse',
        name: 'Computer Science Engineering',
        icon: { set: 'MaterialCommunityIcons', name: 'desktop-classic' },
        semesters: [
           // Add CSE semesters/subjects/questions here...
        ],
      },
    ],
  };
  
  export default beuData;