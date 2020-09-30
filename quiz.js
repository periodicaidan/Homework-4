/*** GLOBAL VARIABLES ***/

const START_TIME = 75; // seconds
const TIME_PENALTY = 10;
const HIGHSCORE_TABLE_STORAGE_KEY = 'highscores';

const appElement = document.querySelector('#app');

// The questions for the quiz
const quizItems = [
    {
        question: 'Commonly-used data types DO NOT include:',
        answers: [
            'strings',
            'booleans',
            'alerts',
            'numbers'
        ],
        correctIndex: 2
    },
    {
        question: 'The condition in an if statement is contained in ______.',
        answers: [
            'quotes',
            'curly braces',
            'parentheses',
            'square brackets'
        ],
        correctIndex: 2
    },
    {
        question: 'Arrays in JavaScript can be used to store ______.',
        answers: [
            'numbers and strings',
            'other arrays',
            'booleans',
            'all of the above'
        ],
        correctIndex: 3
    },
    {
        question: 'String values must be enclosed within ______ when being assigned to variables.',
        answers: [
            'commas',
            'curly braces',
            'quotes',
            'parentheses'
        ],
        correctIndex: 2
    },
    {
        question: 'A very useful tool used during development and debugging for printing content to the debugger is:',
        answers: [
            'JavaScript',
            'terminal/bash',
            'for loops',
            'console.log'
        ],
        correctIndex: 3
    }
];

// The shared mutable state of the application
let state = {
    questionIndex: 0,
    questionCorrect: null,
    timer: {
        id: -1,
        timeLeft: 0,

        start() {
            this.timeLeft = START_TIME;
            this.id = setInterval(() => {
                if (--this.timeLeft === 0) {
                    this.stop();
                    renderFinalScoreScene();
                }

                renderStatusBar();
            }, 1000);
       },

       stop() {
           clearInterval(this.id);
       },

       reset() {
           this.id = -1;
           this.timeLeft = 0;
       }
    },
};

/*** OBJECT "CONSTRUCTORS" ***/

/**
 * @param {string} text 
 * @param {number} timeout 
 */
function Alert(text, timeout) {
    return {
        text,
        timer: timeout
    }
}

/**
 * @param {string} initials 
 * @param {number} value 
 */
function Score(initials, value) {
    return {
        initials,
        value
    };
}

/*** ELEMENT CREATION ***/

/**
 * @param {string} text 
 */
function createHeading(text) {
    let el = document.createElement('h1');
    el.textContent = text;
    return el;
}

/**
 * @param {string} text 
 * @param {string | null} type 
 * @param {(e: MouseEvent) => void} clickCallback 
 */
function createButton(text, type, clickCallback) {
    let button = document.createElement('button');
    button.type = type ?? 'button';
    button.textContent = text;
    button.addEventListener('click', clickCallback);
    return button;
}

/**
 * @param {string} initials 
 * @param {number} score 
 */
function createHighscoreEntry(initials, score) {
    let li = document.createElement('li');
    li.setAttribute('class', 'high-score');
    li.textContent = `${initials} - ${score}`;
    return li;
}

/*** COMPONENT RENDERING ***/

function renderStatusBar() {
    let statusBarElement = document.querySelector('#status-bar');

    // Just writing the HTML directly instead of doing the createElement song-and-dance
    statusBarElement.innerHTML = `
        <a href="#" id="view-highscores">View Highscores</a>
        <span id="time">Time: ${state.timer.timeLeft}</span>
    `;

    // This is the only way I could get a click event to register on the a tag
    document.querySelector('a#view-highscores').addEventListener('click', e => {
        e.preventDefault();
        renderHighscoresScene();
    });
}

function renderQuizItem(item) {
    appElement.innerHTML = '';

    let quizItemContainer = document.createElement('div');
    quizItemContainer.setAttribute('class', 'quiz-item-container');

    let questionElement = createHeading(item.question);
    quizItemContainer.appendChild(questionElement);

    for (let i = 0; i < item.answers.length; ++i) {
        let answer = item.answers[i];
        
        let answerButton = createButton(answer, null, e => {
            let answerIndex = parseInt(answerButton.getAttribute('data-index'));
            nextQuestion(answerIndex === item.correctIndex);
        });
        answerButton.setAttribute('class', 'answer');
        answerButton.setAttribute('data-index', i);

        quizItemContainer.appendChild(answerButton);
    }

    appElement.appendChild(quizItemContainer);
}

function renderAlert(alert) {
    // Remove any existing alerts on the page
    document.querySelectorAll('.alert')
        .forEach(el => document.body.removeChild(el));

    let alertElement = document.createElement('div');
    alertElement.setAttribute('class', 'alert');
    alertElement.appendChild(document.createElement('hr'));
    alertElement.append(alert.text);
    
    // Placing the alert below the app element
    appElement.after(alertElement);

    // This produces an exception when it attempts to remove the element after it's already been removed
    // Doesn't crash anything so we're letting it be
    setTimeout(() => {  
        document.body.removeChild(alertElement);
    }, alert.timer * 1000);
}

function renderAlertIfNotNullish(alert) {
    // The use of != here instead of !== is deliberate, hence "nullish"
    (alert != null) && renderAlert(alert);
}

function renderHighscoresList() {
    let highscores = loadScoresSorted();

    let highscoresList = document.createElement('ol');
    highscoresList.id = 'highscores-list';

    for (let highscore of highscores) {
        let highscoreEntry = createHighscoreEntry(highscore.initials, highscore.value);
        highscoresList.appendChild(highscoreEntry);
    }

    appElement.appendChild(highscoresList);
}

/**
 * Renders the highscore list using an existing highscore list element
 */
function rerenderHighscoresList() {
    let highscores = loadScoresSorted();
    let highscoresList = document.querySelector('#highscores-list');
    highscoresList.innerHTML = '';
    
    for (let highscore of highscores) {
        let highscoreEntry = createHighscoreEntry(highscore.initials, highscore.value);
        highscoresList.appendChild(highscoreEntry);
    }
}

/*** SCENE RENDERING ***/

function renderWelcomeScene() {
    appElement.innerHTML = '';
    // Make everything centered. This gets cleared before transitioning away.
    appElement.setAttribute('style', 'display: flex; flex-direction: column; justify-contents: center; align-items: center;')

    let headingElement = createHeading('Coding Quiz Challenge');
    headingElement.style.textAlign = 'center';

    const description = 'Try to answer the following code-related questions within the time limit. Keep in mind that incorrect answers will penalize your score/time by ten seconds!';
    let descriptionElement = document.createElement('p');
    descriptionElement.textContent = description;
    descriptionElement.style.textAlign = 'center'

    let startButton = createButton('Start Quiz', null, e => {
        state.timer.start();
        appElement.setAttribute('style', '');
        renderQuestionScene(state.questionIndex, null);
    });

    renderStatusBar();
    appElement.appendChild(headingElement);
    appElement.appendChild(descriptionElement);
    appElement.appendChild(startButton);
}

function renderQuestionScene(questionIndex, alert) {
    renderStatusBar();
    renderQuizItem(quizItems[questionIndex]);
    renderAlertIfNotNullish(alert);
}

/**
 * @param {boolean} isCorrect 
 */
function nextQuestion(isCorrect) {
    let alert = Alert(isCorrect ? 'Correct!' : 'Incorrect...', 5);

    if (!isCorrect) {
        // Yes, this causes a data race. Too bad!
        state.timer.timeLeft -= TIME_PENALTY;
    }

    // If there are more questions, go to the next question, otherwise go to the end screen
    if (++state.questionIndex < quizItems.length) {
        renderQuestionScene(state.questionIndex, alert);
    } else {
        state.timer.stop();
        renderFinalScoreScene(state.timer.timeLeft, alert);
    }
}

function renderFinalScoreScene(finalScore, alert) {
    appElement.innerHTML = '';

    let headingElement = createHeading('All Done!');

    let reportElement = document.createElement('p');
    reportElement.textContent = `Your final score is ${finalScore}`;
    
    let form = document.createElement('form');
    form.innerHTML = `
        <label for="intials">Enter Initials</label>
        <input type="text" name="initials" id="initials">
    `;

    form.addEventListener('submit', e => {
        e.preventDefault(); // Do not let the form submit
        let initials = document.querySelector('#initials').value;
        if (initials === null || initials === '') { // No initials provided
            return;
        }

        saveScore(initials, finalScore);
        renderHighscoresScene();
    });

    let submitButton = createButton('Submit', 'submit');
    form.appendChild(submitButton);

    renderStatusBar();
    appElement.appendChild(headingElement);
    appElement.appendChild(reportElement);
    appElement.appendChild(form);
    renderAlertIfNotNullish(alert);
}

function renderHighscoresScene() {
    appElement.innerHTML = '';
    document.querySelector('#status-bar').innerHTML = '';

    let headingElement = createHeading('Highscores');
    
    let restartButton = createButton('Go Back', null, e => {
        state.timer.reset();
        state.questionIndex = 0;
        renderWelcomeScene();
    });

    let clearButton = createButton('Clear Highscores', null, e => {
        clearHighscores();
        rerenderHighscoresList()
    });

    appElement.appendChild(headingElement);
    renderHighscoresList();
    appElement.appendChild(restartButton);
    appElement.appendChild(clearButton);
}

/*** LOCAL STORAGE ACCESS ***/

function saveScore(initials, score) {
    let highscores = loadScores();
    let extistingScore = highscores.find(highscore =>
        highscore.initials === initials
    );
    
    if (extistingScore === undefined) {
        let highscore = Score(initials, score);
        highscores.push(highscore);
    } else {
        extistingScore.value = Math.max(score, extistingScore.value);
    }

    localStorage.setItem(HIGHSCORE_TABLE_STORAGE_KEY, JSON.stringify(highscores));
}

/**
 * @returns { {initials: string, value: number}[] }
 */
function loadScores() {
    return JSON.parse(localStorage.getItem(HIGHSCORE_TABLE_STORAGE_KEY)) ?? []
}

function clearHighscores() {
    localStorage.setItem(HIGHSCORE_TABLE_STORAGE_KEY, JSON.stringify([]));
}

function loadScoresSorted() {
    return loadScores().sort((a, b) => b.value - a.value);
}

renderWelcomeScene();