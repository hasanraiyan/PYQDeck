import { Ionicons, MaterialCommunityIcons, FontAwesome, MaterialIcons } from '@expo/vector-icons'; // Example import

const beuData = {
  branches: [
    {
      id: 'it', // Code 106
      name: 'INFORMATION TECHNOLOGY',
      icon: { set: 'Ionicons', name: 'laptop-outline' }, // Valid icon
      semesters: [
        // Semester 1 (Placeholder Subjects)
        {
          id: 'it_sem1',
          number: 1,
          subjects: [
            {
              id: 'it101', name: 'Mathematics I', code: 'BS101', modules: [], questions: []
            },
            {
              id: 'it102', name: 'Physics I', code: 'BS102', modules: [], questions: []
            },
            {
              id: 'it103', name: 'Chemistry', code: 'BS103', modules: [], questions: []
            },
            {
              id: 'it104', name: 'Basic Electrical Engineering', code: 'ES101', modules: [], questions: []
            },
            {
              id: 'it105', name: 'Engineering Workshop', code: 'ES102', modules: [], questions: []
            },
            {
              id: 'it106', name: 'Communicative English', code: 'HS101', modules: [], questions: []
            },
          ]
        },
        // Semester 2 (Placeholder Subjects)
        {
          id: 'it_sem2',
          number: 2,
          subjects: [
            {
              id: 'it201', name: 'Mathematics II', code: 'BS201', modules: [], questions: []
            },
            {
              id: 'it202', name: 'Physics II (Waves & Optics)', code: 'BS202', modules: [], questions: []
            },
            {
              id: 'it203', name: 'Programming for Problem Solving (C)', code: 'ES201', modules: [], questions: []
            },
            {
              id: 'it204', name: 'Basic Electronics Engineering', code: 'ES202', modules: [], questions: []
            },
            {
              id: 'it205', name: 'Engineering Graphics & Design', code: 'ES203', modules: [], questions: []
            },
            {
              id: 'it206', name: 'Environmental Science', code: 'MC201', modules: [], questions: []
            },
          ]
        },
        // Semester 3 (Original Data)
        {
          id: 'it_sem3',
          number: 3,
          subjects: [
            {
              id: 'it301',
              name: 'Object-Oriented Programming Using C++',
              code: 'IT301',
              modules: [
                { id: 'm1', name: 'Module 1: Introduction to C++ and OOP' },
                { id: 'm2', name: 'Module 2: Control Structures, Functions, and Pointers' },
                { id: 'm3', name: 'Module 3: Classes and Data Abstraction' },
                { id: 'm4', name: 'Module 4: Overloading, Templates and Inheritance' },
                { id: 'm5', name: 'Module 5: Virtual Functions, Polymorphism, and File I/O' },
                { id: 'm6', name: 'Module 6: Exception Handling and STL' }
              ],
              questions: [ // Keep original questions
                 { questionId: 'it301_2019_1a', year: 2019, qNumber: 'Q1a', chapter: 'Module 3: Classes and Data Abstraction', text: 'Which feature allows open recursion among the following?\n\n*   (i) Use of `this` pointer\n*   (ii) Use of pointers\n*   (iii) Use of pass by value\n*   (iv) Use of parameterized constructor', type: 'MCQ', marks: 2 },
                 { questionId: 'it301_2019_1b', year: 2019, qNumber: 'Q1b', chapter: 'Module 4: Overloading, Templates and Inheritance', text: 'If same message is passed to objects of several different classes and all of those can respond in a different way, what is this feature called?\n\n*   (i) Inheritance\n*   (ii) Overloading\n*   (iii) Polymorphism\n*   (iv) Overriding', type: 'MCQ', marks: 2 },
                 { questionId: 'it301_2021_3a', year: 2021, qNumber: 'Q3a', chapter: 'Module 1: Introduction to C++ and OOP', text: 'Explain the difference between procedural programming and object-oriented programming.', type: 'Explanation', marks: 7 },
                 { questionId: 'it301_2021_misc', year: 2021, qNumber: 'Misc1', chapter: null, text: 'What is the purpose of the `main` function in C++?\n\n```cpp\n#include<iostream>\nint main(){\nstd::cout<<"Hello, World!"<<std::endl;\nreturn 0;\n}\n```\n   ![image](https://image.pollinations.ai/prompt/moon)', type: 'Explanation', marks: 5 },
                 { questionId: 'it301_2019_2a', year: 2019, qNumber: 'Q2a', chapter: 'Module 1: Introduction to C++ and OOP', text: 'What is Object-oriented Programming (OOP)? Write the basic concepts of OOP (e.g., Encapsulation, Abstraction, Inheritance, Polymorphism).', type: 'Explanation', marks: 7 },
                 { questionId: 'it301_2019_2b', year: 2019, qNumber: 'Q2b', chapter: 'Module 3: Classes and Data Abstraction', text: 'What do you mean by class and object? Give a simple example.', type: 'Explanation with Example', marks: 7 },
                 { questionId: 'it301_2019_9a', year: 2019, qNumber: 'Q9a', chapter: 'Module 4: Overloading, Templates and Inheritance', text: 'With the help of an example program, differentiate between Function Overloading and Function Overriding.', type: 'Differentiate with Example', marks: 7 },
                 { questionId: 'it301_2020_1c', year: 2020, qNumber: 'Q1c', chapter: 'Module 3: Classes and Data Abstraction', text: 'What is a constructor in C++?\n\n* (i) A function to destroy objects\n* (ii) A special member function to initialize objects\n* (iii) A data member of a class\n* (iv) A global function', type: 'MCQ', marks: 2 },
                 { questionId: 'it301_2020_1d', year: 2020, qNumber: 'Q1d', chapter: 'Module 4: Overloading, Templates and Inheritance', text: 'Which operator cannot be overloaded in C++?\n\n* (i) `+`\n* (ii) `::` (Scope Resolution)\n* (iii) `[]` (Array Subscript)\n* (iv) `()` (Function Call)', type: 'MCQ', marks: 2 },
                 { questionId: 'it301_2022_3b', year: 2022, qNumber: 'Q3b', chapter: 'Module 3: Classes and Data Abstraction', text: 'Explain the concept of data hiding (encapsulation) in C++. How is it achieved?', type: 'Explanation', marks: 7 },
                 { questionId: 'it301_2020_4a', year: 2020, qNumber: 'Q4a', chapter: 'Module 4: Overloading, Templates and Inheritance', text: 'What is inheritance? Explain different types of inheritance supported in C++ with suitable diagrams.', type: 'Explanation with Diagram', marks: 10 },
                 { questionId: 'it301_2021_5a', year: 2021, qNumber: 'Q5a', chapter: 'Module 5: Virtual Functions, Polymorphism, and File I/O', text: 'What is a virtual function? Explain its role in achieving runtime polymorphism with a suitable C++ example.', type: 'Explanation with Example', marks: 7 },
                 { questionId: 'it301_2022_6a', year: 2022, qNumber: 'Q6a', chapter: 'Module 3: Classes and Data Abstraction', text: 'Explain the use of `static` data members and `static` member functions in C++ with an example.', type: 'Explanation with Example', marks: 7 },
                 { questionId: 'it301_2018_7a', year: 2018, qNumber: 'Q7a', chapter: 'Module 6: Exception Handling and STL', text: 'What is exception handling? Explain the use of `try`, `catch`, and `throw` keywords in C++ with a simple program.', type: 'Explanation with Example', marks: 7 },
                 { questionId: 'it301_2019_8b', year: 2019, qNumber: 'Q8b', chapter: 'Module 4: Overloading, Templates and Inheritance', text: 'What are templates in C++? Write a C++ template function to find the maximum of two numbers (of any type).', type: 'Explanation with Code', marks: 7 },
                 { questionId: 'it301_2020_9b', year: 2020, qNumber: 'Q9b', chapter: 'Module 5: Virtual Functions, Polymorphism, and File I/O', text: 'Explain different file opening modes in C++. Write a program to read data from a text file and display it on the console.', type: 'Explanation with Code', marks: 7 },
                 { questionId: 'it301_2022_1e', year: 2022, qNumber: 'Q1e', chapter: 'Module 3: Classes and Data Abstraction', text: 'A destructor is invoked automatically when:\n\n* (i) An object is created\n* (ii) An object is assigned to another\n* (iii) An object goes out of scope or is explicitly deleted\n* (iv) A static member is accessed', type: 'MCQ', marks: 2 },
                 { questionId: 'it301_2018_2a', year: 2018, qNumber: 'Q2a', chapter: 'Module 1: Introduction to C++ and OOP', text: 'List the fundamental data types available in C++.', type: 'List', marks: 5 },
                 { questionId: 'it301_2021_6b', year: 2021, qNumber: 'Q6b', chapter: 'Module 3: Classes and Data Abstraction', text: 'What is a friend function? What are its characteristics and why is it used?', type: 'Explanation', marks: 7 },
                 { questionId: 'it301_2023_1f', year: 2023, qNumber: 'Q1f', chapter: 'Module 4: Overloading, Templates and Inheritance', text: 'Which access specifier allows members to be accessed by derived classes but not outside?', type: 'MCQ', marks: 2, options: ['(i) private', '(ii) public', '(iii) protected', '(iv) friend'] },
                 { questionId: 'it301_2023_4a', year: 2023, qNumber: 'Q4a', chapter: 'Module 5: Virtual Functions, Polymorphism, and File I/O', text: 'Explain the concept of abstract class and pure virtual function in C++.', type: 'Explanation', marks: 7 },
              ]
            },
            {
              id: 'it302',
              name: 'Data Structures & Algorithms',
              code: 'IT302',
              modules: [
                { id: 'm1', name: 'Module 1: Analysis of Algorithms & Arrays' },
                { id: 'm2', name: 'Module 2: Stacks & Queues' },
                { id: 'm3', name: 'Module 3: Linked Lists' },
                { id: 'm4', name: 'Module 4: Trees' },
                { id: 'm5', name: 'Module 5: Graphs' },
                { id: 'm6', name: 'Module 6: Sorting & Searching' },
                { id: 'm7', name: 'Module 7: Hashing' }
              ],
              questions: [ // Keep original questions
                { questionId: 'it302_2021_1a', year: 2021, qNumber: 'Q1a', chapter: 'Module 1: Analysis of Algorithms & Arrays', text: 'What is the time complexity (Big-O notation) of Linear Search in the worst case?\n\n* (i) O(1)\n* (ii) O(log n)\n* (iii) O(n)\n* (iv) O(n^2)', type: 'MCQ', marks: 2 },
                { questionId: 'it302_2022_6a', year: 2022, qNumber: 'Q6a', chapter: 'Module 4: Trees', text: 'Define a Binary Search Tree (BST). Construct a BST for the following sequence of numbers: `50, 30, 70, 20, 40, 60, 80`.', type: 'Definition & Problem', marks: 7 },
                { questionId: 'it302_2022_7a', year: 2022, qNumber: 'Q7a', chapter: 'Module 5: Graphs', text: 'Explain Depth First Search (DFS) algorithm with an example.', type: 'Explanation with Example', marks: 7 },
                { questionId: 'it302_2020_1b', year: 2020, qNumber: 'Q1b', chapter: 'Module 2: Stacks & Queues', text: 'Pushing an element onto a full stack results in?\n\n* (i) Stack Underflow\n* (ii) Stack Overflow\n* (iii) Pop operation\n* (iv) No change', type: 'MCQ', marks: 2 },
                { questionId: 'it302_2020_1c', year: 2020, qNumber: 'Q1c', chapter: 'Module 3: Linked Lists', text: 'In a singly linked list, each node contains:\n\n* (i) Only data\n* (ii) Only pointer to next node\n* (iii) Data and pointer to next node\n* (iv) Data and pointer to previous node', type: 'MCQ', marks: 2 },
                { questionId: 'it302_2021_2a', year: 2021, qNumber: 'Q2a', chapter: 'Module 1: Analysis of Algorithms & Arrays', text: 'Explain Asymptotic Notations (Big-O, Big-Omega, Big-Theta) used for analyzing algorithm efficiency.', type: 'Explanation', marks: 7 },
                { questionId: 'it302_2021_3b', year: 2021, qNumber: 'Q3b', chapter: 'Module 2: Stacks & Queues', text: 'Write algorithms for PUSH and POP operations on a stack implemented using an array.', type: 'Algorithm', marks: 7 },
                { questionId: 'it302_2020_4a', year: 2020, qNumber: 'Q4a', chapter: 'Module 3: Linked Lists', text: 'What is a Doubly Linked List? Write an algorithm to insert a node at a specified position in a doubly linked list.', type: 'Explanation with Algorithm', marks: 7 },
                { questionId: 'it302_2022_5b', year: 2022, qNumber: 'Q5b', chapter: 'Module 4: Trees', text: 'Explain inorder, preorder, and postorder traversals of a Binary Tree with an example.', type: 'Explanation with Example', marks: 7 },
                { questionId: 'it302_2020_6b', year: 2020, qNumber: 'Q6b', chapter: 'Module 6: Sorting & Searching', text: 'Write the algorithm for Binary Search. What is its time complexity? What is the prerequisite for applying Binary Search?', type: 'Algorithm & Explanation', marks: 7 },
                { questionId: 'it302_2021_7b', year: 2021, qNumber: 'Q7b', chapter: 'Module 5: Graphs', text: 'Explain Breadth First Search (BFS) algorithm with an example.', type: 'Explanation with Example', marks: 7 },
                { questionId: 'it302_2022_8a', year: 2022, qNumber: 'Q8a', chapter: 'Module 6: Sorting & Searching', text: 'Write the algorithm for Merge Sort. Analyze its time complexity.', type: 'Algorithm & Analysis', marks: 10 },
                { questionId: 'it302_2019_1d', year: 2019, qNumber: 'Q1d', chapter: 'Module 4: Trees', text: 'A binary tree where the height difference between left and right subtrees of any node is at most 1 is called?\n\n* (i) Complete Binary Tree\n* (ii) Full Binary Tree\n* (iii) AVL Tree\n* (iv) Skewed Tree', type: 'MCQ', marks: 2 },
                { questionId: 'it302_2019_3a', year: 2019, qNumber: 'Q3a', chapter: 'Module 2: Stacks & Queues', text: 'What is a Queue? Explain the operations ENQUEUE and DEQUEUE with respect to a queue implemented using a circular array.', type: 'Explanation', marks: 7 },
                { questionId: 'it302_2023_1e', year: 2023, qNumber: 'Q1e', chapter: 'Module 6: Sorting & Searching', text: 'Which sorting algorithm has the worst-case time complexity of O(n^2) but an average-case complexity of O(n log n)?', type: 'MCQ', marks: 2, options: ['(i) Bubble Sort', '(ii) Merge Sort', '(iii) Quick Sort', '(iv) Insertion Sort'] },
                { questionId: 'it302_2023_8b', year: 2023, qNumber: 'Q8b', chapter: 'Module 7: Hashing', text: 'What is Hashing? Explain different collision resolution techniques (e.g., Linear Probing, Chaining).', type: 'Explanation', marks: 7 },
                { questionId: 'it302_2018_5a', year: 2018, qNumber: 'Q5a', chapter: 'Module 4: Trees', text: 'What is a Heap? Explain Max-Heap property and show how to build a Max-Heap from the array: [4, 1, 3, 2, 16, 9, 10, 14, 8, 7]', type: 'Explanation & Problem', marks: 10 },
                { questionId: 'it302_2019_7a', year: 2019, qNumber: 'Q7a', chapter: 'Module 5: Graphs', text: 'Define Graph. Explain different ways to represent a graph in memory (Adjacency Matrix, Adjacency List).', type: 'Definition & Explanation', marks: 7 },
              ]
            },
             // Add other subjects for IT Sem 3 if available
             {
               id: 'it303', name: 'Digital Electronics', code: 'EC303', // Often taken by IT
               modules: [], questions: []
             },
             {
               id: 'it304', name: 'Mathematics III (Probability & Statistics)', code: 'BS301',
               modules: [], questions: []
             },
             {
                id: 'it305', name: 'Humanities I (Economics/Management)', code: 'HS301',
                modules: [], questions: []
             }
          ]
        },
        // Semester 4 (Original Data)
        {
          id: 'it_sem4',
          number: 4,
          subjects: [
            {
              id: 'it401',
              name: 'Web Technologies',
              code: 'IT401',
              modules: [
                { id: 'm1', name: 'Module 1: HTML & CSS' },
                { id: 'm2', name: 'Module 2: JavaScript Basics & DOM' },
                { id: 'm3', name: 'Module 3: Server-Side Scripting (e.g., PHP)' },
                { id: 'm4', name: 'Module 4: Database Connectivity & Sessions' },
                { id: 'm5', name: 'Module 5: XML & AJAX' },
              ],
              questions: [ // Keep original questions
                { questionId: 'it401_2023_1a', year: 2023, qNumber: 'Q1a', chapter: 'Module 1: HTML & CSS', text: 'Which HTML tag is used to create a hyperlink?\n\n* (i) `<link>`\n* (ii) `<a>`\n* (iii) `<hlink>`\n* (iv) `<url>`', type: 'MCQ', marks: 2 },
                { questionId: 'it401_2023_1b', year: 2023, qNumber: 'Q1b', chapter: 'Module 1: HTML & CSS', text: 'Which CSS property is used to change the text color of an element?\n\n* (i) `font-color`\n* (ii) `text-color`\n* (iii) `color`\n* (iv) `font-style`', type: 'MCQ', marks: 2 },
                { questionId: 'it401_2022_2a', year: 2022, qNumber: 'Q2a', chapter: 'Module 1: HTML & CSS', text: 'Explain the difference between `<div>` and `<span>` tags in HTML.', type: 'Explanation', marks: 5 },
                { questionId: 'it401_2022_2b', year: 2022, qNumber: 'Q2b', chapter: 'Module 1: HTML & CSS', text: 'What are the different ways to include CSS in an HTML document? Explain with examples.', type: 'Explanation with Example', marks: 7 },
                { questionId: 'it401_2023_3a', year: 2023, qNumber: 'Q3a', chapter: 'Module 2: JavaScript Basics & DOM', text: 'What is the DOM (Document Object Model)? How can JavaScript interact with it?', type: 'Explanation', marks: 7 },
                { questionId: 'it401_2022_4a', year: 2022, qNumber: 'Q4a', chapter: 'Module 2: JavaScript Basics & DOM', text: 'Write a JavaScript function to validate an email address entered in a form field.', type: 'Code', marks: 7 },
                { questionId: 'it401_2023_5a', year: 2023, qNumber: 'Q5a', chapter: 'Module 3: Server-Side Scripting (e.g., PHP)', text: 'Explain the difference between client-side scripting and server-side scripting.', type: 'Explanation', marks: 7 },
                { questionId: 'it401_2022_6a', year: 2022, qNumber: 'Q6a', chapter: 'Module 3: Server-Side Scripting (e.g., PHP)', text: 'Explain how variables are declared and used in PHP. Give examples of different data types.', type: 'Explanation with Example', marks: 7 },
                { questionId: 'it401_2023_7a', year: 2023, qNumber: 'Q7a', chapter: 'Module 4: Database Connectivity & Sessions', text: 'What are cookies and sessions? Explain their purpose in web applications and how they differ.', type: 'Explanation', marks: 7 },
                { questionId: 'it401_2022_8a', year: 2022, qNumber: 'Q8a', chapter: 'Module 5: XML & AJAX', text: 'What is AJAX? Explain its core components and how it improves user experience.', type: 'Explanation', marks: 7 },
                { questionId: 'it401_2023_1c', year: 2023, qNumber: 'Q1c', chapter: 'Module 2: JavaScript Basics & DOM', text: 'Which keyword is used to declare a variable in JavaScript that cannot be reassigned?', type: 'MCQ', marks: 2, options: ['(i) var', '(ii) let', '(iii) const', '(iv) static'] },
                { questionId: 'it401_2021_9a', year: 2021, qNumber: 'Q9a', chapter: 'Module 5: XML & AJAX', text: 'What is XML? List some advantages of using XML.', type: 'Explanation', marks: 5 },
              ]
            },
            {
              id: 'it402',
              name: 'Database Management Systems',
              code: 'IT402',
              modules: [
                { id: 'm1', name: 'Module 1: Introduction & ER Model' },
                { id: 'm2', name: 'Module 2: Relational Model & Algebra' },
                { id: 'm3', name: 'Module 3: SQL' },
                { id: 'm4', name: 'Module 4: Database Design & Normalization' },
                { id: 'm5', name: 'Module 5: Transaction Management & Concurrency' },
                { id: 'm6', name: 'Module 6: Indexing & Hashing' }
              ],
              questions: [ // Keep original questions
                { questionId: 'it402_2023_1a', year: 2023, qNumber: 'Q1a', chapter: 'Module 1: Introduction & ER Model', text: 'What is a DBMS? List two advantages over traditional file systems.', type: 'Definition & List', marks: 4 },
                { questionId: 'it402_2022_1b', year: 2022, qNumber: 'Q1b', chapter: 'Module 1: Introduction & ER Model', text: 'What is a Primary Key in a relational database?\n\n* (i) A key used for encryption\n* (ii) A unique identifier for a record in a table\n* (iii) A key that links two tables\n* (iv) A non-unique attribute', type: 'MCQ', marks: 2 },
                { questionId: 'it402_2022_1c', year: 2022, qNumber: 'Q1c', chapter: 'Module 2: Relational Model & Algebra', text: 'Which relational algebra operation selects tuples that satisfy a given predicate?\n\n* (i) Projection (Π)\n* (ii) Selection (σ)\n* (iii) Union (∪)\n* (iv) Cartesian Product (×)', type: 'MCQ', marks: 2 },
                { questionId: 'it402_2023_2a', year: 2023, qNumber: 'Q2a', chapter: 'Module 1: Introduction & ER Model', text: 'Explain the different components of an E-R (Entity-Relationship) Diagram with symbols.', type: 'Explanation', marks: 7 },
                { questionId: 'it402_2022_3a', year: 2022, qNumber: 'Q3a', chapter: 'Module 2: Relational Model & Algebra', text: 'Explain the concepts of Super Key, Candidate Key, Primary Key, and Foreign Key with examples.', type: 'Explanation with Example', marks: 7 },
                { questionId: 'it402_2023_4a', year: 2023, qNumber: 'Q4a', chapter: 'Module 3: SQL', text: 'What are DDL, DML, DCL, and TCL commands in SQL? Give one example for each.', type: 'Explanation with Example', marks: 7 },
                { questionId: 'it402_2022_5a', year: 2022, qNumber: 'Q5a', chapter: 'Module 4: Database Design & Normalization', text: 'What is Normalization? Explain 1NF, 2NF, and 3NF with suitable examples.', type: 'Explanation with Example', marks: 10 },
                { questionId: 'it402_2023_6a', year: 2023, qNumber: 'Q6a', chapter: 'Module 3: SQL', text: 'Consider two tables: `EMPLOYEE (EmpID, Name, DeptID)` and `DEPARTMENT (DeptID, DeptName)`. Write SQL queries for:\n(a) Find names of all employees working in the \'Sales\' department.\n(b) List all department names and the number of employees in each.', type: 'SQL Query', marks: 7 },
                { questionId: 'it402_2022_7a', year: 2022, qNumber: 'Q7a', chapter: 'Module 5: Transaction Management & Concurrency', text: 'What are ACID properties in the context of database transactions? Explain each property briefly.', type: 'Explanation', marks: 7 },
                { questionId: 'it402_2023_8a', year: 2023, qNumber: 'Q8a', chapter: 'Module 5: Transaction Management & Concurrency', text: 'Explain the concept of concurrency control in DBMS. Why is it needed?', type: 'Explanation', marks: 7 },
                { questionId: 'it402_2021_1d', year: 2021, qNumber: 'Q1d', chapter: 'Module 4: Database Design & Normalization', text: 'BCNF stands for:\n\n* (i) Binary Coded Normal Form\n* (ii) Boyce-Codd Normal Form\n* (iii) Basic Conceptual Normal Form\n* (iv) Balanced Clustered Normal Form', type: 'MCQ', marks: 2 },
                { questionId: 'it402_2021_9b', year: 2021, qNumber: 'Q9b', chapter: 'Module 6: Indexing & Hashing', text: 'What is indexing in DBMS? Explain the difference between clustered and non-clustered indexes.', type: 'Explanation', marks: 7 },
              ]
            },
            // Add other subjects for IT Sem 4 if available
            {
              id: 'it403', name: 'Computer Organization & Architecture', code: 'IT403',
              modules: [], questions: []
            },
            {
              id: 'it404', name: 'Discrete Mathematics', code: 'IT404', // Can sometimes be in Sem 4
              modules: [], questions: []
            },
            {
              id: 'it405', name: 'Biology for Engineers', code: 'BS401', // Often mandatory
              modules: [], questions: []
            }
          ]
        },
        // Semester 5 (Placeholder Subjects)
        {
          id: 'it_sem5',
          number: 5,
          subjects: [
            { id: 'it501', name: 'Operating Systems', code: 'IT501', modules: [], questions: [] },
            { id: 'it502', name: 'Computer Networks', code: 'IT502', modules: [], questions: [] },
            { id: 'it503', name: 'Formal Language & Automata Theory', code: 'IT503', modules: [], questions: [] },
            { id: 'it504', name: 'Software Engineering', code: 'IT504', modules: [], questions: [] },
            { id: 'it505', name: 'Microprocessor & Interfacing', code: 'EC501', modules: [], questions: [] }, // Example cross-dept code
            { id: 'it506', name: 'Professional Ethics', code: 'HS501', modules: [], questions: [] },
          ]
        },
        // Semester 6 (Placeholder Subjects)
        {
          id: 'it_sem6',
          number: 6,
          subjects: [
            { id: 'it601', name: 'Compiler Design', code: 'IT601', modules: [], questions: [] },
            { id: 'it602', name: 'Artificial Intelligence', code: 'IT602', modules: [], questions: [] },
            { id: 'it603', name: 'Cloud Computing', code: 'IT603', modules: [], questions: [] },
            { id: 'it604', name: 'Cryptography & Network Security', code: 'IT604', modules: [], questions: [] },
            { id: 'it605', name: 'Professional Elective I', code: 'IT6PE1', modules: [], questions: [] }, // E.g., Data Mining
            { id: 'it606', name: 'Minor Project / Seminar', code: 'IT6PW1', modules: [], questions: [] },
          ]
        },
        // Semester 7 (Placeholder Subjects)
        {
          id: 'it_sem7',
          number: 7,
          subjects: [
            { id: 'it701', name: 'Big Data Analytics', code: 'IT701', modules: [], questions: [] },
            { id: 'it702', name: 'Internet of Things (IoT)', code: 'IT702', modules: [], questions: [] },
            { id: 'it703', name: 'Professional Elective II', code: 'IT7PE2', modules: [], questions: [] }, // E.g., Machine Learning
            { id: 'it704', name: 'Professional Elective III', code: 'IT7PE3', modules: [], questions: [] }, // E.g., Image Processing
            { id: 'it705', name: 'Open Elective I', code: 'IT7OE1', modules: [], questions: [] },
            { id: 'it706', name: 'Project Phase I', code: 'IT7PW2', modules: [], questions: [] },
          ]
        },
        // Semester 8 (Placeholder Subjects)
        {
          id: 'it_sem8',
          number: 8,
          subjects: [
            { id: 'it801', name: 'Professional Elective IV', code: 'IT8PE4', modules: [], questions: [] }, // E.g., Deep Learning
            { id: 'it802', name: 'Open Elective II', code: 'IT8OE2', modules: [], questions: [] },
            { id: 'it803', name: 'Project Phase II / Internship', code: 'IT8PW3', modules: [], questions: [] },
            { id: 'it804', name: 'Grand Viva', code: 'IT8VV', modules: [], questions: [] },
          ]
        },
      ]
    },
    // ... other branches (Civil, Mech, EEE, ECE, CSE, Leather) with empty semesters ...
    {
      id: 'cse', // Code 105
      name: 'COMPUTER SCIENCE & ENGINEERING',
      icon: { set: 'MaterialCommunityIcons', name: 'desktop-classic' },
      semesters: [ /* Semesters 1-8 for CSE would go here */ ]
    },
    {
      id: 'ece', // Code 104
      name: 'ELECTRONICS & COMMUNICATION ENGINEERING',
      icon: { set: 'MaterialCommunityIcons', name: 'integrated-circuit-chip' },
      semesters: [ /* Semesters 1-8 for ECE would go here */ ]
    },
    {
      id: 'civil', // Code 101
      name: 'CIVIL ENGINEERING',
      icon: { set: 'MaterialCommunityIcons', name: 'office-building-outline' },
      semesters: [ /* Semesters 1-8 for Civil would go here */ ]
    },
    {
      id: 'mech', // Code 102
      name: 'MECHANICAL ENGINEERING',
      icon: { set: 'MaterialCommunityIcons', name: 'cog-outline' },
      semesters: [ /* Semesters 1-8 for Mech would go here */ ]
    },
    {
      id: 'eee', // Code 103
      name: 'ELECTRICAL ENGINEERING',
      icon: { set: 'Ionicons', name: 'flash-outline' },
      semesters: [ /* Semesters 1-8 for EEE would go here */ ]
    },
    {
      id: 'leather', // Code 107
      name: 'LEATHER TECHNOLOGY ENGINEERING',
      icon: { set: 'MaterialCommunityIcons', name: 'factory' },
      semesters: [ /* Semesters 1-8 for Leather Tech would go here */ ]
    },
  ],
};

export default beuData;