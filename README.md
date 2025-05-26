
# PYQDeck

**PYQDeck: Your Pocket Guide to BEU Past Year Questions**

PYQDeck is a cross-platform mobile application (iOS & Android) and a web interface designed to help students of Bihar Engineering University (BEU) easily access, browse, and prepare using Past Year Questions (PYQs).

[![React Native](https://img.shields.io/badge/React%20Native-0.79.2-61DAFB?logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-53.0.8-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Version](https://img.shields.io/badge/Version-3.1.0-blue.svg)](package.json)

## Overview

PYQDeck aims to streamline the exam preparation process for BEU students by providing a centralized and user-friendly platform for PYQs. Students can navigate through questions based on their branch, semester, and subject, and further organize them by chapter or year. The app also includes features like progress tracking, bookmarking, AI-powered explanations, and a simple web version for broader accessibility.

## Features

*   **Comprehensive Browsing:** Navigate PYQs by:
    *   Branch (e.g., CSE, IT, Civil)
    *   Semester
    *   Subject
*   **Flexible Organization:**
    *   View all questions for a subject.
    *   Filter and view questions by specific Examination Year.
    *   Filter and view questions by Chapter/Module.
*   **Powerful Search:** Quickly find questions by searching text, chapter, year, or question number within lists.
*   **Progress Tracking:**
    *   Mark questions as "Completed".
    *   View progress at branch, semester, chapter, and year levels.
    *   **Daily Streak:** Track your daily question-solving consistency.
*   **Bookmarking:** Save important questions for quick review.
*   **Rich Content Display:**
    *   Questions rendered with Markdown for formatting.
    *   Mathematical equations displayed using KaTeX.
    *   Embedded images supported.
    *   Code snippets highlighted.
*   **Question Actions:**
    *   **Copy Text:** Easily copy the plain text of a question.
    *   **Search Google:** Instantly search the question on Google (opens in an in-app WebView).
    *   **Ask AI:** Get explanations or solutions for questions using an AI assistant (powered by OpenAI via a proxy).
*   **Resume Last Journey:** Quickly jump back to the last subject you were viewing.
*   **Offline Access:** Downloaded PYQ data for selected semesters can be stored securely for offline use.
*   **User-Friendly Interface:** Clean, intuitive design with custom headers and list item cards.
*   **Developer Info:** Screen with information about the app and developer.
*   **Web Version:** A simple HTML-based web interface for browsing questions, also featuring AI and Google search links, and a dark mode.

## Platforms

*   **Mobile:** iOS & Android (built with React Native & Expo)
*   **Web:** Accessible via modern web browsers (HTML, Tailwind CSS, Alpine.js)

## Tech Stack

*   **Mobile Frontend:** React Native, Expo
*   **Web Frontend:** HTML, Tailwind CSS (CDN), Alpine.js (CDN)
*   **Navigation:** React Navigation (`@react-navigation/native-stack`)
*   **Data Storage (Mobile):**
    *   AsyncStorage (for user preferences, completion status, bookmarks, streak)
    *   Expo SecureStore (for caching PYQ data offline)
*   **Markdown & Math Rendering (Mobile):** Custom WebView solution using:
    *   Markdown-it (CDN in WebView)
    *   KaTeX (CDN in WebView)
    *   Highlight.js (CDN in WebView)
*   **AI Integration:** OpenAI API (accessed via Pollinations AI proxy, as per `openaiHelper.js`)
*   **Core Language:** JavaScript (ES6+)
*   **Icons:** `@expo/vector-icons` (Ionicons, MaterialCommunityIcons, etc.)

## Project Structure

```
hasanraiyan-pyqdeck/
├── App.js                   # Root React Native component
├── app.json                 # Expo configuration
├── index.js                 # Entry point for Expo
├── package.json             # Project dependencies and scripts
├── assets/                  # Static assets (local libraries for webview - though CDN used in generateHTML)
│   └── libs/
│       ├── katex/
│       └── markdown-it/
├── src/
│   ├── components/          # Reusable UI components
│   ├── constants/           # Global constants (colors, keys)
│   ├── data/                # PYQ data (beuData.js, data.json)
│   ├── helpers/             # Utility functions (bookmarks, HTML generation, AI, general)
│   ├── navigation/          # Navigation setup (AppNavigator.js)
│   └── screens/             # Application screens
└── web/
    └── index.html           # Standalone web version
```

## Setup and Installation (for Developers)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/hasanraiyan/pyqdeck.git
    cd hasanraiyan-pyqdeck
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the app:**
    *   **On Expo Go (iOS/Android simulators or physical devices):**
        ```bash
        npm start
        # or
        yarn start
        ```
        Then scan the QR code with the Expo Go app.

    *   **Build for Android (local development build):**
        ```bash
        npm run android
        # or
        yarn android
        ```

    *   **Build for iOS (local development build, macOS required):**
        ```bash
        npm run ios
        # or
        yarn ios
        ```

    *   **Run the web version (development server):**
        ```bash
        npm run web
        # or
        yarn web
        ```
        The `web/index.html` file can also be opened directly in a browser. It is configured to fetch `data.json` from `https://raw.githubusercontent.com/hasanraiyan/PYQDeck/main/src/data/data.json`.

4.  **API Keys:**
    *   The AI feature in `src/helpers/openaiHelper.js` currently uses a placeholder API key (`"skfhjkdgkjxlkhlkcvgkefh"`) and the Pollinations AI proxy. For direct OpenAI integration or production use, replace this with a valid OpenAI API key and potentially adjust the API endpoint and model names.

## Data Source

The primary source of Past Year Questions is `src/data/data.json`. This JSON file follows a hierarchical structure:
`Branches -> Semesters -> Subjects -> Questions`
Each subject also contains a `modules` array detailing the syllabus. Each question object contains details like `questionId`, `year`, `qNumber`, `chapter` (mapped to a module), `text` (in Markdown, can include image URLs or data URIs), `type`, and `marks`.

## Key Components & Logic

*   **`QuestionItem.js`:** A central component responsible for displaying an individual question, its header (year, marks, chapter), actions (copy, share, search, AI), and managing its bookmarked/completed state. It uses `QuestionHeader.js`, `QuestionContentPreview.js`, and `QuestionActionsBar.js`.
*   **Modal Components:**
    *   `AIChatModal.js`: A significantly enhanced modal providing an animated interface to interact with the AI assistant. Supports multiple request types (solve, explain concepts, get video search tags), shows dynamic loading states, and handles errors gracefully.
    *   `ContentDisplayModal.js`: Shows the full question content in a WebView if it's too long for the preview or if the user taps to expand.
    *   `SearchWebViewModal.js`: An in-app browser for Google searches, featuring navigation controls (back, forward), a progress bar, a "more options" menu (reload, share, open in external browser), and custom User-Agent.
*   **`generateHTML.js`:** Dynamically creates an HTML string to render question content (Markdown, KaTeX, images, code blocks) within a WebView. Uses CDN versions of Markdown-it, KaTeX, and Highlight.js. Styles are embedded for consistent rendering, including a body background color matching the AI response container.
*   **Helper Modules (`src/helpers/`):**
    *   `bookmarkHelpers.js`: Manages bookmarking functionality using AsyncStorage.
    *   `helpers.js`: Contains core utility functions:
        *   Data retrieval (`findData` from `beuData.js` which imports `data.json`).
        *   Completion status management (single and bulk using AsyncStorage).
        *   Last journey persistence (`saveLastJourney`, `loadLastJourney`).
        *   Daily streak tracking (`updateDailyStreak`, `getStreakInfo`, `checkAndResetStreak`).
        *   Clipboard operations, linking, debouncing.
        *   PYQ data caching in SecureStore (`saveSemesterPYQsToSecureStore`, `getSemesterPYQsFromSecureStore`, `isSemesterPYQDownloaded`), using chunking for larger data.
    *   `openaiHelper.js`: Handles API calls to the AI service (OpenAI via Pollinations proxy). Manages different `REQUEST_TYPES`, builds context-rich prompts (including image data if present in question HTML), and formats requests for the AI.
*   **Navigation (`src/navigation/AppNavigator.js`):** Uses React Navigation's native stack navigator. `CustomHeader.js` provides a consistent header across screens.
*   **Data Flow & Screens:**
    *   Screens like `BranchListScreen`, `SemesterListScreen`, `SubjectListScreen`, `ChapterSelectionScreen`, `YearSelectionScreen` display lists with progress indicators.
    *   `QuestionListScreen` fetches data using `findData` or `getSemesterPYQsFromSecureStore` (for offline cached data). It handles filtering, sorting, and displays questions using `QuestionItem`. It integrates with `AIChatModal` for AI assistance and updates streaks on question completion.
    *   User interactions like completing or bookmarking questions update AsyncStorage.
    *   `BranchListScreen` includes a "Resume Last Journey" feature and displays streak information.

## Web Version (`web/index.html`)

The `web/` directory contains a standalone HTML file that provides a simplified web-based interface for PYQDeck.
*   It uses **Alpine.js** for interactivity and **Tailwind CSS** (via CDN) for styling.
*   It fetches data directly from `https://raw.githubusercontent.com/hasanraiyan/PYQDeck/main/src/data/data.json`.
*   Users can navigate through branches, semesters, subjects, and view questions (organized by 'all', 'chapter', or 'year').
*   Question text is formatted from Markdown using a simple regex-based conversion within Alpine.js logic. Images are also rendered.
*   Includes links to search the question on Google or "Ask AI". The AI assistant (e.g., ChatGPT, Perplexity) can be configured via a settings modal.
*   Supports dark mode. Settings (AI preference, dark mode) are persisted via `localStorage`.

## Developer

PYQDeck is developed by **Raiyan Hasan**.

*   **Email:** [raiyanhasan2006@gmail.com](mailto:raiyanhasan2006@gmail.com)
*   **GitHub:** [hasanraiyan](https://github.com/hasanraiyan)
*   **Portfolio/Website:** [https://hasanraiyan.github.io/Portfolio](https://hasanraiyan.github.io/Portfolio) (or [pyqdeck.vercel.app](https://pyqdeck.vercel.app) )
