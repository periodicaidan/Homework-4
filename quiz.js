const DELTATIME = 1000; // ms

const quizItems = [
    {
        question: "Commonly-used data types DO NOT include:",
        answers: [
            "strings",
            "booleans",
            "alerts",
            "numbers"
        ],
        correctIndex: 2
    },
    {
        question: "The condition in an if statement is contained in ______.",
        answers: [
            "quotes",
            "curly braces",
            "parentheses",
            "square brackets"
        ],
        correctIndex: 2
    },
    {
        question: "Arrays in JavaScript can be used to store ______.",
        answers: [
            "numbers and strings",
            "other arrays",
            "booleans",
            "all of the above"
        ],
        correctIndex: 3
    },
    {
        question: "String values must be enclosed within ______ when being assigned to variables.",
        answers: [
            "commas",
            "curly braces",
            "quotes",
            "parentheses"
        ],
        correctIndex: 2
    },
    {
        question: "A very useful tool used during development and debugging for printing contnt to the debugger is:",
        answers: [
            "JavaScript",
            "terminal/bash",
            "for loops",
            "console.log"
        ],
        correctIndex: 3
    }
];

let state = {
    questionIndex: 0,
    questionCorrect: null,
};

function renderStatusBar(timeLeft) {
    let statusBarElement = document.querySelector('#status-bar');
    statusBarElement.innerHTML = `
        <a href="#" id="view-highscores">View Highscores</a>
        <span id="time">Time: ${timeLeft}</span>
    `;
}

function renderWelcomeScreen() {
    let appElement = document.querySelector('#app');
    appElement.innerHTML = '';
    
    const heading = "Coding Quiz Challenge";
    const description = "Try to answer the following code-related questions within the time limit. Keep in mind that incorrect answers will penalize your score/time by ten seconds!";

    let headingElement = document.createElement('h1');
    headingElement.textContent = heading;

    let descriptionElement = document.createElement('p');
    descriptionElement.textContent = description;

    let startButton = document.createElement('button');
    startButton.textContent = "Start Quiz";
    startButton.addEventListener('click', e => {
        renderQuestion(state.questionIndex, null);
    });

    renderStatusBar();
    appElement.appendChild(headingElement);
    appElement.appendChild(descriptionElement);
    appElement.appendChild(startButton);
}

function renderQuestion(questionIndex, alert) {
    renderStatusBar();
    renderQuizItem(quizItems[questionIndex]);
    renderAlertIfNotNullish(alert);
}

function renderQuizItem(item) {
    let appElement = document.getElementById('app');
    appElement.innerHTML = '';

    let quizItemContainer = document.createElement('div');
    quizItemContainer.setAttribute('class', 'quiz-item-container');

    let questionElement = document.createElement('h1');
    questionElement.setAttribute('class', 'question');
    questionElement.textContent = item.question;
    quizItemContainer.appendChild(questionElement);

    for (let i = 0; i < item.answers.length; ++i) {
        let answer = item.answers[i];
        let answerButton = document.createElement('button');
        answerButton.setAttribute('class', 'answer');
        answerButton.setAttribute('data-index', i);
        answerButton.textContent = answer;
        answerButton.addEventListener('click', e => {
            let answerIndex = parseInt(answerButton.getAttribute('data-index'));
            nextQuestion(answerIndex === item.correctIndex);
        });
        quizItemContainer.appendChild(answerButton);
    }

    appElement.appendChild(quizItemContainer);
}

/**
 * @param {boolean} isCorrect 
 */
function nextQuestion(isCorrect) {
    let alert = Alert(isCorrect ? "Correct!" : "Incorrect...", 5);
    if (++state.questionIndex < quizItems.length) {
        renderQuestion(state.questionIndex, alert);
    } else {
        renderFinalScore(69, alert);
    }
}

function renderAlert(alert) {
    let alertElement = document.createElement('div');
    alertElement.setAttribute('class', 'alert');
    alertElement.appendChild(document.createElement('hr'));
    alertElement.append(alert.text);
    
    let appElement = document.getElementById('app');
    appElement.after(alertElement);

    setTimeout(() => {  
        document.body.removeChild(alertElement);
    }, alert.timer * 1000);
}

function renderAlertIfNotNullish(alert) {
    if (alert != null) {
        renderAlert(alert);
    }
}

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

function renderFinalScore(finalScore, alert) {
    let appElement = document.querySelector('#app');
    appElement.innerHTML = '';

    let headingElement = document.createElement('h1');
    headingElement.textContent = "All Done!";

    let reportElement = document.createElement('p');
    reportElement.textContent = `Your final score is ${finalScore}`;
    
    let form = document.createElement('form');
    form.innerHTML = `
        <label for="intials">Enter Initials</label>
        <input type="text" name="initials" id="initials">
    `
    let submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Submit';
    form.addEventListener('submit', e => {
        e.preventDefault();
        let initials = document.querySelector('#initials').value;
        if (initials === null || initials === '') {
            return;
        }

        saveScore(initials, finalScore);
        renderHighscoresPage();
    });
    form.appendChild(submitButton);

    renderStatusBar();
    appElement.appendChild(headingElement);
    appElement.appendChild(reportElement);
    appElement.appendChild(form);
    renderAlertIfNotNullish(alert);
}

function renderHighscoresPage() {
    let appElement = document.querySelector('#app');
    appElement.innerHTML = "";

    let headingElement = document.createElement('h1');
    headingElement.textContent = "Highscores";
    
    let restartButton = document.createElement('button');
    restartButton.textContent = "Go Back";
    restartButton.addEventListener('click', renderWelcomeScreen);

    let clearButton = document.createElement('button');
    clearButton.textContent = "Clear Highscores";
    clearButton.addEventListener('click', e => {
        clearHighscores();
        rerenderHighscoresList();
    });

    appElement.appendChild(headingElement);
    renderHighscoresList();
    appElement.appendChild(restartButton);
    appElement.appendChild(clearButton);
}

function renderHighscoresList() {
    let highScores = loadScores();
    let appElement = document.querySelector('#app');

    let highscoresList = document.createElement('ol');
    highscoresList.id = 'highscores-list';

    for (let initials in highScores) {
        let score = highScores[initials];
        let li = document.createElement('li');
        li.setAttribute('class', 'high-score');
        li.textContent = `${initials} - ${score}`;
        highscoresList.appendChild(li);
    }

    appElement.appendChild(highscoresList);
}

function rerenderHighscoresList() {
    let highScores = loadScores();
    let highscoresList = document.querySelector('#highscores-list');
    highscoresList.innerHTML = '';
    
    for (let initials in highScores) {
        let score = highScores[initials];
        let li = document.createElement('li');
        li.setAttribute('class', 'high-score');
        li.textContent = `${initials} - ${score}`;
        highscoresList.appendChild(li);
    }
}

function saveScore(initials, score) {
    let highScores = loadScores();
    if (highScores[initials] !== undefined) {
        if (finalScore > highScores[initials]) {
            highScores[initials] = score;
        }
    } else {
        highScores[initials] = score;
    }

    localStorage.setItem('highScores', JSON.stringify(highScores));
}

function loadScores() {
    return JSON.parse(localStorage.getItem('highScores')) ?? {}
}

function clearHighscores() {
    localStorage.setItem('highScores', JSON.stringify({}));
}

renderWelcomeScreen();