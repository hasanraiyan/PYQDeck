import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // Example import

// --- Placeholder Question Generator ---
// (Simple function to create a generic question based on subject name)
const createPlaceholderQuestion = (subjectId, subjectName, semesterNum) => {
   let qText = `Define a key concept related to "${subjectName}".`;
   let qType = 'Definition';
   let qChapter = 'Module 1: Fundamentals'; // Generic chapter
   let marks = 5; // Default marks

   if (subjectName.toLowerCase().includes('mathematics') || subjectName.toLowerCase().includes('physics')) {
      qText = `State a fundamental theorem or law covered in "${subjectName}". Explain its significance.`;
      qType = 'Explanation';
      marks = 7;
   } else if (subjectName.toLowerCase().includes('programming') || subjectName.toLowerCase().includes('data structure') || subjectName.toLowerCase().includes('algorithm')) {
      qText = `Explain the basic principle of a core concept in "${subjectName}" (e.g., loop, array, sorting). Write a small code snippet or pseudocode if applicable.`;
      qType = 'Explanation with Code';
      marks = 7;
   } else if (subjectName.toLowerCase().includes('drawing') || subjectName.toLowerCase().includes('design')) {
      qText = `Describe the standard conventions for representing a common element in "${subjectName}".`;
      qType = 'Description';
   } else if (subjectName.toLowerCase().includes('surveying') || subjectName.toLowerCase().includes('mechanics') || subjectName.toLowerCase().includes('thermodynamics') || subjectName.toLowerCase().includes('circuit') || subjectName.toLowerCase().includes('network') || subjectName.toLowerCase().includes('machine')) {
      qText = `Explain the working principle or application of a basic component/theory covered in "${subjectName}".`;
      qType = 'Explanation';
      marks = 7;
   } else if (subjectName.toLowerCase().includes('chemistry') || subjectName.toLowerCase().includes('biology') || subjectName.toLowerCase().includes('environmental')) {
      qText = `Describe a fundamental process or classification relevant to "${subjectName}".`;
      qType = 'Description';
   } else if (subjectName.toLowerCase().includes('project') || subjectName.toLowerCase().includes('seminar') || subjectName.toLowerCase().includes('viva')) {
      qText = `Outline the key steps or evaluation criteria for "${subjectName}".`;
      qType = 'Outline';
      marks = 10;
   } else if (subjectName.toLowerCase().includes('elective')) {
      qText = `Discuss a major application or challenge within the scope of this elective: "${subjectName}".`;
      qType = 'Discussion';
      marks = 7;
   }


   return {
      questionId: `${subjectId}_sem${semesterNum}_q1`, // Unique ID
      year: 2023, // Placeholder year
      qNumber: 'Q1a', // Placeholder question number
      chapter: qChapter,
      text: qText,
      type: qType,
      marks: marks,
   };
};


const beuData = {
   branches: [
      // --- Information Technology (IT - 106) ---
      {
         id: 'it',
         name: 'INFORMATION TECHNOLOGY',
         icon: { set: 'Ionicons', name: 'laptop-outline' },
         semesters: [
            { // Sem 1
               id: 'it_sem1', number: 1, subjects: [
                  { id: 'it101', name: 'Mathematics I', code: 'BS101', modules: [], questions: [createPlaceholderQuestion('it101', 'Mathematics I', 1)] },
                  { id: 'it102', name: 'Physics I', code: 'BS102', modules: [], questions: [] },
                  { id: 'it103', name: 'Chemistry', code: 'BS103', modules: [], questions: [] },
                  { id: 'it104', name: 'Basic Electrical Engineering', code: 'ES101', modules: [], questions: [] },
                  { id: 'it105', name: 'Engineering Workshop', code: 'ES102', modules: [], questions: [] },
                  { id: 'it106', name: 'Communicative English', code: 'HS101', modules: [], questions: [] },
               ]
            },
            { // Sem 2
               id: 'it_sem2', number: 2, subjects: [
                  { id: 'it201', name: 'Mathematics II', code: 'BS201', modules: [], questions: [createPlaceholderQuestion('it201', 'Mathematics II', 2)] },
                  { id: 'it202', name: 'Physics II (Waves & Optics)', code: 'BS202', modules: [], questions: [] },
                  { id: 'it203', name: 'Programming for Problem Solving (C)', code: 'ES201', modules: [], questions: [] },
                  { id: 'it204', name: 'Basic Electronics Engineering', code: 'ES202', modules: [], questions: [] },
                  { id: 'it205', name: 'Engineering Graphics & Design', code: 'ES203', modules: [], questions: [] },
                  { id: 'it206', name: 'Environmental Science', code: 'MC201', modules: [], questions: [] },
               ]
            },
            {
               "id": "it_sem3",
               "number": 3,
               "subjects": [
                  {
                     "id": "it301",
                     "name": "Object-Oriented Programming Using C++",
                     "code": "100313",
                     "modules": [
                        { "id": "m1", "name": "Module 1: Introduction to C++ and OOP" },
                        { "id": "m2", "name": "Module 2: Control Structures, Functions, and Pointers" },
                        { "id": "m3", "name": "Module 3: Classes and Data Abstraction" },
                        { "id": "m4", "name": "Module 4: Overloading, Templates and Inheritance" },
                        { "id": "m5", "name": "Module 5: Virtual Functions, Polymorphism, and File I/O" },
                        { "id": "m6", "name": "Module 6: Exception Handling and STL" }
                     ],
                     "questions": [
                        { "questionId": "it301_2019_1a", "year": 2019, "qNumber": "Q1a", "chapter": "Module 3: Classes and Data Abstraction", "text": "Which feature allows open recursion among the following?\n\n*   (i) Use of `this` pointer\n*   (ii) Use of pointers\n*   (iii) Use of pass by value\n*   (iv) Use of parameterized constructor", "type": "MCQ", "marks": 2 },
                        { "questionId": "it301_2019_1b", "year": 2019, "qNumber": "Q1b", "chapter": "Module 4: Overloading, Templates and Inheritance", "text": "If same message is passed to objects of several different classes and all of those can respond in a different way, what is this feature called?\n\n*   (i) Inheritance\n*   (ii) Overloading\n*   (iii) Polymorphism\n*   (iv) Overriding", "type": "MCQ", "marks": 2 },
                        { "questionId": "it301_2021_3a", "year": 2021, "qNumber": "Q3a", "chapter": "Module 1: Introduction to C++ and OOP", "text": "Explain the difference between procedural programming and object-oriented programming.", "type": "Explanation", "marks": 7 },
                        { "questionId": "it301_2021_misc", "year": 2021, "qNumber": "Misc1", "chapter": null, "text": "What is the purpose of the `main` function in C++?\n\n```cpp\n#include<iostream>\nint main(){\nstd::cout<<\"Hello, World!\"<<std::endl;\nreturn 0;\n}\n```\n   ![image](https://image.pollinations.ai/prompt/moon)", "type": "Explanation", "marks": 5 },
                        { "questionId": "it301_2019_2a", "year": 2019, "qNumber": "Q2a", "chapter": "Module 1: Introduction to C++ and OOP", "text": "What is Object-oriented Programming (OOP)? Write the basic concepts of OOP (e.g., Encapsulation, Abstraction, Inheritance, Polymorphism).", "type": "Explanation", "marks": 7 },
                        { "questionId": "it301_2019_2b", "year": 2019, "qNumber": "Q2b", "chapter": "Module 3: Classes and Data Abstraction", "text": "What do you mean by class and object? Give a simple example.", "type": "Explanation with Example", "marks": 7 },
                        { "questionId": "it301_2019_9a", "year": 2019, "qNumber": "Q9a", "chapter": "Module 4: Overloading, Templates and Inheritance", "text": "With the help of an example program, differentiate between Function Overloading and Function Overriding.", "type": "Differentiate with Example", "marks": 7 },
                        { "questionId": "it301_2020_1c", "year": 2020, "qNumber": "Q1c", "chapter": "Module 3: Classes and Data Abstraction", "text": "What is a constructor in C++?\n\n* (i) A function to destroy objects\n* (ii) A special member function to initialize objects\n* (iii) A data member of a class\n* (iv) A global function", "type": "MCQ", "marks": 2 },
                        { "questionId": "it301_2020_1d", "year": 2020, "qNumber": "Q1d", "chapter": "Module 4: Overloading, Templates and Inheritance", "text": "Which operator cannot be overloaded in C++?\n\n* (i) `+`\n* (ii) `::` (Scope Resolution)\n* (iii) `[]` (Array Subscript)\n* (iv) `()` (Function Call)", "type": "MCQ", "marks": 2 },
                        { "questionId": "it301_2022_3b", "year": 2022, "qNumber": "Q3b", "chapter": "Module 3: Classes and Data Abstraction", "text": "Explain the concept of data hiding (encapsulation) in C++. How is it achieved?", "type": "Explanation", "marks": 7 },
                        { "questionId": "it301_2020_4a", "year": 2020, "qNumber": "Q4a", "chapter": "Module 4: Overloading, Templates and Inheritance", "text": "What is inheritance? Explain different types of inheritance supported in C++ with suitable diagrams.", "type": "Explanation with Diagram", "marks": 10 },
                        { "questionId": "it301_2021_5a", "year": 2021, "qNumber": "Q5a", "chapter": "Module 5: Virtual Functions, Polymorphism, and File I/O", "text": "What is a virtual function? Explain its role in achieving runtime polymorphism with a suitable C++ example.", "type": "Explanation with Example", "marks": 7 },
                        { "questionId": "it301_2022_6a", "year": 2022, "qNumber": "Q6a", "chapter": "Module 3: Classes and Data Abstraction", "text": "Explain the use of `static` data members and `static` member functions in C++ with an example.", "type": "Explanation with Example", "marks": 7 },
                        { "questionId": "it301_2018_7a", "year": 2018, "qNumber": "Q7a", "chapter": "Module 6: Exception Handling and STL", "text": "What is exception handling? Explain the use of `try`, `catch`, and `throw` keywords in C++ with a simple program.", "type": "Explanation with Example", "marks": 7 },
                        { "questionId": "it301_2019_8b", "year": 2019, "qNumber": "Q8b", "chapter": "Module 4: Overloading, Templates and Inheritance", "text": "What are templates in C++? Write a C++ template function to find the maximum of two numbers (of any type).", "type": "Explanation with Code", "marks": 7 },
                        { "questionId": "it301_2020_9b", "year": 2020, "qNumber": "Q9b", "chapter": "Module 5: Virtual Functions, Polymorphism, and File I/O", "text": "Explain different file opening modes in C++. Write a program to read data from a text file and display it on the console.", "type": "Explanation with Code", "marks": 7 },
                        { "questionId": "it301_2022_1e", "year": 2022, "qNumber": "Q1e", "chapter": "Module 3: Classes and Data Abstraction", "text": "A destructor is invoked automatically when:\n\n* (i) An object is created\n* (ii) An object is assigned to another\n* (iii) An object goes out of scope or is explicitly deleted\n* (iv) A static member is accessed", "type": "MCQ", "marks": 2 },
                        { "questionId": "it301_2018_2a", "year": 2018, "qNumber": "Q2a", "chapter": "Module 1: Introduction to C++ and OOP", "text": "List the fundamental data types available in C++.", "type": "List", "marks": 5 },
                        { "questionId": "it301_2021_6b", "year": 2021, "qNumber": "Q6b", "chapter": "Module 3: Classes and Data Abstraction", "text": "What is a friend function? What are its characteristics and why is it used?", "type": "Explanation", "marks": 7 },
                        { "questionId": "it301_2023_1f", "year": 2023, "qNumber": "Q1f", "chapter": "Module 4: Overloading, Templates and Inheritance", "text": "Which access specifier allows members to be accessed by derived classes but not outside?", "type": "MCQ", "marks": 2, "options": ["(i) private", "(ii) public", "(iii) protected", "(iv) friend"] },
                        { "questionId": "it301_2023_4a", "year": 2023, "qNumber": "Q4a", "chapter": "Module 5: Virtual Functions, Polymorphism, and File I/O", "text": "Explain the concept of abstract class and pure virtual function in C++.", "type": "Explanation", "marks": 7 },
                        { "questionId": "it301_2022_2a", "year": 2022, "qNumber": "Q2a", "chapter": "Module 2: Control Structures, Functions, and Pointers", "text": "Explain the difference between pass by value and pass by reference in C++ functions with examples.", "type": "Explanation with Example", "marks": 7 },
                        { "questionId": "it301_2020_3a", "year": 2020, "qNumber": "Q3a", "chapter": "Module 3: Classes and Data Abstraction", "text": "What is a copy constructor? When is it invoked? Provide an example.", "type": "Explanation with Example", "marks": 7 },
                        { "questionId": "it301_2021_4b", "year": 2021, "qNumber": "Q4b", "chapter": "Module 4: Overloading, Templates and Inheritance", "text": "Explain the concept of operator overloading. Overload the `+` operator for a class representing complex numbers.", "type": "Explanation with Code", "marks": 10 },
                        { "questionId": "it301_2018_5b", "year": 2018, "qNumber": "Q5b", "chapter": "Module 5: Virtual Functions, Polymorphism, and File I/O", "text": "What is the `this` pointer in C++? Explain its significance with an example.", "type": "Explanation with Example", "marks": 6 },
                        { "questionId": "it301_2023_7a", "year": 2023, "qNumber": "Q7a", "chapter": "Module 6: Exception Handling and STL", "text": "What is the Standard Template Library (STL)? Explain the role of containers, iterators, and algorithms in STL.", "type": "Explanation", "marks": 7 },
                        { "questionId": "it301_2023_7b", "year": 2023, "qNumber": "Q7b", "chapter": "Module 6: Exception Handling and STL", "text": "Write a C++ program using STL vectors to store integers, add elements, and print them.", "type": "Code", "marks": 7 },
                        { "questionId": "it301_2022_8a", "year": 2022, "qNumber": "Q8a", "chapter": "Module 4: Overloading, Templates and Inheritance", "text": "What is multiple inheritance? Explain the ambiguity problem associated with it and how it can be resolved in C++.", "type": "Explanation", "marks": 7 },
                        { "questionId": "it301_2021_1c", "year": 2021, "qNumber": "Q1c", "chapter": "Module 2: Control Structures, Functions, and Pointers", "text": "A pointer that does not point to any valid memory address is called?\n\n* (i) Void Pointer\n* (ii) Null Pointer\n* (iii) Wild Pointer\n* (iv) This Pointer", "type": "MCQ", "marks": 2 },
                        { "questionId": "it301_2020_5a", "year": 2020, "qNumber": "Q5a", "chapter": "Module 5: Virtual Functions, Polymorphism, and File I/O", "text": "Explain the difference between compile-time (static) polymorphism and run-time (dynamic) polymorphism.", "type": "Differentiate", "marks": 6 },
                        { "questionId": "it301_2023_6a", "year": 2023, "qNumber": "Q6a", "chapter": "Module 6: Exception Handling and STL", "text": "What happens if an exception is thrown but not caught by any `catch` block?", "type": "Explanation", "marks": 5 },
                        { "questionId": "it301_2019_4a", "year": 2019, "qNumber": "Q4a", "chapter": "Module 3: Classes and Data Abstraction", "text": "Explain the different access specifiers (`public`, `private`, `protected`) in C++ classes.", "type": "Explanation", "marks": 7 }
                     ]
                  },
                  {
                     "id": "it302",
                     "name": "Data Structures & Algorithms",
                     "code": "100304",
                     "modules": [
                        { "id": "m1", "name": "Module 1: Analysis of Algorithms & Arrays" },
                        { "id": "m2", "name": "Module 2: Stacks & Queues" },
                        { "id": "m3", "name": "Module 3: Linked Lists" },
                        { "id": "m4", "name": "Module 4: Trees" },
                        { "id": "m5", "name": "Module 5: Graphs" },
                        { "id": "m6", "name": "Module 6: Sorting & Searching" },
                        { "id": "m7", "name": "Module 7: Hashing" }
                     ],
                     "questions": [
                        { "questionId": "it302_2021_1a", "year": 2021, "qNumber": "Q1a", "chapter": "Module 1: Analysis of Algorithms & Arrays", "text": "What is the time complexity (Big-O notation) of Linear Search in the worst case?\n\n* (i) O(1)\n* (ii) O(log n)\n* (iii) O(n)\n* (iv) O(n^2)", "type": "MCQ", "marks": 2 },
                        { "questionId": "it302_2022_6a", "year": 2022, "qNumber": "Q6a", "chapter": "Module 4: Trees", "text": "Define a Binary Search Tree (BST). Construct a BST for the following sequence of numbers: `50, 30, 70, 20, 40, 60, 80`.", "type": "Definition & Problem", "marks": 7 },
                        { "questionId": "it302_2022_7a", "year": 2022, "qNumber": "Q7a", "chapter": "Module 5: Graphs", "text": "Explain Depth First Search (DFS) algorithm with an example.", "type": "Explanation with Example", "marks": 7 },
                        { "questionId": "it302_2020_1b", "year": 2020, "qNumber": "Q1b", "chapter": "Module 2: Stacks & Queues", "text": "Pushing an element onto a full stack results in?\n\n* (i) Stack Underflow\n* (ii) Stack Overflow\n* (iii) Pop operation\n* (iv) No change", "type": "MCQ", "marks": 2 },
                        { "questionId": "it302_2020_1c", "year": 2020, "qNumber": "Q1c", "chapter": "Module 3: Linked Lists", "text": "In a singly linked list, each node contains:\n\n* (i) Only data\n* (ii) Only pointer to next node\n* (iii) Data and pointer to next node\n* (iv) Data and pointer to previous node", "type": "MCQ", "marks": 2 },
                        { "questionId": "it302_2021_2a", "year": 2021, "qNumber": "Q2a", "chapter": "Module 1: Analysis of Algorithms & Arrays", "text": "Explain Asymptotic Notations (Big-O, Big-Omega, Big-Theta) used for analyzing algorithm efficiency.", "type": "Explanation", "marks": 7 },
                        { "questionId": "it302_2021_3b", "year": 2021, "qNumber": "Q3b", "chapter": "Module 2: Stacks & Queues", "text": "Write algorithms for PUSH and POP operations on a stack implemented using an array.", "type": "Algorithm", "marks": 7 },
                        { "questionId": "it302_2020_4a", "year": 2020, "qNumber": "Q4a", "chapter": "Module 3: Linked Lists", "text": "What is a Doubly Linked List? Write an algorithm to insert a node at a specified position in a doubly linked list.", "type": "Explanation with Algorithm", "marks": 7 },
                        { "questionId": "it302_2022_5b", "year": 2022, "qNumber": "Q5b", "chapter": "Module 4: Trees", "text": "Explain inorder, preorder, and postorder traversals of a Binary Tree with an example.", "type": "Explanation with Example", "marks": 7 },
                        { "questionId": "it302_2020_6b", "year": 2020, "qNumber": "Q6b", "chapter": "Module 6: Sorting & Searching", "text": "Write the algorithm for Binary Search. What is its time complexity? What is the prerequisite for applying Binary Search?", "type": "Algorithm & Explanation", "marks": 7 },
                        { "questionId": "it302_2021_7b", "year": 2021, "qNumber": "Q7b", "chapter": "Module 5: Graphs", "text": "Explain Breadth First Search (BFS) algorithm with an example.", "type": "Explanation with Example", "marks": 7 },
                        { "questionId": "it302_2022_8a", "year": 2022, "qNumber": "Q8a", "chapter": "Module 6: Sorting & Searching", "text": "Write the algorithm for Merge Sort. Analyze its time complexity.", "type": "Algorithm & Analysis", "marks": 10 },
                        { "questionId": "it302_2019_1d", "year": 2019, "qNumber": "Q1d", "chapter": "Module 4: Trees", "text": "A binary tree where the height difference between left and right subtrees of any node is at most 1 is called?\n\n* (i) Complete Binary Tree\n* (ii) Full Binary Tree\n* (iii) AVL Tree\n* (iv) Skewed Tree", "type": "MCQ", "marks": 2 },
                        { "questionId": "it302_2019_3a", "year": 2019, "qNumber": "Q3a", "chapter": "Module 2: Stacks & Queues", "text": "What is a Queue? Explain the operations ENQUEUE and DEQUEUE with respect to a queue implemented using a circular array.", "type": "Explanation", "marks": 7 },
                        { "questionId": "it302_2023_1e", "year": 2023, "qNumber": "Q1e", "chapter": "Module 6: Sorting & Searching", "text": "Which sorting algorithm has the worst-case time complexity of O(n^2) but an average-case complexity of O(n log n)?", "type": "MCQ", "marks": 2, "options": ["(i) Bubble Sort", "(ii) Merge Sort", "(iii) Quick Sort", "(iv) Insertion Sort"] },
                        { "questionId": "it302_2023_8b", "year": 2023, "qNumber": "Q8b", "chapter": "Module 7: Hashing", "text": "What is Hashing? Explain different collision resolution techniques (e.g., Linear Probing, Chaining).", "type": "Explanation", "marks": 7 },
                        { "questionId": "it302_2018_5a", "year": 2018, "qNumber": "Q5a", "chapter": "Module 4: Trees", "text": "What is a Heap? Explain Max-Heap property and show how to build a Max-Heap from the array: [4, 1, 3, 2, 16, 9, 10, 14, 8, 7]", "type": "Explanation & Problem", "marks": 10 },
                        { "questionId": "it302_2019_7a", "year": 2019, "qNumber": "Q7a", "chapter": "Module 5: Graphs", "text": "Define Graph. Explain different ways to represent a graph in memory (Adjacency Matrix, Adjacency List).", "type": "Definition & Explanation", "marks": 7 },
                        { "questionId": "it302_2022_2b", "year": 2022, "qNumber": "Q2b", "chapter": "Module 1: Analysis of Algorithms & Arrays", "text": "Define time complexity and space complexity of an algorithm. Why is analyzing complexity important?", "type": "Definition & Explanation", "marks": 6 },
                        { "questionId": "it302_2021_4a", "year": 2021, "qNumber": "Q4a", "chapter": "Module 3: Linked Lists", "text": "Write an algorithm to reverse a singly linked list.", "type": "Algorithm", "marks": 7 },
                        { "questionId": "it302_2023_5a", "year": 2023, "qNumber": "Q5a", "chapter": "Module 4: Trees", "text": "What is an AVL tree? Explain the different types of rotations (LL, RR, LR, RL) used to balance an AVL tree with examples.", "type": "Explanation with Example", "marks": 10 },
                        { "questionId": "it302_2020_8a", "year": 2020, "qNumber": "Q8a", "chapter": "Module 5: Graphs", "text": "Explain Dijkstra's algorithm for finding the shortest path in a graph. Illustrate with an example.", "type": "Explanation with Example", "marks": 10 },
                        { "questionId": "it302_2018_6a", "year": 2018, "qNumber": "Q6a", "chapter": "Module 6: Sorting & Searching", "text": "Write the algorithm for Quick Sort. Analyze its best, average, and worst-case time complexity.", "type": "Algorithm & Analysis", "marks": 10 },
                        { "questionId": "it302_2023_7a", "year": 2023, "qNumber": "Q7a", "chapter": "Module 7: Hashing", "text": "What is a hash function? What are the properties of a good hash function?", "type": "Explanation", "marks": 5 },
                        { "questionId": "it302_2021_1b", "year": 2021, "qNumber": "Q1b", "chapter": "Module 2: Stacks & Queues", "text": "Which data structure follows the Last-In-First-Out (LIFO) principle?", "type": "MCQ", "marks": 2, "options": ["(i) Queue", "(ii) Stack", "(iii) Linked List", "(iv) Tree"] },
                        { "questionId": "it302_2019_4b", "year": 2019, "qNumber": "Q4b", "chapter": "Module 3: Linked Lists", "text": "Compare and contrast arrays and linked lists in terms of memory allocation, insertion/deletion efficiency, and access time.", "type": "Comparison", "marks": 7 },
                        { "questionId": "it302_2022_1c", "year": 2022, "qNumber": "Q1c", "chapter": "Module 4: Trees", "text": "The number of edges in a tree with 'n' nodes is?", "type": "MCQ", "marks": 2, "options": ["(i) n", "(ii) n-1", "(iii) n+1", "(iv) n/2"] },
                        { "questionId": "it302_2020_7b", "year": 2020, "qNumber": "Q7b", "chapter": "Module 5: Graphs", "text": "Explain Kruskal's algorithm for finding the Minimum Spanning Tree (MST) of a graph with an example.", "type": "Explanation with Example", "marks": 7 },
                        { "questionId": "it302_2023_6b", "year": 2023, "qNumber": "Q6b", "chapter": "Module 6: Sorting & Searching", "text": "Explain Insertion Sort algorithm with an example. What is its time complexity?", "type": "Explanation with Example", "marks": 7 },
                        { "questionId": "it302_2018_8b", "year": 2018, "qNumber": "Q8b", "chapter": "Module 7: Hashing", "text": "Explain quadratic probing as a collision resolution technique in hashing.", "type": "Explanation", "marks": 5 }
                     ]
                  },
                  {
                     "id": "it303",
                     "name": "Digital Electronics",
                     "code": "100305",
                     "modules": [
                        { "id": "m1", "name": "Module 1: Number Systems & Codes" },
                        { "id": "m2", "name": "Module 2: Logic Gates & Boolean Algebra" },
                        { "id": "m3", "name": "Module 3: Combinational Logic Circuits" },
                        { "id": "m4", "name": "Module 4: Sequential Logic Circuits" },
                        { "id": "m5", "name": "Module 5: Memory Devices & PLDs" }
                     ],
                     "questions": [
                        { "questionId": "it303_2021_1a", "year": 2021, "qNumber": "Q1a", "chapter": "Module 1: Number Systems & Codes", "text": "Convert the binary number 1101.101 to its decimal equivalent.", "type": "Problem", "marks": 3 },
                        { "questionId": "it303_2021_1b", "year": 2021, "qNumber": "Q1b", "chapter": "Module 2: Logic Gates & Boolean Algebra", "text": "Which logic gate is known as the universal gate?", "type": "MCQ", "marks": 2, "options": ["(i) AND", "(ii) OR", "(iii) NOT", "(iv) NAND"] },
                        { "questionId": "it303_2022_2a", "year": 2022, "qNumber": "Q2a", "chapter": "Module 2: Logic Gates & Boolean Algebra", "text": "State and prove De Morgan's theorems using truth tables.", "type": "Proof", "marks": 7 },
                        { "questionId": "it303_2022_3a", "year": 2022, "qNumber": "Q3a", "chapter": "Module 3: Combinational Logic Circuits", "text": "What is a multiplexer? Explain the operation of a 4-to-1 multiplexer with its logic diagram and truth table.", "type": "Explanation", "marks": 7 },
                        { "questionId": "it303_2020_4a", "year": 2020, "qNumber": "Q4a", "chapter": "Module 4: Sequential Logic Circuits", "text": "Explain the difference between combinational and sequential logic circuits.", "type": "Differentiate", "marks": 5 },
                        { "questionId": "it303_2020_4b", "year": 2020, "qNumber": "Q4b", "chapter": "Module 4: Sequential Logic Circuits", "text": "What is a flip-flop? Explain the working of an SR flip-flop with its truth table and logic diagram. What is its drawback?", "type": "Explanation", "marks": 8 },
                        { "questionId": "it303_2019_5a", "year": 2019, "qNumber": "Q5a", "chapter": "Module 3: Combinational Logic Circuits", "text": "Design a Full Adder circuit using basic logic gates. Provide the truth table and logic diagram.", "type": "Design", "marks": 8 },
                        { "questionId": "it303_2019_6a", "year": 2019, "qNumber": "Q6a", "chapter": "Module 4: Sequential Logic Circuits", "text": "What is a counter? Explain the operation of a 3-bit asynchronous (ripple) up-counter.", "type": "Explanation", "marks": 7 },
                        { "questionId": "it303_2023_1c", "year": 2023, "qNumber": "Q1c", "chapter": "Module 1: Number Systems & Codes", "text": "What is the 2's complement of the binary number 10110?", "type": "Problem", "marks": 2 },
                        { "questionId": "it303_2023_2b", "year": 2023, "qNumber": "Q2b", "chapter": "Module 2: Logic Gates & Boolean Algebra", "text": "Simplify the Boolean expression F(A, B, C) = Σm(0, 2, 4, 5, 6) using Karnaugh map (K-map).", "type": "Problem", "marks": 7 },
                        { "questionId": "it303_2021_3b", "year": 2021, "qNumber": "Q3b", "chapter": "Module 3: Combinational Logic Circuits", "text": "What is a decoder? Explain the working of a 3-to-8 line decoder.", "type": "Explanation", "marks": 7 },
                        { "questionId": "it303_2022_5b", "year": 2022, "qNumber": "Q5b", "chapter": "Module 4: Sequential Logic Circuits", "text": "Explain the operation of a D flip-flop and a T flip-flop.", "type": "Explanation", "marks": 7 },
                        { "questionId": "it303_2020_7a", "year": 2020, "qNumber": "Q7a", "chapter": "Module 5: Memory Devices & PLDs", "text": "Explain the difference between RAM and ROM. List different types of ROM.", "type": "Differentiate & List", "marks": 7 },
                        { "questionId": "it303_2018_8a", "year": 2018, "qNumber": "Q8a", "chapter": "Module 4: Sequential Logic Circuits", "text": "What is a shift register? Explain Serial-In, Parallel-Out (SIPO) shift register operation.", "type": "Explanation", "marks": 7 },
                        { "questionId": "it303_2023_7b", "year": 2023, "qNumber": "Q7b", "chapter": "Module 5: Memory Devices & PLDs", "text": "What are Programmable Logic Devices (PLDs)? Briefly explain PLA and PAL.", "type": "Explanation", "marks": 6 }
                     ]
                  },
                  {
                     "id": "it304",
                     "name": "Mathematics III (Probability & Statistics)",
                     "code": "100311",
                     "modules": [
                        { "id": "m1", "name": "Module 1: Basic Probability" },
                        { "id": "m2", "name": "Module 2: Random Variables & Distributions" },
                        { "id": "m3", "name": "Module 3: Joint Distributions & Expectation" },
                        { "id": "m4", "name": "Module 4: Sampling Distributions & Estimation" },
                        { "id": "m5", "name": "Module 5: Hypothesis Testing" }
                     ],
                     "questions": [
                        { "questionId": "it304_2021_1a", "year": 2021, "qNumber": "Q1a", "chapter": "Module 1: Basic Probability", "text": "State the axioms of probability.", "type": "Definition", "marks": 3 },
                        { "questionId": "it304_2021_1b", "year": 2021, "qNumber": "Q1b", "chapter": "Module 1: Basic Probability", "text": "If P(A) = 0.4, P(B) = 0.5, and P(A ∩ B) = 0.2, find P(A ∪ B).", "type": "Problem", "marks": 3 },
                        { "questionId": "it304_2022_2a", "year": 2022, "qNumber": "Q2a", "chapter": "Module 1: Basic Probability", "text": "State and prove Bayes' Theorem.", "type": "Proof", "marks": 7 },
                        { "questionId": "it304_2022_3a", "year": 2022, "qNumber": "Q3a", "chapter": "Module 2: Random Variables & Distributions", "text": "Define Probability Density Function (PDF) for a continuous random variable. State its properties.", "type": "Definition", "marks": 5 },
                        { "questionId": "it304_2020_4a", "year": 2020, "qNumber": "Q4a", "chapter": "Module 2: Random Variables & Distributions", "text": "A random variable X follows a Poisson distribution with mean 3. Find P(X=2) and P(X>1). (e^-3 = 0.0498)", "type": "Problem", "marks": 7 },
                        { "questionId": "it304_2020_5a", "year": 2020, "qNumber": "Q5a", "chapter": "Module 3: Joint Distributions & Expectation", "text": "Define mathematical expectation (Expected Value) and variance of a discrete random variable.", "type": "Definition", "marks": 5 },
                        { "questionId": "it304_2019_6a", "year": 2019, "qNumber": "Q6a", "chapter": "Module 2: Random Variables & Distributions", "text": "State the probability mass function (PMF) of a Binomial distribution. Find the mean and variance of the Binomial distribution.", "type": "Definition & Derivation", "marks": 8 },
                        { "questionId": "it304_2019_7a", "year": 2019, "qNumber": "Q7a", "chapter": "Module 4: Sampling Distributions & Estimation", "text": "What is the Central Limit Theorem? Explain its significance in statistics.", "type": "Explanation", "marks": 6 },
                        { "questionId": "it304_2023_1c", "year": 2023, "qNumber": "Q1c", "chapter": "Module 5: Hypothesis Testing", "text": "What is a Type I error in hypothesis testing?", "type": "Definition", "marks": 2 },
                        { "questionId": "it304_2023_8a", "year": 2023, "qNumber": "Q8a", "chapter": "Module 5: Hypothesis Testing", "text": "Explain the procedure for testing a hypothesis concerning the mean of a population when the population standard deviation is known (Z-test).", "type": "Explanation", "marks": 7 },
                        { "questionId": "it304_2021_4b", "year": 2021, "qNumber": "Q4b", "chapter": "Module 2: Random Variables & Distributions", "text": "Assume the heights of students are normally distributed with a mean of 165 cm and a standard deviation of 5 cm. What is the probability that a randomly selected student has a height between 160 cm and 170 cm? (Use standard normal table values: P(Z<1)=0.8413, P(Z<-1)=0.1587)", "type": "Problem", "marks": 7 },
                        { "questionId": "it304_2022_7b", "year": 2022, "qNumber": "Q7b", "chapter": "Module 4: Sampling Distributions & Estimation", "text": "Explain the concept of confidence interval for a population mean.", "type": "Explanation", "marks": 5 }
                     ]
                  },
                  {
                     "id": "it305",
                     "name": "Discrete Mathematics",
                     "code": "106301",
                     "modules": [
                        { "id": "m1", "name": "Module 1: Set Theory & Logic" },
                        { "id": "m2", "name": "Module 2: Relations & Functions" },
                        { "id": "m3", "name": "Module 3: Combinatorics" },
                        { "id": "m4", "name": "Module 4: Graph Theory" },
                        { "id": "m5", "name": "Module 5: Algebraic Structures" }
                     ],
                     "questions": [
                        { "questionId": "it305_2021_1a", "year": 2021, "qNumber": "Q1a", "chapter": "Module 1: Set Theory & Logic", "text": "Let A = {1, 2, 3} and B = {3, 4}. Find A ∪ B, A ∩ B, and A - B.", "type": "Problem", "marks": 3 },
                        { "questionId": "it305_2021_1b", "year": 2021, "qNumber": "Q1b", "chapter": "Module 1: Set Theory & Logic", "text": "What is a tautology? Check if (p ∨ q) → p is a tautology.", "type": "Definition & Problem", "marks": 4 },
                        { "questionId": "it305_2022_2a", "year": 2022, "qNumber": "Q2a", "chapter": "Module 1: Set Theory & Logic", "text": "Prove using mathematical induction that 1 + 2 + ... + n = n(n+1)/2 for all n ≥ 1.", "type": "Proof", "marks": 7 },
                        { "questionId": "it305_2022_3a", "year": 2022, "qNumber": "Q3a", "chapter": "Module 2: Relations & Functions", "text": "Define an equivalence relation. Give an example.", "type": "Definition & Example", "marks": 5 },
                        { "questionId": "it305_2020_4a", "year": 2020, "qNumber": "Q4a", "chapter": "Module 3: Combinatorics", "text": "In how many ways can a committee of 3 people be chosen from a group of 7 people?", "type": "Problem", "marks": 4 },
                        { "questionId": "it305_2020_4b", "year": 2020, "qNumber": "Q4b", "chapter": "Module 3: Combinatorics", "text": "State the Pigeonhole Principle.", "type": "Definition", "marks": 3 },
                        { "questionId": "it305_2019_5a", "year": 2019, "qNumber": "Q5a", "chapter": "Module 4: Graph Theory", "text": "Define Graph, Path, and Cycle in graph theory.", "type": "Definition", "marks": 6 },
                        { "questionId": "it305_2019_5b", "year": 2019, "qNumber": "Q5b", "chapter": "Module 4: Graph Theory", "text": "What is graph isomorphism? Determine if the given two graphs are isomorphic.", "type": "Definition & Problem", "marks": 8 },
                        { "questionId": "it305_2023_1c", "year": 2023, "qNumber": "Q1c", "chapter": "Module 2: Relations & Functions", "text": "Let f(x) = 2x+1 and g(x) = x^2. Find (g o f)(x).", "type": "Problem", "marks": 3 },
                        { "questionId": "it305_2023_6a", "year": 2023, "qNumber": "Q6a", "chapter": "Module 5: Algebraic Structures", "text": "Define Group, Ring, and Field in abstract algebra.", "type": "Definition", "marks": 6 },
                        { "questionId": "it305_2021_7a", "year": 2021, "qNumber": "Q7a", "chapter": "Module 4: Graph Theory", "text": "Define Euler path and Euler circuit. State the conditions for their existence in a graph.", "type": "Definition", "marks": 7 },
                        { "questionId": "it305_2022_8a", "year": 2022, "qNumber": "Q8a", "chapter": "Module 3: Combinatorics", "text": "Solve the recurrence relation a_n = 3a_{n-1} with initial condition a_0 = 2.", "type": "Problem", "marks": 6 }
                     ]
                  },
                  {
                     "id": "it306",
                     "name": "Technical Writing",
                     "code": "100314",
                     "modules": [
                        { "id": "m1", "name": "Module 1: Basics of Technical Communication" },
                        { "id": "m2", "name": "Module 2: Technical Reports & Proposals" },
                        { "id": "m3", "name": "Module 3: Documentation & Manuals" },
                        { "id": "m4", "name": "Module 4: Professional Correspondence & Presentations" }
                     ],
                     "questions": [
                        { "questionId": "it306_2022_1a", "year": 2022, "qNumber": "Q1a", "chapter": "Module 1: Basics of Technical Communication", "text": "What are the key characteristics of effective technical writing? (e.g., Clarity, Accuracy, Conciseness)", "type": "List & Explain", "marks": 7 },
                        { "questionId": "it306_2021_2a", "year": 2021, "qNumber": "Q2a", "chapter": "Module 2: Technical Reports & Proposals", "text": "Describe the typical structure of a formal technical report (e.g., Title Page, Abstract, Introduction, Body, Conclusion, References, Appendices).", "type": "Explanation", "marks": 10 },
                        { "questionId": "it306_2023_3a", "year": 2023, "qNumber": "Q3a", "chapter": "Module 4: Professional Correspondence & Presentations", "text": "Explain the importance of audience analysis in technical communication.", "type": "Explanation", "marks": 6 },
                        { "questionId": "it306_2020_4a", "year": 2020, "qNumber": "Q4a", "chapter": "Module 4: Professional Correspondence & Presentations", "text": "Write a formal email requesting information about a summer internship program.", "type": "Writing Task", "marks": 8 },
                        { "questionId": "it306_2022_5a", "year": 2022, "qNumber": "Q5a", "chapter": "Module 3: Documentation & Manuals", "text": "What is the purpose of user documentation or a user manual?", "type": "Explanation", "marks": 5 },
                        { "questionId": "it306_2021_6a", "year": 2021, "qNumber": "Q6a", "chapter": "Module 4: Professional Correspondence & Presentations", "text": "List the key elements of an effective oral presentation.", "type": "List", "marks": 7 }
                     ]
                  }
               ]
            },
            { // Sem 4 (Original Data Preserved)
               id: 'it_sem4', number: 4, subjects: [
                  {
                     id: 'it401', name: 'Web Technologies', code: 'IT401',
                     modules: [{ id: 'm1', name: 'Module 1: HTML & CSS' }, { id: 'm2', name: 'Module 2: JavaScript Basics & DOM' }, { id: 'm3', name: 'Module 3: Server-Side Scripting (e.g., PHP)' }, { id: 'm4', name: 'Module 4: Database Connectivity & Sessions' }, { id: 'm5', name: 'Module 5: XML & AJAX' },],
                     questions: [ /* Your detailed questions are kept */
                        { questionId: 'it401_2023_1a', year: 2023, qNumber: 'Q1a', chapter: 'Module 1: HTML & CSS', text: 'Which HTML tag is used to create a hyperlink?\n\n* (i) `<link>`\n* (ii) `<a>`\n* (iii) `<hlink>`\n* (iv) `<url>`', type: 'MCQ', marks: 2 }, { questionId: 'it401_2023_1b', year: 2023, qNumber: 'Q1b', chapter: 'Module 1: HTML & CSS', text: 'Which CSS property is used to change the text color of an element?\n\n* (i) `font-color`\n* (ii) `text-color`\n* (iii) `color`\n* (iv) `font-style`', type: 'MCQ', marks: 2 }, { questionId: 'it401_2022_2a', year: 2022, qNumber: 'Q2a', chapter: 'Module 1: HTML & CSS', text: 'Explain the difference between `<div>` and `<span>` tags in HTML.', type: 'Explanation', marks: 5 }, { questionId: 'it401_2022_2b', year: 2022, qNumber: 'Q2b', chapter: 'Module 1: HTML & CSS', text: 'What are the different ways to include CSS in an HTML document? Explain with examples.', type: 'Explanation with Example', marks: 7 }, { questionId: 'it401_2023_3a', year: 2023, qNumber: 'Q3a', chapter: 'Module 2: JavaScript Basics & DOM', text: 'What is the DOM (Document Object Model)? How can JavaScript interact with it?', type: 'Explanation', marks: 7 }, { questionId: 'it401_2022_4a', year: 2022, qNumber: 'Q4a', chapter: 'Module 2: JavaScript Basics & DOM', text: 'Write a JavaScript function to validate an email address entered in a form field.', type: 'Code', marks: 7 }, { questionId: 'it401_2023_5a', year: 2023, qNumber: 'Q5a', chapter: 'Module 3: Server-Side Scripting (e.g., PHP)', text: 'Explain the difference between client-side scripting and server-side scripting.', type: 'Explanation', marks: 7 }, { questionId: 'it401_2022_6a', year: 2022, qNumber: 'Q6a', chapter: 'Module 3: Server-Side Scripting (e.g., PHP)', text: 'Explain how variables are declared and used in PHP. Give examples of different data types.', type: 'Explanation with Example', marks: 7 }, { questionId: 'it401_2023_7a', year: 2023, qNumber: 'Q7a', chapter: 'Module 4: Database Connectivity & Sessions', text: 'What are cookies and sessions? Explain their purpose in web applications and how they differ.', type: 'Explanation', marks: 7 }, { questionId: 'it401_2022_8a', year: 2022, qNumber: 'Q8a', chapter: 'Module 5: XML & AJAX', text: 'What is AJAX? Explain its core components and how it improves user experience.', type: 'Explanation', marks: 7 }, { questionId: 'it401_2023_1c', year: 2023, qNumber: 'Q1c', chapter: 'Module 2: JavaScript Basics & DOM', text: 'Which keyword is used to declare a variable in JavaScript that cannot be reassigned?', type: 'MCQ', marks: 2, options: ['(i) var', '(ii) let', '(iii) const', '(iv) static'] }, { questionId: 'it401_2021_9a', year: 2021, qNumber: 'Q9a', chapter: 'Module 5: XML & AJAX', text: 'What is XML? List some advantages of using XML.', type: 'Explanation', marks: 5 },
                     ]
                  },
                  {
                     id: 'it402', name: 'Database Management Systems', code: 'IT402',
                     modules: [{ id: 'm1', name: 'Module 1: Introduction & ER Model' }, { id: 'm2', name: 'Module 2: Relational Model & Algebra' }, { id: 'm3', name: 'Module 3: SQL' }, { id: 'm4', name: 'Module 4: Database Design & Normalization' }, { id: 'm5', name: 'Module 5: Transaction Management & Concurrency' }, { id: 'm6', name: 'Module 6: Indexing & Hashing' }],
                     questions: [ /* Your detailed questions are kept */
                        { questionId: 'it402_2023_1a', year: 2023, qNumber: 'Q1a', chapter: 'Module 1: Introduction & ER Model', text: 'What is a DBMS? List two advantages over traditional file systems.', type: 'Definition & List', marks: 4 }, { questionId: 'it402_2022_1b', year: 2022, qNumber: 'Q1b', chapter: 'Module 1: Introduction & ER Model', text: 'What is a Primary Key in a relational database?\n\n* (i) A key used for encryption\n* (ii) A unique identifier for a record in a table\n* (iii) A key that links two tables\n* (iv) A non-unique attribute', type: 'MCQ', marks: 2 }, { questionId: 'it402_2022_1c', year: 2022, qNumber: 'Q1c', chapter: 'Module 2: Relational Model & Algebra', text: 'Which relational algebra operation selects tuples that satisfy a given predicate?\n\n* (i) Projection (Π)\n* (ii) Selection (σ)\n* (iii) Union (∪)\n* (iv) Cartesian Product (×)', type: 'MCQ', marks: 2 }, { questionId: 'it402_2023_2a', year: 2023, qNumber: 'Q2a', chapter: 'Module 1: Introduction & ER Model', text: 'Explain the different components of an E-R (Entity-Relationship) Diagram with symbols.', type: 'Explanation', marks: 7 }, { questionId: 'it402_2022_3a', year: 2022, qNumber: 'Q3a', chapter: 'Module 2: Relational Model & Algebra', text: 'Explain the concepts of Super Key, Candidate Key, Primary Key, and Foreign Key with examples.', type: 'Explanation with Example', marks: 7 }, { questionId: 'it402_2023_4a', year: 2023, qNumber: 'Q4a', chapter: 'Module 3: SQL', text: 'What are DDL, DML, DCL, and TCL commands in SQL? Give one example for each.', type: 'Explanation with Example', marks: 7 }, { questionId: 'it402_2022_5a', year: 2022, qNumber: 'Q5a', chapter: 'Module 4: Database Design & Normalization', text: 'What is Normalization? Explain 1NF, 2NF, and 3NF with suitable examples.', type: 'Explanation with Example', marks: 10 }, { questionId: 'it402_2023_6a', year: 2023, qNumber: 'Q6a', chapter: 'Module 3: SQL', text: 'Consider two tables: `EMPLOYEE (EmpID, Name, DeptID)` and `DEPARTMENT (DeptID, DeptName)`. Write SQL queries for:\n(a) Find names of all employees working in the \'Sales\' department.\n(b) List all department names and the number of employees in each.', type: 'SQL Query', marks: 7 }, { questionId: 'it402_2022_7a', year: 2022, qNumber: 'Q7a', chapter: 'Module 5: Transaction Management & Concurrency', text: 'What are ACID properties in the context of database transactions? Explain each property briefly.', type: 'Explanation', marks: 7 }, { questionId: 'it402_2023_8a', year: 2023, qNumber: 'Q8a', chapter: 'Module 5: Transaction Management & Concurrency', text: 'Explain the concept of concurrency control in DBMS. Why is it needed?', type: 'Explanation', marks: 7 }, { questionId: 'it402_2021_1d', year: 2021, qNumber: 'Q1d', chapter: 'Module 4: Database Design & Normalization', text: 'BCNF stands for:\n\n* (i) Binary Coded Normal Form\n* (ii) Boyce-Codd Normal Form\n* (iii) Basic Conceptual Normal Form\n* (iv) Balanced Clustered Normal Form', type: 'MCQ', marks: 2 }, { questionId: 'it402_2021_9b', year: 2021, qNumber: 'Q9b', chapter: 'Module 6: Indexing & Hashing', text: 'What is indexing in DBMS? Explain the difference between clustered and non-clustered indexes.', type: 'Explanation', marks: 7 },
                     ]
                  },
                  { id: 'it403', name: 'Computer Organization & Architecture', code: 'IT403', modules: [], questions: [] },
                  { id: 'it404', name: 'Discrete Mathematics', code: 'IT404', modules: [], questions: [] },
                  { id: 'it405', name: 'Biology for Engineers', code: 'BS401', modules: [], questions: [] }
               ]
            },
            { // Sem 5
               id: 'it_sem5', number: 5, subjects: [
                  { id: 'it501', name: 'Operating Systems', code: 'IT501', modules: [], questions: [createPlaceholderQuestion('it501', 'Operating Systems', 5)] },
                  { id: 'it502', name: 'Computer Networks', code: 'IT502', modules: [], questions: [] },
                  { id: 'it503', name: 'Formal Language & Automata Theory', code: 'IT503', modules: [], questions: [] },
                  { id: 'it504', name: 'Software Engineering', code: 'IT504', modules: [], questions: [] },
                  { id: 'it505', name: 'Microprocessor & Interfacing', code: 'EC501', modules: [], questions: [] },
                  { id: 'it506', name: 'Professional Ethics', code: 'HS501', modules: [], questions: [] },
               ]
            },
            { // Sem 6
               id: 'it_sem6', number: 6, subjects: [
                  { id: 'it601', name: 'Compiler Design', code: 'IT601', modules: [], questions: [createPlaceholderQuestion('it601', 'Compiler Design', 6)] },
                  { id: 'it602', name: 'Artificial Intelligence', code: 'IT602', modules: [], questions: [] },
                  { id: 'it603', name: 'Cloud Computing', code: 'IT603', modules: [], questions: [] },
                  { id: 'it604', name: 'Cryptography & Network Security', code: 'IT604', modules: [], questions: [] },
                  { id: 'it605', name: 'Professional Elective I (e.g., Data Mining)', code: 'ITPE601', modules: [], questions: [] },
                  { id: 'it606', name: 'Minor Project / Seminar', code: 'ITPW601', modules: [], questions: [] },
               ]
            },
            { // Sem 7
               id: 'it_sem7', number: 7, subjects: [
                  { id: 'it701', name: 'Big Data Analytics', code: 'IT701', modules: [], questions: [createPlaceholderQuestion('it701', 'Big Data Analytics', 7)] },
                  { id: 'it702', name: 'Internet of Things (IoT)', code: 'IT702', modules: [], questions: [] },
                  { id: 'it703', name: 'Professional Elective II (e.g., ML)', code: 'ITPE701', modules: [], questions: [] },
                  { id: 'it704', name: 'Professional Elective III (e.g., Image Proc.)', code: 'ITPE702', modules: [], questions: [] },
                  { id: 'it705', name: 'Open Elective I', code: 'ITOE701', modules: [], questions: [] },
                  { id: 'it706', name: 'Project Phase I', code: 'ITPW701', modules: [], questions: [] },
               ]
            },
            { // Sem 8
               id: 'it_sem8', number: 8, subjects: [
                  { id: 'it801', name: 'Professional Elective IV (e.g., Deep Learning)', code: 'ITPE801', modules: [], questions: [createPlaceholderQuestion('it801', 'Professional Elective IV (e.g., Deep Learning)', 8)] },
                  { id: 'it802', name: 'Open Elective II', code: 'ITOE801', modules: [], questions: [] },
                  { id: 'it803', name: 'Project Phase II / Internship', code: 'ITPW801', modules: [], questions: [] },
                  { id: 'it804', name: 'Grand Viva', code: 'ITVV801', modules: [], questions: [] },
               ]
            },
         ]
      },

      // --- Computer Science & Engineering (CSE - 105) ---
      {
         id: 'cse',
         name: 'COMPUTER SCIENCE & ENGINEERING',
         icon: { set: 'MaterialCommunityIcons', name: 'desktop-classic' },
         semesters: [
            { // Sem 1
               id: `cse_sem1`, number: 1, subjects: [
                  { id: `cse101`, name: 'Mathematics I', code: 'BS101', modules: [], questions: [createPlaceholderQuestion('cse101', 'Mathematics I', 1)] },
                  { id: `cse102`, name: 'Physics I', code: 'BS102', modules: [], questions: [] }, { id: `cse103`, name: 'Chemistry', code: 'BS103', modules: [], questions: [] }, { id: `cse104`, name: 'Basic Electrical Engineering', code: 'ES101', modules: [], questions: [] }, { id: `cse105`, name: 'Engineering Workshop', code: 'ES102', modules: [], questions: [] }, { id: `cse106`, name: 'Communicative English', code: 'HS101', modules: [], questions: [] },
               ]
            },
            { // Sem 2
               id: `cse_sem2`, number: 2, subjects: [
                  { id: `cse201`, name: 'Mathematics II', code: 'BS201', modules: [], questions: [createPlaceholderQuestion('cse201', 'Mathematics II', 2)] },
                  { id: `cse202`, name: 'Physics II (Waves & Optics)', code: 'BS202', modules: [], questions: [] }, { id: `cse203`, name: 'Programming for Problem Solving (C)', code: 'ES201', modules: [], questions: [] }, { id: `cse204`, name: 'Basic Electronics Engineering', code: 'ES202', modules: [], questions: [] }, { id: `cse205`, name: 'Engineering Graphics & Design', code: 'ES203', modules: [], questions: [] }, { id: `cse206`, name: 'Environmental Science', code: 'MC201', modules: [], questions: [] },
               ]
            },
            { // Sem 3 (Original Data Preserved)
               id: 'cse_sem3', number: 3, subjects: [
                  {
                     id: 'cs301', name: 'Discrete Mathematics', code: 'CS301',
                     modules: [{ id: 'm1', name: 'Module 1: Set Theory' }, { id: 'm2', name: 'Module 2: Logic' }, { id: 'm3', name: 'Module 3: Relations & Functions' }, { id: 'm4', name: 'Module 4: Graph Theory' }, { id: 'm5', name: 'Module 5: Algebraic Structures' }],
                     questions: [ /* Your detailed questions are kept */
                        { questionId: 'cs301_2022_1a', year: 2022, qNumber: 'Q1a', chapter: 'Module 1: Set Theory', text: 'Define Power Set. If A = {a, b}, what is P(A)?', type: 'Definition & Problem', marks: 4 }, { questionId: 'cs301_2023_2b', year: 2023, qNumber: 'Q2b', chapter: 'Module 2: Logic', text: 'Construct the truth table for the proposition (p → q) ∧ (q → p).', type: 'Problem', marks: 5 },
                     ]
                  },
                  {
                     id: 'cs302', name: 'Digital Logic Design', code: 'CS302',
                     modules: [{ id: 'm1', name: 'Module 1: Number Systems & Codes' }, { id: 'm2', name: 'Module 2: Boolean Algebra & Logic Gates' }, { id: 'm3', name: 'Module 3: Combinational Logic Circuits' }, { id: 'm4', name: 'Module 4: Sequential Logic Circuits' }, { id: 'm5', name: 'Module 5: Memory & Programmable Logic' }],
                     questions: [ /* Your detailed questions are kept */
                        { questionId: 'cs302_2022_1b', year: 2022, qNumber: 'Q1b', chapter: 'Module 1: Number Systems', text: 'Convert the binary number 11010.11 to decimal.', type: 'Problem', marks: 3 }, { questionId: 'cs302_2023_3a', year: 2023, qNumber: 'Q3a', chapter: 'Module 3: Combinational Logic', text: 'Design a Full Adder circuit using basic logic gates.', type: 'Design', marks: 7 },
                     ]
                  },
                  { id: 'cse303', name: 'Data Structures & Algorithms', code: 'CS303', modules: [], questions: [] },
                  { id: 'cse304', name: 'Object Oriented Programming (Java/C++)', code: 'CS304', modules: [], questions: [] },
                  { id: 'cse305', name: 'Mathematics III (Prob & Stats)', code: 'BS301', modules: [], questions: [] },
               ]
            },
            { // Sem 4
               id: 'cse_sem4', number: 4, subjects: [
                  { id: 'cse401', name: 'Computer Organization & Architecture', code: 'CS401', modules: [], questions: [createPlaceholderQuestion('cse401', 'Computer Organization & Architecture', 4)] },
                  { id: 'cse402', name: 'Design & Analysis of Algorithms', code: 'CS402', modules: [], questions: [] },
                  { id: 'cse403', name: 'Operating Systems', code: 'CS403', modules: [], questions: [] },
                  { id: 'cse404', name: 'Database Management Systems', code: 'CS404', modules: [], questions: [] },
                  { id: 'cse405', name: 'Biology for Engineers', code: 'BS401', modules: [], questions: [] },
               ]
            },
            { // Sem 5
               id: 'cse_sem5', number: 5, subjects: [
                  { id: 'cse501', name: 'Computer Networks', code: 'CS501', modules: [], questions: [createPlaceholderQuestion('cse501', 'Computer Networks', 5)] },
                  { id: 'cse502', name: 'Formal Language & Automata Theory', code: 'CS502', modules: [], questions: [] },
                  { id: 'cse503', name: 'Software Engineering', code: 'CS503', modules: [], questions: [] },
                  { id: 'cse504', name: 'Professional Elective I (e.g., Advanced Algo)', code: 'CSPE501', modules: [], questions: [] },
                  { id: 'cse505', name: 'Open Elective I', code: 'CSOE501', modules: [], questions: [] },
               ]
            },
            { // Sem 6
               id: 'cse_sem6', number: 6, subjects: [
                  { id: 'cse601', name: 'Compiler Design', code: 'CS601', modules: [], questions: [createPlaceholderQuestion('cse601', 'Compiler Design', 6)] },
                  { id: 'cse602', name: 'Artificial Intelligence', code: 'CS602', modules: [], questions: [] },
                  { id: 'cse603', name: 'Cryptography & Network Security', code: 'CS603', modules: [], questions: [] },
                  { id: 'cse604', name: 'Professional Elective II (e.g., ML)', code: 'CSPE601', modules: [], questions: [] },
                  { id: 'cse605', name: 'Minor Project / Seminar', code: 'CSPW601', modules: [], questions: [] },
               ]
            },
            { // Sem 7
               id: 'cse_sem7', number: 7, subjects: [
                  { id: 'cse701', name: 'Cloud Computing', code: 'CS701', modules: [], questions: [createPlaceholderQuestion('cse701', 'Cloud Computing', 7)] },
                  { id: 'cse702', name: 'Professional Elective III (e.g., Big Data)', code: 'CSPE701', modules: [], questions: [] },
                  { id: 'cse703', name: 'Professional Elective IV (e.g., Image Proc.)', code: 'CSPE702', modules: [], questions: [] },
                  { id: 'cse704', name: 'Open Elective II', code: 'CSOE701', modules: [], questions: [] },
                  { id: 'cse705', name: 'Project Phase I', code: 'CSPW701', modules: [], questions: [] },
               ]
            },
            { // Sem 8
               id: 'cse_sem8', number: 8, subjects: [
                  { id: 'cse801', name: 'Professional Elective V (e.g., Deep Learning)', code: 'CSPE801', modules: [], questions: [createPlaceholderQuestion('cse801', 'Professional Elective V (e.g., Deep Learning)', 8)] },
                  { id: 'cse802', name: 'Open Elective III', code: 'CSOE801', modules: [], questions: [] },
                  { id: 'cse803', name: 'Project Phase II / Internship', code: 'CSPW801', modules: [], questions: [] },
                  { id: 'cse804', name: 'Grand Viva', code: 'CSVV801', modules: [], questions: [] },
               ]
            },
         ]
      },

      // --- Electronics & Communication Engineering (ECE - 104) ---
      {
         id: 'ece',
         name: 'ELECTRONICS & COMMUNICATION ENGINEERING',
         icon: { set: 'MaterialCommunityIcons', name: 'integrated-circuit-chip' },
         semesters: [
            { // Sem 1
               id: `ece_sem1`, number: 1, subjects: [
                  { id: `ece101`, name: 'Mathematics I', code: 'BS101', modules: [], questions: [createPlaceholderQuestion('ece101', 'Mathematics I', 1)] },
                  { id: `ece102`, name: 'Physics I', code: 'BS102', modules: [], questions: [] }, { id: `ece103`, name: 'Chemistry', code: 'BS103', modules: [], questions: [] }, { id: `ece104`, name: 'Basic Electrical Engineering', code: 'ES101', modules: [], questions: [] }, { id: `ece105`, name: 'Engineering Workshop', code: 'ES102', modules: [], questions: [] }, { id: `ece106`, name: 'Communicative English', code: 'HS101', modules: [], questions: [] },
               ]
            },
            { // Sem 2
               id: `ece_sem2`, number: 2, subjects: [
                  { id: `ece201`, name: 'Mathematics II', code: 'BS201', modules: [], questions: [createPlaceholderQuestion('ece201', 'Mathematics II', 2)] },
                  { id: `ece202`, name: 'Physics II (Waves & Optics)', code: 'BS202', modules: [], questions: [] }, { id: `ece203`, name: 'Programming for Problem Solving (C)', code: 'ES201', modules: [], questions: [] }, { id: `ece204`, name: 'Basic Electronics Engineering', code: 'ES202', modules: [], questions: [] }, { id: `ece205`, name: 'Engineering Graphics & Design', code: 'ES203', modules: [], questions: [] }, { id: `ece206`, name: 'Environmental Science', code: 'MC201', modules: [], questions: [] },
               ]
            },
            { // Sem 3 (Original Data Preserved)
               id: 'ece_sem3', number: 3, subjects: [
                  {
                     id: 'ec301', name: 'Network Theory', code: 'EC301',
                     modules: [{ id: 'm1', name: 'Module 1: Basic Circuit Concepts & Laws' }, { id: 'm2', name: 'Module 2: Network Theorems' }, { id: 'm3', name: 'Module 3: Transient Analysis' }, { id: 'm4', name: 'Module 4: Two Port Networks' }, { id: 'm5', name: 'Module 5: Network Synthesis' }],
                     questions: [ /* Your detailed questions are kept */
                        { questionId: 'ec301_2022_1a', year: 2022, qNumber: 'Q1a', chapter: 'Module 1: Basic Circuit Concepts', text: 'State Kirchhoff\'s Current Law (KCL) and Kirchhoff\'s Voltage Law (KVL).', type: 'Definition', marks: 4 },
                     ]
                  },
                  {
                     id: 'ec302', name: 'Analog Electronics I', code: 'EC302',
                     modules: [{ id: 'm1', name: 'Module 1: Semiconductor Physics' }, { id: 'm2', name: 'Module 2: Diodes & Applications' }, { id: 'm3', name: 'Module 3: Bipolar Junction Transistors (BJT)' }, { id: 'm4', name: 'Module 4: BJT Biasing & Amplifiers' }, { id: 'm5', name: 'Module 5: Field Effect Transistors (FET)' }],
                     questions: [ /* Your detailed questions are kept */
                        { questionId: 'ec302_2023_2a', year: 2023, qNumber: 'Q2a', chapter: 'Module 2: Diodes', text: 'Explain the working principle of a P-N junction diode under forward and reverse bias conditions.', type: 'Explanation', marks: 7 },
                     ]
                  },
                  { id: 'ece303', name: 'Digital Electronics', code: 'EC303', modules: [], questions: [] },
                  { id: 'ece304', name: 'Signals & Systems', code: 'EC304', modules: [], questions: [] },
                  { id: 'ece305', name: 'Mathematics III (Transforms & DEs)', code: 'BS302', modules: [], questions: [] },
               ]
            },
            { // Sem 4
               id: 'ece_sem4', number: 4, subjects: [
                  { id: 'ece401', name: 'Analog Electronics II', code: 'EC401', modules: [], questions: [createPlaceholderQuestion('ece401', 'Analog Electronics II', 4)] },
                  { id: 'ece402', name: 'Electromagnetic Theory', code: 'EC402', modules: [], questions: [] },
                  { id: 'ece403', name: 'Microprocessors & Microcontrollers', code: 'EC403', modules: [], questions: [] },
                  { id: 'ece404', name: 'Communication Systems I', code: 'EC404', modules: [], questions: [] },
                  { id: 'ece405', name: 'Control Systems', code: 'EE405', modules: [], questions: [] },
               ]
            },
            { // Sem 5
               id: 'ece_sem5', number: 5, subjects: [
                  { id: 'ece501', name: 'Communication Systems II', code: 'EC501', modules: [], questions: [createPlaceholderQuestion('ece501', 'Communication Systems II', 5)] },
                  { id: 'ece502', name: 'Digital Signal Processing', code: 'EC502', modules: [], questions: [] },
                  { id: 'ece503', name: 'Computer Architecture', code: 'CS401', modules: [], questions: [] }, // Example cross-dept
                  { id: 'ece504', name: 'Professional Elective I (e.g., VLSI Design)', code: 'ECPE501', modules: [], questions: [] },
                  { id: 'ece505', name: 'Open Elective I', code: 'ECOE501', modules: [], questions: [] },
               ]
            },
            { // Sem 6
               id: 'ece_sem6', number: 6, subjects: [
                  { id: 'ece601', name: 'Microwave Engineering', code: 'EC601', modules: [], questions: [createPlaceholderQuestion('ece601', 'Microwave Engineering', 6)] },
                  { id: 'ece602', name: 'Information Theory & Coding', code: 'EC602', modules: [], questions: [] },
                  { id: 'ece603', name: 'Antennas & Wave Propagation', code: 'EC603', modules: [], questions: [] },
                  { id: 'ece604', name: 'Professional Elective II (e.g., Embedded Systems)', code: 'ECPE601', modules: [], questions: [] },
                  { id: 'ece605', name: 'Minor Project / Seminar', code: 'ECPW601', modules: [], questions: [] },
               ]
            },
            { // Sem 7
               id: 'ece_sem7', number: 7, subjects: [
                  { id: 'ece701', name: 'Optical Communication', code: 'EC701', modules: [], questions: [createPlaceholderQuestion('ece701', 'Optical Communication', 7)] },
                  { id: 'ece702', name: 'Wireless Communication', code: 'EC702', modules: [], questions: [] },
                  { id: 'ece703', name: 'Professional Elective III (e.g., Satellite Comm)', code: 'ECPE701', modules: [], questions: [] },
                  { id: 'ece704', name: 'Professional Elective IV (e.g., RADAR)', code: 'ECPE702', modules: [], questions: [] },
                  { id: 'ece705', name: 'Open Elective II', code: 'ECOE701', modules: [], questions: [] },
                  { id: 'ece706', name: 'Project Phase I', code: 'ECPW701', modules: [], questions: [] },
               ]
            },
            { // Sem 8
               id: 'ece_sem8', number: 8, subjects: [
                  { id: 'ece801', name: 'Professional Elective V (e.g., Adv. DSP)', code: 'ECPE801', modules: [], questions: [createPlaceholderQuestion('ece801', 'Professional Elective V (e.g., Adv. DSP)', 8)] },
                  { id: 'ece802', name: 'Open Elective III', code: 'ECOE801', modules: [], questions: [] },
                  { id: 'ece803', name: 'Project Phase II / Internship', code: 'ECPW801', modules: [], questions: [] },
                  { id: 'ece804', name: 'Grand Viva', code: 'ECVV801', modules: [], questions: [] },
               ]
            },
         ]
      },

      // --- Civil Engineering (CE - 101) ---
      {
         id: 'civil',
         name: 'CIVIL ENGINEERING',
         icon: { set: 'MaterialCommunityIcons', name: 'office-building-outline' },
         semesters: [
            { // Sem 1
               id: 'ce_sem1', number: 1, subjects: [
                  { id: 'ce101', name: 'Mathematics I', code: 'BS101', modules: [], questions: [createPlaceholderQuestion('ce101', 'Mathematics I', 1)] },
                  { id: 'ce102', name: 'Physics I', code: 'BS102', modules: [], questions: [] }, { id: 'ce103', name: 'Chemistry', code: 'BS103', modules: [], questions: [] }, { id: 'ce104', name: 'Basic Electrical Engineering', code: 'ES101', modules: [], questions: [] }, { id: 'ce105', name: 'Engineering Workshop', code: 'ES102', modules: [], questions: [] }, { id: 'ce106', name: 'Communicative English', code: 'HS101', modules: [], questions: [] },
               ]
            },
            { // Sem 2
               id: 'ce_sem2', number: 2, subjects: [
                  { id: 'ce201', name: 'Mathematics II', code: 'BS201', modules: [], questions: [createPlaceholderQuestion('ce201', 'Mathematics II', 2)] },
                  { id: 'ce202', name: 'Physics II', code: 'BS202', modules: [], questions: [] }, { id: 'ce203', name: 'Programming for Problem Solving (C)', code: 'ES201', modules: [], questions: [] }, { id: 'ce204', name: 'Basic Electronics Engineering', code: 'ES202', modules: [], questions: [] }, { id: 'ce205', name: 'Engineering Graphics & Design', code: 'ES203', modules: [], questions: [] }, { id: 'ce206', name: 'Environmental Science', code: 'MC201', modules: [], questions: [] },
               ]
            },
            { // Sem 3
               id: 'ce_sem3', number: 3, subjects: [
                  { id: 'ce301', name: 'Surveying I', code: 'CE301', modules: [], questions: [createPlaceholderQuestion('ce301', 'Surveying I', 3)] },
                  { id: 'ce302', name: 'Mechanics of Solids', code: 'CE302', modules: [], questions: [] },
                  { id: 'ce303', name: 'Fluid Mechanics I', code: 'CE303', modules: [], questions: [] },
                  { id: 'ce304', name: 'Building Materials & Construction', code: 'CE304', modules: [], questions: [] },
                  { id: 'ce305', name: 'Mathematics III (Transforms & DEs)', code: 'BS302', modules: [], questions: [] },
               ]
            },
            { // Sem 4
               id: 'ce_sem4', number: 4, subjects: [
                  { id: 'ce401', name: 'Surveying II', code: 'CE401', modules: [], questions: [createPlaceholderQuestion('ce401', 'Surveying II', 4)] },
                  { id: 'ce402', name: 'Structural Analysis I', code: 'CE402', modules: [], questions: [] },
                  { id: 'ce403', name: 'Fluid Mechanics II', code: 'CE403', modules: [], questions: [] },
                  { id: 'ce404', name: 'Geotechnical Engineering I', code: 'CE404', modules: [], questions: [] },
                  { id: 'ce405', name: 'Environmental Engineering I', code: 'CE405', modules: [], questions: [] },
               ]
            },
            { // Sem 5
               id: 'ce_sem5', number: 5, subjects: [
                  { id: 'ce501', name: 'Structural Analysis II', code: 'CE501', modules: [], questions: [createPlaceholderQuestion('ce501', 'Structural Analysis II', 5)] },
                  { id: 'ce502', name: 'Geotechnical Engineering II', code: 'CE502', modules: [], questions: [] },
                  { id: 'ce503', name: 'Transportation Engineering I', code: 'CE503', modules: [], questions: [] },
                  { id: 'ce504', name: 'Water Resources Engineering I', code: 'CE504', modules: [], questions: [] },
                  { id: 'ce505', name: 'Professional Elective I (e.g., Adv. Survey)', code: 'CEPE501', modules: [], questions: [] },
               ]
            },
            { // Sem 6
               id: 'ce_sem6', number: 6, subjects: [
                  { id: 'ce601', name: 'Design of Concrete Structures I', code: 'CE601', modules: [], questions: [createPlaceholderQuestion('ce601', 'Design of Concrete Structures I', 6)] },
                  { id: 'ce602', name: 'Design of Steel Structures I', code: 'CE602', modules: [], questions: [] },
                  { id: 'ce603', name: 'Transportation Engineering II', code: 'CE603', modules: [], questions: [] },
                  { id: 'ce604', name: 'Environmental Engineering II', code: 'CE604', modules: [], questions: [] },
                  { id: 'ce605', name: 'Professional Elective II (e.g., Foundation Engg)', code: 'CEPE601', modules: [], questions: [] },
                  { id: 'ce606', name: 'Minor Project / Seminar', code: 'CEPW601', modules: [], questions: [] },
               ]
            },
            { // Sem 7
               id: 'ce_sem7', number: 7, subjects: [
                  { id: 'ce701', name: 'Design of Concrete Structures II', code: 'CE701', modules: [], questions: [createPlaceholderQuestion('ce701', 'Design of Concrete Structures II', 7)] },
                  { id: 'ce702', name: 'Water Resources Engineering II', code: 'CE702', modules: [], questions: [] },
                  { id: 'ce703', name: 'Professional Elective III (e.g., Earthquake Engg)', code: 'CEPE701', modules: [], questions: [] },
                  { id: 'ce704', name: 'Professional Elective IV (e.g., Construction Mgmt)', code: 'CEPE702', modules: [], questions: [] },
                  { id: 'ce705', name: 'Open Elective I', code: 'CEOE701', modules: [], questions: [] },
                  { id: 'ce706', name: 'Project Phase I', code: 'CEPW701', modules: [], questions: [] },
               ]
            },
            { // Sem 8
               id: 'ce_sem8', number: 8, subjects: [
                  { id: 'ce801', name: 'Professional Elective V (e.g., GIS & Remote Sensing)', code: 'CEPE801', modules: [], questions: [createPlaceholderQuestion('ce801', 'Professional Elective V (e.g., GIS & Remote Sensing)', 8)] },
                  { id: 'ce802', name: 'Open Elective II', code: 'CEOE801', modules: [], questions: [] },
                  { id: 'ce803', name: 'Project Phase II / Internship', code: 'CEPW801', modules: [], questions: [] },
                  { id: 'ce804', name: 'Grand Viva', code: 'CEVV801', modules: [], questions: [] },
               ]
            },
         ]
      },

      // --- Mechanical Engineering (ME - 102) ---
      {
         id: 'mech',
         name: 'MECHANICAL ENGINEERING',
         icon: { set: 'MaterialCommunityIcons', name: 'cog-outline' },
         semesters: [
            { // Sem 1
               id: 'me_sem1', number: 1, subjects: [
                  { id: 'me101', name: 'Mathematics I', code: 'BS101', modules: [], questions: [createPlaceholderQuestion('me101', 'Mathematics I', 1)] },
                  { id: 'me102', name: 'Physics I', code: 'BS102', modules: [], questions: [] }, { id: 'me103', name: 'Chemistry', code: 'BS103', modules: [], questions: [] }, { id: 'me104', name: 'Basic Electrical Engineering', code: 'ES101', modules: [], questions: [] }, { id: 'me105', name: 'Engineering Workshop', code: 'ES102', modules: [], questions: [] }, { id: 'me106', name: 'Communicative English', code: 'HS101', modules: [], questions: [] },
               ]
            },
            { // Sem 2
               id: 'me_sem2', number: 2, subjects: [
                  { id: 'me201', name: 'Mathematics II', code: 'BS201', modules: [], questions: [createPlaceholderQuestion('me201', 'Mathematics II', 2)] },
                  { id: 'me202', name: 'Physics II', code: 'BS202', modules: [], questions: [] }, { id: 'me203', name: 'Programming for Problem Solving (C)', code: 'ES201', modules: [], questions: [] }, { id: 'me204', name: 'Basic Electronics Engineering', code: 'ES202', modules: [], questions: [] }, { id: 'me205', name: 'Engineering Graphics & Design', code: 'ES203', modules: [], questions: [] }, { id: 'me206', name: 'Environmental Science', code: 'MC201', modules: [], questions: [] },
               ]
            },
            { // Sem 3
               id: 'me_sem3', number: 3, subjects: [
                  { id: 'me301', name: 'Engineering Thermodynamics', code: 'ME301', modules: [], questions: [createPlaceholderQuestion('me301', 'Engineering Thermodynamics', 3)] },
                  { id: 'me302', name: 'Mechanics of Solids', code: 'ME302', modules: [], questions: [] },
                  { id: 'me303', name: 'Fluid Mechanics', code: 'ME303', modules: [], questions: [] },
                  { id: 'me304', name: 'Manufacturing Processes I', code: 'ME304', modules: [], questions: [] },
                  { id: 'me305', name: 'Mathematics III (Transforms & DEs)', code: 'BS302', modules: [], questions: [] },
               ]
            },
            { // Sem 4
               id: 'me_sem4', number: 4, subjects: [
                  { id: 'me401', name: 'Applied Thermodynamics', code: 'ME401', modules: [], questions: [createPlaceholderQuestion('me401', 'Applied Thermodynamics', 4)] },
                  { id: 'me402', name: 'Theory of Machines I', code: 'ME402', modules: [], questions: [] },
                  { id: 'me403', name: 'Fluid Machinery', code: 'ME403', modules: [], questions: [] },
                  { id: 'me404', name: 'Manufacturing Processes II', code: 'ME404', modules: [], questions: [] },
                  { id: 'me405', name: 'Machine Drawing', code: 'ME405', modules: [], questions: [] },
               ]
            },
            { // Sem 5
               id: 'me_sem5', number: 5, subjects: [
                  { id: 'me501', name: 'Heat Transfer', code: 'ME501', modules: [], questions: [createPlaceholderQuestion('me501', 'Heat Transfer', 5)] },
                  { id: 'me502', name: 'Theory of Machines II', code: 'ME502', modules: [], questions: [] },
                  { id: 'me503', name: 'Machine Design I', code: 'ME503', modules: [], questions: [] },
                  { id: 'me504', name: 'Metrology & Quality Control', code: 'ME504', modules: [], questions: [] },
                  { id: 'me505', name: 'Professional Elective I (e.g., IC Engines)', code: 'MEPE501', modules: [], questions: [] },
               ]
            },
            { // Sem 6
               id: 'me_sem6', number: 6, subjects: [
                  { id: 'me601', name: 'Refrigeration & Air Conditioning', code: 'ME601', modules: [], questions: [createPlaceholderQuestion('me601', 'Refrigeration & Air Conditioning', 6)] },
                  { id: 'me602', name: 'Machine Design II', code: 'ME602', modules: [], questions: [] },
                  { id: 'me603', name: 'Industrial Engineering & Management', code: 'ME603', modules: [], questions: [] },
                  { id: 'me604', name: 'Professional Elective II (e.g., CAD/CAM)', code: 'MEPE601', modules: [], questions: [] },
                  { id: 'me605', name: 'Open Elective I', code: 'MEOE601', modules: [], questions: [] },
                  { id: 'me606', name: 'Minor Project / Seminar', code: 'MEPW601', modules: [], questions: [] },
               ]
            },
            { // Sem 7
               id: 'me_sem7', number: 7, subjects: [
                  { id: 'me701', name: 'Automobile Engineering', code: 'ME701', modules: [], questions: [createPlaceholderQuestion('me701', 'Automobile Engineering', 7)] },
                  { id: 'me702', name: 'Finite Element Methods', code: 'ME702', modules: [], questions: [] },
                  { id: 'me703', name: 'Professional Elective III (e.g., Robotics)', code: 'MEPE701', modules: [], questions: [] },
                  { id: 'me704', name: 'Professional Elective IV (e.g., Power Plant Engg)', code: 'MEPE702', modules: [], questions: [] },
                  { id: 'me705', name: 'Open Elective II', code: 'MEOE701', modules: [], questions: [] },
                  { id: 'me706', name: 'Project Phase I', code: 'MEPW701', modules: [], questions: [] },
               ]
            },
            { // Sem 8
               id: 'me_sem8', number: 8, subjects: [
                  { id: 'me801', name: 'Professional Elective V (e.g., Computational Fluid Dynamics)', code: 'MEPE801', modules: [], questions: [createPlaceholderQuestion('me801', 'Professional Elective V (e.g., CFD)', 8)] },
                  { id: 'me802', name: 'Open Elective III', code: 'MEOE801', modules: [], questions: [] },
                  { id: 'me803', name: 'Project Phase II / Internship', code: 'MEPW801', modules: [], questions: [] },
                  { id: 'me804', name: 'Grand Viva', code: 'MEVV801', modules: [], questions: [] },
               ]
            },
         ]
      },

      // --- Electrical Engineering (EEE - 103) ---
      {
         id: 'eee',
         name: 'ELECTRICAL ENGINEERING',
         icon: { set: 'Ionicons', name: 'flash-outline' },
         semesters: [
            { // Sem 1
               id: 'ee_sem1', number: 1, subjects: [
                  { id: 'ee101', name: 'Mathematics I', code: 'BS101', modules: [], questions: [createPlaceholderQuestion('ee101', 'Mathematics I', 1)] },
                  { id: 'ee102', name: 'Physics I', code: 'BS102', modules: [], questions: [] }, { id: 'ee103', name: 'Chemistry', code: 'BS103', modules: [], questions: [] }, { id: 'ee104', name: 'Basic Electrical Engineering', code: 'ES101', modules: [], questions: [] }, { id: 'ee105', name: 'Engineering Workshop', code: 'ES102', modules: [], questions: [] }, { id: 'ee106', name: 'Communicative English', code: 'HS101', modules: [], questions: [] },
               ]
            },
            { // Sem 2
               id: 'ee_sem2', number: 2, subjects: [
                  { id: 'ee201', name: 'Mathematics II', code: 'BS201', modules: [], questions: [createPlaceholderQuestion('ee201', 'Mathematics II', 2)] },
                  { id: 'ee202', name: 'Physics II', code: 'BS202', modules: [], questions: [] }, { id: 'ee203', name: 'Programming for Problem Solving (C)', code: 'ES201', modules: [], questions: [] }, { id: 'ee204', name: 'Basic Electronics Engineering', code: 'ES202', modules: [], questions: [] }, { id: 'ee205', name: 'Engineering Graphics & Design', code: 'ES203', modules: [], questions: [] }, { id: 'ee206', name: 'Environmental Science', code: 'MC201', modules: [], questions: [] },
               ]
            },
            { // Sem 3
               id: 'ee_sem3', number: 3, subjects: [
                  { id: 'ee301', name: 'Electric Circuit Theory', code: 'EE301', modules: [], questions: [createPlaceholderQuestion('ee301', 'Electric Circuit Theory', 3)] },
                  { id: 'ee302', name: 'Electrical Machines I', code: 'EE302', modules: [], questions: [] },
                  { id: 'ee303', name: 'Analog Electronics', code: 'EC302', modules: [], questions: [] },
                  { id: 'ee304', name: 'Electromagnetic Fields', code: 'EE304', modules: [], questions: [] },
                  { id: 'ee305', name: 'Mathematics III (Transforms & DEs)', code: 'BS302', modules: [], questions: [] },
               ]
            },
            { // Sem 4
               id: 'ee_sem4', number: 4, subjects: [
                  { id: 'ee401', name: 'Digital Electronics', code: 'EC303', modules: [], questions: [createPlaceholderQuestion('ee401', 'Digital Electronics', 4)] },
                  { id: 'ee402', name: 'Electrical Machines II', code: 'EE402', modules: [], questions: [] },
                  { id: 'ee403', name: 'Power Systems I', code: 'EE403', modules: [], questions: [] },
                  { id: 'ee404', name: 'Signals & Systems', code: 'EC304', modules: [], questions: [] },
                  { id: 'ee405', name: 'Electrical Measurements', code: 'EE405', modules: [], questions: [] },
               ]
            },
            { // Sem 5
               id: 'ee_sem5', number: 5, subjects: [
                  { id: 'ee501', name: 'Control Systems', code: 'EE501', modules: [], questions: [createPlaceholderQuestion('ee501', 'Control Systems', 5)] },
                  { id: 'ee502', name: 'Power Systems II', code: 'EE502', modules: [], questions: [] },
                  { id: 'ee503', name: 'Microprocessors & Microcontrollers', code: 'EC403', modules: [], questions: [] },
                  { id: 'ee504', name: 'Power Electronics', code: 'EE504', modules: [], questions: [] },
                  { id: 'ee505', name: 'Professional Elective I (e.g., EM Theory)', code: 'EEPE501', modules: [], questions: [] },
               ]
            },
            { // Sem 6
               id: 'ee_sem6', number: 6, subjects: [
                  { id: 'ee601', name: 'Electrical Machine Design', code: 'EE601', modules: [], questions: [createPlaceholderQuestion('ee601', 'Electrical Machine Design', 6)] },
                  { id: 'ee602', name: 'Digital Signal Processing', code: 'EC502', modules: [], questions: [] },
                  { id: 'ee603', name: 'Power System Protection', code: 'EE603', modules: [], questions: [] },
                  { id: 'ee604', name: 'Professional Elective II (e.g., High Voltage Engg)', code: 'EEPE601', modules: [], questions: [] },
                  { id: 'ee605', name: 'Open Elective I', code: 'EEOE601', modules: [], questions: [] },
                  { id: 'ee606', name: 'Minor Project / Seminar', code: 'EEPW601', modules: [], questions: [] },
               ]
            },
            { // Sem 7
               id: 'ee_sem7', number: 7, subjects: [
                  { id: 'ee701', name: 'Electric Drives', code: 'EE701', modules: [], questions: [createPlaceholderQuestion('ee701', 'Electric Drives', 7)] },
                  { id: 'ee702', name: 'Utilization of Electrical Energy', code: 'EE702', modules: [], questions: [] },
                  { id: 'ee703', name: 'Professional Elective III (e.g., Power Quality)', code: 'EEPE701', modules: [], questions: [] },
                  { id: 'ee704', name: 'Professional Elective IV (e.g., Renewable Energy)', code: 'EEPE702', modules: [], questions: [] },
                  { id: 'ee705', name: 'Open Elective II', code: 'EEOE701', modules: [], questions: [] },
                  { id: 'ee706', name: 'Project Phase I', code: 'EEPW701', modules: [], questions: [] },
               ]
            },
            { // Sem 8
               id: 'ee_sem8', number: 8, subjects: [
                  { id: 'ee801', name: 'Professional Elective V (e.g., Smart Grid)', code: 'EEPE801', modules: [], questions: [createPlaceholderQuestion('ee801', 'Professional Elective V (e.g., Smart Grid)', 8)] },
                  { id: 'ee802', name: 'Open Elective III', code: 'EEOE801', modules: [], questions: [] },
                  { id: 'ee803', name: 'Project Phase II / Internship', code: 'EEPW801', modules: [], questions: [] },
                  { id: 'ee804', name: 'Grand Viva', code: 'EEVV801', modules: [], questions: [] },
               ]
            },
         ]
      },

      // --- Leather Technology Engineering (LT - 107) ---
      {
         id: 'leather',
         name: 'LEATHER TECHNOLOGY ENGINEERING',
         icon: { set: 'MaterialCommunityIcons', name: 'factory' },
         semesters: [
            { // Sem 1
               id: 'lt_sem1', number: 1, subjects: [
                  { id: 'lt101', name: 'Mathematics I', code: 'BS101', modules: [], questions: [createPlaceholderQuestion('lt101', 'Mathematics I', 1)] },
                  { id: 'lt102', name: 'Physics I', code: 'BS102', modules: [], questions: [] }, { id: 'lt103', name: 'Chemistry', code: 'BS103', modules: [], questions: [] }, { id: 'lt104', name: 'Basic Electrical Engineering', code: 'ES101', modules: [], questions: [] }, { id: 'lt105', name: 'Engineering Workshop', code: 'ES102', modules: [], questions: [] }, { id: 'lt106', name: 'Communicative English', code: 'HS101', modules: [], questions: [] },
               ]
            },
            { // Sem 2
               id: 'lt_sem2', number: 2, subjects: [
                  { id: 'lt201', name: 'Mathematics II', code: 'BS201', modules: [], questions: [createPlaceholderQuestion('lt201', 'Mathematics II', 2)] },
                  { id: 'lt202', name: 'Physics II', code: 'BS202', modules: [], questions: [] }, { id: 'lt203', name: 'Programming for Problem Solving (C)', code: 'ES201', modules: [], questions: [] }, { id: 'lt204', name: 'Basic Electronics Engineering', code: 'ES202', modules: [], questions: [] }, { id: 'lt205', name: 'Engineering Graphics & Design', code: 'ES203', modules: [], questions: [] }, { id: 'lt206', name: 'Environmental Science', code: 'MC201', modules: [], questions: [] },
               ]
            },
            { // Sem 3
               id: 'lt_sem3', number: 3, subjects: [
                  { id: 'lt301', name: 'Chemistry of Proteins & Collagen', code: 'LT301', modules: [], questions: [createPlaceholderQuestion('lt301', 'Chemistry of Proteins & Collagen', 3)] },
                  { id: 'lt302', name: 'Biochemistry of Hides & Skins', code: 'LT302', modules: [], questions: [] },
                  { id: 'lt303', name: 'Unit Operations in Leather Manufacture I', code: 'LT303', modules: [], questions: [] },
                  { id: 'lt304', name: 'Microbiology for Leather Technologists', code: 'LT304', modules: [], questions: [] },
                  { id: 'lt305', name: 'Organic Chemistry', code: 'CH305', modules: [], questions: [] },
               ]
            },
            { // Sem 4
               id: 'lt_sem4', number: 4, subjects: [
                  { id: 'lt401', name: 'Chemistry of Tanning Agents', code: 'LT401', modules: [], questions: [createPlaceholderQuestion('lt401', 'Chemistry of Tanning Agents', 4)] },
                  { id: 'lt402', name: 'Pre-Tanning Operations', code: 'LT402', modules: [], questions: [] },
                  { id: 'lt403', name: 'Tanning Processes', code: 'LT403', modules: [], questions: [] },
                  { id: 'lt404', name: 'Unit Operations in Leather Manufacture II', code: 'LT404', modules: [], questions: [] },
                  { id: 'lt405', name: 'Polymer Science', code: 'CH405', modules: [], questions: [] },
               ]
            },
            { // Sem 5
               id: 'lt_sem5', number: 5, subjects: [
                  { id: 'lt501', name: 'Post Tanning Operations', code: 'LT501', modules: [], questions: [createPlaceholderQuestion('lt501', 'Post Tanning Operations', 5)] },
                  { id: 'lt502', name: 'Chemistry of Dyes & Auxiliaries', code: 'LT502', modules: [], questions: [] },
                  { id: 'lt503', name: 'Leather Finishing', code: 'LT503', modules: [], questions: [] },
                  { id: 'lt504', name: 'Leather Goods & Garment Technology I', code: 'LT504', modules: [], questions: [] },
                  { id: 'lt505', name: 'Professional Elective I (e.g., Footwear Tech)', code: 'LTPE501', modules: [], questions: [] },
               ]
            },
            { // Sem 6
               id: 'lt_sem6', number: 6, subjects: [
                  { id: 'lt601', name: 'Analysis & Testing of Leather', code: 'LT601', modules: [], questions: [createPlaceholderQuestion('lt601', 'Analysis & Testing of Leather', 6)] },
                  { id: 'lt602', name: 'Leather Trade & Economics', code: 'LT602', modules: [], questions: [] },
                  { id: 'lt603', name: 'Environmental Management in Tanneries', code: 'LT603', modules: [], questions: [] },
                  { id: 'lt604', name: 'Professional Elective II (e.g., Leather Product Design)', code: 'LTPE601', modules: [], questions: [] },
                  { id: 'lt605', name: 'Open Elective I', code: 'LTOE601', modules: [], questions: [] },
                  { id: 'lt606', name: 'Minor Project / Seminar', code: 'LTPW601', modules: [], questions: [] },
               ]
            },
            { // Sem 7
               id: 'lt_sem7', number: 7, subjects: [
                  { id: 'lt701', name: 'Leather Goods & Garment Technology II', code: 'LT701', modules: [], questions: [createPlaceholderQuestion('lt701', 'Leather Goods & Garment Technology II', 7)] },
                  { id: 'lt702', name: 'Quality Control in Leather Industry', code: 'LT702', modules: [], questions: [] },
                  { id: 'lt703', name: 'Professional Elective III (e.g., Adv. Finishing)', code: 'LTPE701', modules: [], questions: [] },
                  { id: 'lt704', name: 'Professional Elective IV (e.g., Tannery Waste Mgmt)', code: 'LTPE702', modules: [], questions: [] },
                  { id: 'lt705', name: 'Open Elective II', code: 'LTOE701', modules: [], questions: [] },
                  { id: 'lt706', name: 'Project Phase I', code: 'LTPW701', modules: [], questions: [] },
               ]
            },
            { // Sem 8
               id: 'lt_sem8', number: 8, subjects: [
                  { id: 'lt801', name: 'Professional Elective V (e.g., Marketing & Merchandising)', code: 'LTPE801', modules: [], questions: [createPlaceholderQuestion('lt801', 'Professional Elective V', 8)] },
                  { id: 'lt802', name: 'Open Elective III', code: 'LTOE801', modules: [], questions: [] },
                  { id: 'lt803', name: 'Project Phase II / Internship', code: 'LTPW801', modules: [], questions: [] },
                  { id: 'lt804', name: 'Grand Viva', code: 'LTVV801', modules: [], questions: [] },
               ]
            },
         ]
      },
   ],
};

export default beuData;