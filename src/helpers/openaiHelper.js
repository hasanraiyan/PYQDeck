// src/helpers/openaiHelper.js
const OPENAI_API_KEY = "EFEtdLL3j_xg6lfY"; // IMPORTANT: Replace with your actual key for real use.
import { UNCAT_CHAPTER_NAME, COLORS } from '../constants';

export const REQUEST_TYPES = {
    SOLVE_QUESTION: 'SOLVE_QUESTION',
    EXPLAIN_CONCEPTS: 'EXPLAIN_CONCEPTS',
    GET_VIDEO_SEARCH_TAGS: 'GET_VIDEO_SEARCH_TAGS', // New type for getting tags
};

const extractImageUrlsFromHtml = (htmlString) => {
    const images = [];
    if (!htmlString || typeof htmlString !== 'string') return images;
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;
    while ((match = imgRegex.exec(htmlString)) !== null) {
        const src = match[1];
        if (src.startsWith('data:image') || src.startsWith('http')) {
            images.push({ type: 'image_url', image_url: { url: src, detail: "auto" } });
        }
    }
    return images;
};

export const callOpenAIWithContent = async (systemInstruction, userMessageParts, options = {}) => {
    if (!OPENAI_API_KEY) {
        console.error("OpenAI API key is not set or is a placeholder.");
        // For end-users, a more generic message. For devs, this is fine.
        throw new Error("AI Service Unconfigured: API key is missing or invalid.");
    }

    const API_URL = 'https://text.pollinations.ai/openai'; // Note: This is a proxy. Official: 'https://api.openai.com/v1/chat/completions'
    const MODEL_NAME = options.modelName || 'openai'; // Allow model override, default to large
    
    const body = {
        model: MODEL_NAME,
        messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userMessageParts },
        ],
        max_tokens: options.max_tokens || 1500,
        // json: true,
        temperature: options.temperature || 0.5,
        api_key: OPENAI_API_KEY,
        token: OPENAI_API_KEY,
        // Add other parameters like top_p, presence_penalty, frequency_penalty if needed
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                
                'apikey':`${OPENAI_API_KEY}`,
                'X-API-Key': `${OPENAI_API_KEY}`,
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
            // Check if Pollinations returns error in a different structure
            if (data.error) { // Example, adjust if Pollinations has a specific error structure
                 throw new Error(data.error.message || "Unknown error from AI service.");
            }
            return "The AI did not provide a specific answer. Please try rephrasing or regenerating.";
        }

    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        throw error; // Re-throw the original error or a new one
    }
};

export const askAIWithContext = async (requestType, item, subjectContext, displayFeedback) => {
    // item: The question object { text, chapter, year, qNumber, marks, questionId }
    // subjectContext: { branchName, semesterNumber, subjectName, subjectCode }
    // requestType: from REQUEST_TYPES

    let systemInstruction = "";
    let userPromptIntro = "";
    let aiModelOptions = {
        temperature: 0.5,
        modelName: 'openai' // Default model
    };

    if (requestType === REQUEST_TYPES.SOLVE_QUESTION) {
        userPromptIntro = `I need help with a question from a previous year's exam paper. Please provide a comprehensive explanation, solution steps if it's a problem, or a detailed discussion if it's theoretical. Consider any images included as part of the question.`;
        systemInstruction = `
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
        aiModelOptions.max_tokens = 1500;
    } else if (requestType === REQUEST_TYPES.EXPLAIN_CONCEPTS) {
        userPromptIntro = `Regarding the following question, please identify and explain in detail the key concepts, theories, principles, and any relevant formulas or laws involved. Assume I need a thorough understanding of the underlying fundamentals to tackle similar questions. Consider any images included as part of the question context.`;
        systemInstruction = `
        You are "PYQ Deck AI Assistant", an expert academic tutor specializing in university-level engineering and technical subjects.
        
        Your task is to EXPLAIN THE FUNDAMENTAL CONCEPTS related to the provided question.
        
        Guidelines for Response:
        - Identify ALL core academic concepts, theories, laws, formulas, and principles relevant to the question.
        - For EACH concept:
            - Provide a clear definition.
            - Explain its significance and application, especially in the context of the question's subject area.
            - Offer examples if appropriate. Explain how it relates to the given question if possible.
            - If it's a formula, explain its components, units, and typical usage.
        - Structure your explanation logically using Markdown. Use headings (e.g., ## Concept Name) for each major concept, and sub-headings (###) or bold text for sub-topics.
        - Use lists for enumerating points or steps.
        - Use LaTeX for ALL math expressions and formulas.
        
        IMPORTANT:
        - Use only the following LaTeX math delimiters:
          - Inline math: $...$
          - Block math: $$...$$
        - Do NOT use \\\[ ... \\\] or \\\( ... \\\) as math delimiters anywhere.
        - Ensure the explanation is comprehensive, pedagogical, and helps build a strong foundational understanding.
        - Maintain a helpful, encouraging, and professional tone.
        
        At the very end, include this line exactly:
        "*Conceptual explanation by PYQ Deck – Your personal exam prep assistant.*"
        `;
        aiModelOptions.max_tokens = 2500; // Concepts might need more tokens
        aiModelOptions.temperature = 0.3; // Slightly more factual for concept explanations
    } else if (requestType === REQUEST_TYPES.GET_VIDEO_SEARCH_TAGS) {
        userPromptIntro = `Analyze the following academic question. Identify the most crucial concepts or topics within it. Based on these, provide 3 to 5 concise keywords or short phrases that would be highly effective for searching relevant educational videos on YouTube.
        The goal is to find videos that explain these core concepts.
        Return ONLY the keywords/phrases, separated by commas. Do not add any other text, numbers, or explanations.
        For example: "Fourier series, signal processing, periodic functions" or "Newton's laws, kinematics, projectile motion"`;
        systemInstruction = `
        You are an "Academic Keyword Extractor AI". Your sole purpose is to identify key concepts from an academic question and distill them into a comma-separated list of 3-5 concise search terms suitable for finding educational YouTube videos.
        Prioritize terms that represent fundamental principles or distinct topics mentioned or implied in the question.
        Output ONLY the comma-separated keywords/phrases. No other text.
        For example, if the question is about "Explain the process of photosynthesis and its importance in ecosystems", a good output would be: "photosynthesis, cellular respiration, ecosystem energy flow, carbon cycle".
        If the question is "Derive the formula for the period of a simple pendulum and discuss factors affecting it", a good output would be: "simple pendulum, period derivation, oscillation, simple harmonic motion".
        `;
        aiModelOptions.modelName = 'openai'; // For now, using the same model as others, prompt is key.
                                                 // If 'openai-small' or similar becomes available via proxy, use it.
        aiModelOptions.max_tokens = 100; // Tags should be short.
        aiModelOptions.temperature = 0.2; // More deterministic for tag extraction.
    } else {
        console.error("Invalid requestType for AI:", requestType);
        throw new Error("AI request type is invalid.");
    }

    try {
        let contextDetails = "\n\n--- Question Context (for AI analysis only, do not include in keyword output if extracting tags) ---\n";
        if (subjectContext.branchName && subjectContext.branchName !== 'N/A') contextDetails += `Branch: ${subjectContext.branchName}\n`;
        if (subjectContext.semesterNumber && subjectContext.semesterNumber !== 'N/A') contextDetails += `Semester: ${subjectContext.semesterNumber}\n`;
        if (subjectContext.subjectName) contextDetails += `Subject: ${subjectContext.subjectName} (${subjectContext.subjectCode || 'N/A'})\n`;
        if (item.chapter && item.chapter !== UNCAT_CHAPTER_NAME && item.chapter.trim() !== '') contextDetails += `Chapter: ${item.chapter}\n`;
        if (item.year) contextDetails += `Year: ${item.year}\n`;
        if (item.qNumber) contextDetails += `Question Number: ${item.qNumber}\n`;
        if (item.marks != null) contextDetails += `Marks: ${item.marks}\n`;
        contextDetails += "--- End of Context ---\n\n";

        const questionHtml = item.text || "No question text provided.";
        const userMessageParts = [];

        // For tag extraction, the user prompt intro is very specific.
        // For other types, it's more general.
        let fullUserPromptText = userPromptIntro;
        if (requestType !== REQUEST_TYPES.GET_VIDEO_SEARCH_TAGS) {
            fullUserPromptText += contextDetails;
        }


        userMessageParts.push({ type: "text", text: fullUserPromptText });

        const imageParts = extractImageUrlsFromHtml(questionHtml);
        if (imageParts.length > 0) {
            userMessageParts.push(...imageParts);
            const imageReferenceText =
                requestType === REQUEST_TYPES.GET_VIDEO_SEARCH_TAGS
                ? `The question text (which may refer to the image(s) above) from which to extract YouTube search tags is:\n\n${questionHtml}\n\nPlease analyze everything provided based on the initial instruction for extracting comma-separated keywords.`
                : requestType === REQUEST_TYPES.EXPLAIN_CONCEPTS
                    ? `The question text (which may refer to the image(s) above) for which concepts need to be explained is:\n\n${questionHtml}\n\nPlease analyze everything provided based on the initial instruction to explain concepts.`
                    : `The question text (which may refer to the image(s) above) is:\n\n${questionHtml}\n\nPlease analyze everything provided based on the initial instruction to solve/discuss the question.`;
            userMessageParts.push({ type: "text", text: imageReferenceText });
        } else {
            const textOnlyPrompt =
                requestType === REQUEST_TYPES.GET_VIDEO_SEARCH_TAGS
                ? `The question text from which to extract YouTube search tags is:\n\n${questionHtml}`
                : requestType === REQUEST_TYPES.EXPLAIN_CONCEPTS
                    ? `The question text for which concepts need to be explained is:\n\n${questionHtml}`
                    : `The question text is:\n\n${questionHtml}`;
            userMessageParts.push({ type: "text", text: textOnlyPrompt });
        }
        
        // Add context for tag extraction at the end, so it doesn't interfere with the primary instruction.
        if (requestType === REQUEST_TYPES.GET_VIDEO_SEARCH_TAGS) {
             userMessageParts.push({ type: "text", text: contextDetails });
        }

        const aiResponse = await callOpenAIWithContent(systemInstruction, userMessageParts, aiModelOptions);
        
        if (requestType === REQUEST_TYPES.GET_VIDEO_SEARCH_TAGS) {
            // Clean up the response: remove quotes, trim whitespace.
            return aiResponse.replace(/"/g, '').trim();
        }
        
        return aiResponse;

    } catch (error) {
        console.error(`Error in askAIWithContext (Type: ${requestType}):`, error);
        if (displayFeedback && typeof displayFeedback === 'function') {
            displayFeedback(`AI Error: ${error.message || "Could not get response"}`);
        }
        throw error; // Re-throw to be caught by the modal
    }
};