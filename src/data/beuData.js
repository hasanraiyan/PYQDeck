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


import data from './data.json';

const beuData = data;

export default beuData;