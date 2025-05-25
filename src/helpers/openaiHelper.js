// src/helpers/openaiHelper.js
const OPENAI_API_KEY = "dummmy-key";
import { UNCAT_CHAPTER_NAME, COLORS } from '../constants';

const extractImageUrlsFromHtml = (htmlString) => {
    const images = [];
    if (!htmlString || typeof htmlString !== 'string') return images;
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;
    while ((match = imgRegex.exec(htmlString)) !== null) {
        const src = match[1];
        if (src.startsWith('data:image') || src.startsWith('http')) {
            // OpenAI expects { type: "image_url", image_url: { "url": "...", "detail": "auto" } }
            images.push({ type: 'image_url', image_url: { url: src, detail: "auto" } });
        }
    }
    return images;
};

export const callOpenAIWithContent = async (systemInstruction, userMessageParts) => {
    if (!OPENAI_API_KEY) {
        console.error("OpenAI API key is not set.");
        throw new Error("AI Service Unconfigured: API key is missing.");
    }

    const API_URL = 'https://text.pollinations.ai/openai';
    const MODEL_NAME = 'openai-large';
    const body = {
        model: MODEL_NAME,
        messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userMessageParts }, // userMessageParts is an array of text/image objects
        ],
        max_tokens: 1500, // Adjust based on expected response length
        temperature: 0.5, // Lower for more factual, higher for more creative
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('OpenAI API Error Full Response:', data);
            let errorMessage = `API request failed with status ${response.status}.`;
            if (data.error?.message) {
                errorMessage = data.error.message;
            } else if (typeof data.detail === 'string') {
                errorMessage = data.detail;
            }
            throw new Error(errorMessage);
        }

        if (data.choices && data.choices.length > 0 && data.choices[0].message?.content) {
            return data.choices[0].message.content;
        } else {
            console.warn('OpenAI API Warning: No content in response', data);
            // Check for finish_reason like 'content_filter'
            if (data.choices?.[0]?.finish_reason === 'content_filter') {
                throw new Error("AI response was blocked due to content policy.");
            }
            return "The AI did not provide a specific answer. Please try rephrasing or regenerating.";
        }

    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        throw error;
    }
};

export const askAIWithContext = async (item, subjectContext, displayFeedback) => {
    // item: The question object { text, chapter, year, qNumber, marks, questionId }
    // subjectContext: { branchName, semesterNumber, subjectName, subjectCode }

    try {
        let userPromptIntro = `I need help with a question from a previous year's exam paper. Please provide a comprehensive explanation, solution steps if it's a problem, or a detailed discussion if it's theoretical. Consider any images included as part of the question.`;

        let contextDetails = "\n\n--- Question Context ---\n";
        if (subjectContext.branchName && subjectContext.branchName !== 'N/A') contextDetails += `Branch: ${subjectContext.branchName}\n`;
        if (subjectContext.semesterNumber && subjectContext.semesterNumber !== 'N/A') contextDetails += `Semester: ${subjectContext.semesterNumber}\n`;
        if (subjectContext.subjectName) contextDetails += `Subject: ${subjectContext.subjectName} (${subjectContext.subjectCode || 'N/A'})\n`;
        if (item.chapter && item.chapter !== UNCAT_CHAPTER_NAME && item.chapter.trim() !== '') contextDetails += `Chapter: ${item.chapter}\n`;
        if (item.year) contextDetails += `Year: ${item.year}\n`;
        if (item.qNumber) contextDetails += `Question Number: ${item.qNumber}\n`;
        if (item.marks != null) contextDetails += `Marks: ${item.marks}\n`;
        contextDetails += "--- End of Context ---\n\n";

        // The actual question text (HTML) will be a separate part if it contains images, or combined if not.
        const questionHtml = item.text || "No question text provided.";

        const userMessageParts = [];
        userMessageParts.push({ type: "text", text: userPromptIntro + contextDetails });

        // Add images if any, and then the question text.
        // If question text also needs to be sent alongside images, this structure is good.
        const imageParts = extractImageUrlsFromHtml(questionHtml);
        if (imageParts.length > 0) {
            userMessageParts.push(...imageParts);
            userMessageParts.push({ type: "text", text: `The question text (which may refer to the image(s) above) is:\n\n${questionHtml}\n\nPlease analyze everything provided.` });
            console.log(`Sending ${imageParts.length} image(s) and HTML text to AI.`);
        } else {
            // If no images, just send the plain text part of the question along with the intro and context
            userMessageParts.push({ type: "text", text: `The question text is:\n\n${questionHtml}` });
            console.log("Sending HTML text (no images detected) to AI.");
        }

        const systemInstruction = `
        You are "PYQ Deck AI Assistant", an expert academic tutor specializing in university-level engineering and technical subjects.
        
        Guidelines for Response:
        - Analyze the provided question text, context (subject, year, marks), and any included images thoroughly.
        - For numerical problems, provide clear, step-by-step solutions with formulas and units.
        - For theoretical questions, give comprehensive explanations with definitions and examples.
        - If information is missing, explicitly state what’s missing but attempt the best answer.
        - Format your response using Markdown with headings, lists, bold, and code blocks.
        - Use LaTeX for all math expressions.
        
        IMPORTANT:
        - Use only the following LaTeX math delimiters:
          - Inline math: $...$
          - Block math: $$...$$
        - Do NOT use \\\[ ... \\\] or \\\( ... \\\) as math delimiters anywhere.
        - Use clear, consistent formatting to help rendering in the frontend.
        
        Maintain a helpful, encouraging, and professional tone throughout.
        
        At the very end, include this line exactly:
        "*Generated by PYQ Deck – Your personal exam prep assistant.*"
        `;
        
        



        const aiResponse = await callOpenAIWithContent(systemInstruction, userMessageParts);
        console.log("AI Response:", aiResponse);
        return aiResponse;

    } catch (error) {
        console.error("Error in askAIWithContext:", error);
        if (displayFeedback) displayFeedback(`AI Error: ${error.message || "Could not get response"}`);
        throw error;
    }
};