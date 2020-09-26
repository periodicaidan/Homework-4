const quizItems = [
    {
        question: "Commonly-used data types DO NOT include:",
        correctAnswer: "alerts",
        incorrectAnswers: [
            "strings",
            "booleans",
            "numbers"
        ]
    },
    {
        question: "The condition in an if statement is contained in ______.",
        correctAnswer: "parentheses",
        incorrectAnswers: [
            "quotes",
            "square brackets",
            "curly braces"
        ]
    },
    {
        question: "Arrays in JavaScript can be used to store ______.",
        correctAnswer: "all of the above",
        incorrectAnswers: [
            "numbers and strings",
            "other arrays",
            "booleans"
        ]
    },
    {
        question: "String values must be enclosed within ______ when being assigned to variables.",
        correctAnswer: "quotes",
        incorrectAnswers: [
            "commas",
            "curly braces",
            "parentheses"
        ]
    },
    {
        question: "A very useful tool used during development and debugging for printing contnt to the debugger is:",
        correctAnswer: "console.log",
        incorrectAnswers: [
            "JavaScript",
            "terminal/bash",
            "for loops"
        ]
    }
];

/**
 * @param {any[]} arr 
 */
function shuffle(arr) {
    let shuffled = [];
    let indices = arr.map((_v, i) => i);
    while (indices.length > 0) {
        let index = indices.splice(randInt(0, indices.length), 1)[0];
        shuffled.push(arr[index]);
    }

    return shuffled;
}

/**
 * @param {number} lo 
 * @param {number} hi 
 */
function randInt(lo, hi) {
    return lo + Math.floor(Math.random() * (hi - lo)) | 0
}


