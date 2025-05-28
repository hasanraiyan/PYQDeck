// src/helpers/openaiHelper.js
const OPENAI_API_KEY = "EFEtdLL3j_xg6lfY"; // IMPORTANT: Replace with your actual key for real use.
import { UNCAT_CHAPTER_NAME } from '../constants'; // COLORS was not used, removed.

export const REQUEST_TYPES = {
    SOLVE_QUESTION: 'SOLVE_QUESTION',
    EXPLAIN_CONCEPTS: 'EXPLAIN_CONCEPTS',
    CUSTOM_QUERY: 'CUSTOM_QUERY', // Added for custom user questions
};

const extractImageUrlsFromHtml = (htmlString) => {
    const images = [];
    if (!htmlString || typeof htmlString !== 'string') return images;
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;
    while ((match = imgRegex.exec(htmlString)) !== null) {
        const src = match[1];
        // Only push if it's a data URI or an absolute HTTP/HTTPS URL
        if (src.startsWith('data:image') || src.startsWith('http')) {
            images.push({ type: 'image_url', image_url: { url: src, detail: "auto" } });
        }
    }
    return images;
};

export const callOpenAIWithContent = async (systemInstruction, userMessageParts, options = {}) => {
    if (!OPENAI_API_KEY) { // Check for placeholder
        console.error("OpenAI API key is not set or is a placeholder.");
        throw new Error("AI Service Unconfigured: API key is missing, invalid, or a placeholder.");
    }

    const API_URL = 'https://text.pollinations.ai/openai'; // Pollinations AI proxy
    const MODEL_NAME = options.modelName || 'openai'; // Default model, can be overridden

    const body = {
        model: MODEL_NAME,
        messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userMessageParts },
        ],
        max_tokens: options.max_tokens || 1500,
        temperature: options.temperature || 0.5,
        // Pollinations proxy specific fields if needed, or standard OpenAI fields
        api_key: OPENAI_API_KEY, // For Pollinations or if directly hitting OpenAI
        token: OPENAI_API_KEY, // Some proxies might use this
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Common headers for API keys, adjust if proxy has specific requirements
                'apikey': `${OPENAI_API_KEY}`,
                'X-API-Key': `${OPENAI_API_KEY}`,
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('OpenAI API Error Full Response:', data);
            let errorMessage = `API request failed with status ${response.status}.`;
            if (data?.error?.message) {
                errorMessage = data.error.message;
            } else if (typeof data?.detail === 'string') { // Some proxies return error in detail
                errorMessage = data.detail;
            } else if (response.status === 401) {
                errorMessage = "Authentication error. Please check the AI service configuration (API Key).";
            }
            throw new Error(errorMessage);
        }

        if (data.choices && data.choices.length > 0 && data.choices[0].message?.content) {
            return data.choices[0].message.content;
        } else {
            console.warn('OpenAI API Warning: No content in response', data);
            if (data.choices?.[0]?.finish_reason === 'content_filter') {
                throw new Error("AI response was blocked due to content policy.");
            }
            if (data.error) { // Check for error structure from proxy/OpenAI
                 throw new Error(data.error.message || "Unknown error from AI service.");
            }
            return "The AI did not provide a specific answer. Please try rephrasing or regenerating.";
        }

    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        // More specific error for user if it's a network issue vs API issue
        if (error.message.includes("Network request failed")) {
            throw new Error("Network error: Could not reach AI service. Please check your internet connection.");
        }
        throw error; // Re-throw the original or modified error
    }
};

const stripMarkdownLinks = (text) => {
    if (!text || typeof text !== 'string') {
        return text;
    }
    // Regex to find lines containing a Markdown link: [text](url)
    const lineWithLinkRegex = /^.*\[.*?\]\(.*?\).*$(\r?\n)?/gm;
    return text.replace(lineWithLinkRegex, '');
};

export const askAIWithContext = async (requestType, item, subjectContext, displayFeedback) => {
    // item: The question object OR custom query string
    // subjectContext: { branchName, semesterNumber, subjectName, subjectCode }
    // requestType: from REQUEST_TYPES

    let systemInstruction = "";
    let userPromptIntro = ""; // For SOLVE_QUESTION and EXPLAIN_CONCEPTS
    const userMessageParts = []; // Will hold text and image parts for multimodal request
    let aiModelOptions = {
        temperature: 0.5,
        modelName: 'openai' // Default model
    };

    const baseSystemInstruction = `You are "PYQ Deck AI Assistant", an expert academic tutor specializing in university-level engineering and technical subjects.
    Format your response using Markdown with headings, lists, bold, and code blocks.
    Use LaTeX for all math expressions.
    IMPORTANT:
    - Use only the following LaTeX math delimiters:
      - Inline math: $...$
      - Block math: $$...$$
    - Do NOT use \\\[ ... \\\] or \\\( ... \\\) as math delimiters anywhere.
    - Use clear, consistent formatting to help rendering in the frontend.
    Maintain a helpful, encouraging, and professional tone throughout.`;

    const endingNoteSolve = "\n\n*Generated by PYQ Deck – Your personal exam prep assistant.*";
    const endingNoteExplain = "\n\n*Conceptual explanation by PYQ Deck – Your personal exam prep assistant.*";
    const endingNoteCustom = "\n\n*Response by PYQ Deck AI Assistant.*";

    if (requestType === REQUEST_TYPES.SOLVE_QUESTION) {
        userPromptIntro = `I need help with a question from a previous year's exam paper. Please provide a comprehensive explanation, solution steps if it's a problem, or a detailed discussion if it's theoretical. Consider any images included as part of the question.`;
        systemInstruction = `${baseSystemInstruction}
        
        Guidelines for Solving a Question:
        - Analyze the provided question text, context (subject, year, marks), and any included images thoroughly.
        - For numerical problems, provide clear, step-by-step solutions with formulas and units.
        - For theoretical questions, give comprehensive explanations with definitions and examples.
        - If information is missing, explicitly state what’s missing but attempt the best answer.
        At the very end, include this line exactly: ${endingNoteSolve.trim()}`;
        aiModelOptions.max_tokens = 2000; // Increased slightly for potentially complex solutions

    } else if (requestType === REQUEST_TYPES.EXPLAIN_CONCEPTS) {
        userPromptIntro = `Regarding the following question, please identify and explain in detail the key concepts, theories, principles, and any relevant formulas or laws involved. Assume I need a thorough understanding of the underlying fundamentals to tackle similar questions. Consider any images included as part of the question context.`;
        systemInstruction = `${baseSystemInstruction}
        
        Your task is to EXPLAIN THE FUNDAMENTAL CONCEPTS related to the provided question.
        Guidelines for Explaining Concepts:
        - Identify ALL core academic concepts, theories, laws, formulas, and principles relevant to the question.
        - For EACH concept:
            - Provide a clear definition.
            - Explain its significance and application, especially in the context of the question's subject area.
            - Offer examples if appropriate. Explain how it relates to the given question if possible.
            - If it's a formula, explain its components, units, and typical usage.
        - Ensure the explanation is comprehensive, pedagogical, and helps build a strong foundational understanding.
        At the very end, include this line exactly: ${endingNoteExplain.trim()}`;
        aiModelOptions.max_tokens = 2500;
        aiModelOptions.temperature = 0.3;

    } else if (requestType === REQUEST_TYPES.CUSTOM_QUERY) {
        systemInstruction = `You are "PYQ Deck AI Assistant", an expert academic tutor and helpful AI.
        Answer the user's question clearly, concisely, and accurately.
        Format your response using Markdown.
        Use LaTeX for all math expressions, using $...$ for inline math and $$...$$ for block math.
        Do NOT use \\\[ ... \\\] or \\\( ... \\\) as math delimiters anywhere.
        If the question seems related to academics or engineering (especially within the context of Bihar Engineering University subjects, if inferable), try to provide a knowledgeable answer.
        For general queries, provide a helpful response.
        At the very end, include this line exactly: ${endingNoteCustom.trim()}`;
        aiModelOptions.max_tokens = 1500;
        aiModelOptions.temperature = 0.6;
    } else {
        console.error("Invalid requestType for AI:", requestType);
        throw new Error("AI request type is invalid.");
    }

    // --- Build User Message Parts ---
    if (requestType === REQUEST_TYPES.SOLVE_QUESTION || requestType === REQUEST_TYPES.EXPLAIN_CONCEPTS) {
        if (!item || !subjectContext) {
            throw new Error("Missing questionItem or subjectContext for this AI request type.");
        }
        let contextDetails = "\n\n--- Question Context (for AI analysis only) ---\n";
        if (subjectContext.branchName && subjectContext.branchName !== 'N/A') contextDetails += `Branch: ${subjectContext.branchName}\n`;
        if (subjectContext.semesterNumber && subjectContext.semesterNumber !== 'N/A') contextDetails += `Semester: ${subjectContext.semesterNumber}\n`;
        if (subjectContext.subjectName) contextDetails += `Subject: ${subjectContext.subjectName} (${subjectContext.subjectCode || 'N/A'})\n`;
        if (item.chapter && item.chapter !== UNCAT_CHAPTER_NAME && item.chapter.trim() !== '') contextDetails += `Chapter/Module: ${item.chapter}\n`;
        if (item.year) contextDetails += `Year: ${item.year}\n`;
        if (item.qNumber) contextDetails += `Question Number: ${item.qNumber}\n`;
        if (item.marks != null) contextDetails += `Marks: ${item.marks}\n`;
        contextDetails += "--- End of Context ---\n\n";
        
        userMessageParts.push({ type: "text", text: userPromptIntro + contextDetails });

        const questionHtml = item.text || "No question text provided.";
        const imageParts = extractImageUrlsFromHtml(questionHtml);

        if (imageParts.length > 0) {
            userMessageParts.push(...imageParts); // Add image URLs if any
            userMessageParts.push({ type: "text", text: `The question text (which may refer to the image(s) above) is:\n\n${questionHtml}\n\nPlease analyze everything provided.` });
        } else {
            userMessageParts.push({ type: "text", text: `The question text is:\n\n${questionHtml}` });
        }
    } else if (requestType === REQUEST_TYPES.CUSTOM_QUERY) {
        // 'item' is the custom query string
        let customQueryPrompt = `The user's custom question is: "${item}"`;
        
        // Optionally add general subject context if available
        if (subjectContext && (subjectContext.subjectName || subjectContext.branchName)) {
            customQueryPrompt += "\n\n--- General Academic Context (if relevant to the query) ---\n";
            if (subjectContext.subjectName && subjectContext.subjectName !== 'N/A') customQueryPrompt += `Current Subject Focus: ${subjectContext.subjectName}\n`;
            if (subjectContext.branchName && subjectContext.branchName !== 'N/A') customQueryPrompt += `Current Branch Focus: ${subjectContext.branchName}\n`;
            if (subjectContext.semesterNumber && subjectContext.semesterNumber !== 'N/A') customQueryPrompt += `Current Semester Focus: ${subjectContext.semesterNumber}\n`;
            customQueryPrompt += "--- End of Context ---\n";
        }
        userMessageParts.push({ type: "text", text: customQueryPrompt });
    }

    // --- Call AI and Handle Response ---
    try {
        if (displayFeedback && typeof displayFeedback === 'function') {
            displayFeedback("Sending request to AI...");
        }
        
        let aiResponse = await callOpenAIWithContent(systemInstruction, userMessageParts, aiModelOptions);
        
        // Strip Markdown links from the response for all types that render Markdown
        if ([REQUEST_TYPES.SOLVE_QUESTION, REQUEST_TYPES.EXPLAIN_CONCEPTS, REQUEST_TYPES.CUSTOM_QUERY].includes(requestType)) {
            aiResponse = stripMarkdownLinks(aiResponse);
        }

        return aiResponse;

    } catch (error) {
        console.error(`Error in askAIWithContext (Type: ${requestType}):`, error);
        if (displayFeedback && typeof displayFeedback === 'function') {
            displayFeedback(`AI Error: ${error.message || "Could not get response"}`);
        }
        throw error; // Re-throw to be caught by the calling component (AIChatModal)
    }
};