const startButton = document.getElementById('startButton');
const questionContainer = document.getElementById('question-container');
const answerContainer = document.getElementById('answer-container');
const speechRecognition = new webkitSpeechRecognition();

let correct = false;
let correctCount = 0;
let incorrectCount = 0;
let totalSeconds = 0;

startButton.addEventListener('click', startGame);

function startGame() {
    startButton.disabled = true;
    startRecognition();
    getNewQuestion(0);
}

function getNewQuestion(index) {
    const number1 = Math.floor(Math.random() * 5) + 1;
    const number2 = 5 - number1;
    const question = `What is ${number1} + ${number2}?`;
    const correctAnswer = number1 + number2;
    const stats = localStorage.getItem('stats');
    if (stats) {
        const statsObj = JSON.parse(stats);
        statsObj[index] = {
            question: question,
            correctAnswer: correctAnswer,
            attemptTime: null,
        };
        localStorage.setItem('stats', JSON.stringify(statsObj));
    } else {
        localStorage.setItem('stats', JSON.stringify({
            [index]: {
                question: question,
                correctAnswer: correctAnswer,
                attemptTime: null,
            },
        }));
    }
    questionContainer.textContent = question;
    speechRecognition.start();
}

function startRecognition() {
    speechRecognition.continuous = false;
    speechRecognition.lang = 'en-US';
    speechRecognition.maxResults = 1;
    speechRecognition.onresult = (event) => {
        const transcription = event.results[0][0].transcript.toLowerCase();
        const trimmedTranscription = transcription.trim();
        const number = parseFloat(trimmedTranscription);
        if (!isNaN(number)) {
            endRecognition();
            checkAnswer(number);
        } else {
            getNewQuestion(0);
        }
    };

    speechRecognition.onerror = (event) => {
        if (event.error === 'no-speech') {
            endRecognition();
            getNewQuestion(0);
        }
    };

    speechRecognition.onend = (event) => {
        speechRecognition.abort();
    };
}

function endRecognition() {
    startButton.disabled = false;
    speechRecognition.stop();
    speechRecognition.abort();
}

function checkAnswer(guessedAnswer) {
    const stats = localStorage.getItem('stats');
    const statsObj = JSON.parse(stats);
    const question = statsObj[0].question;
    const correctAnswer = statsObj[0].correctAnswer;
    const start = new Date().getTime();
    if (guessedAnswer === correctAnswer) {
        correct = true;
        correctCount++;
    } else {
        correct = false;
        incorrectCount++;
    }
    totalSeconds += (new Date().getTime() - start) / 1000;
    answerContainer.innerHTML = `<p>You said: ${guessedAnswer}</p>`;
    const result = document.createElement('p');
    if (correct) {
        result.textContent = 'Correct!';
        result.style.color = 'green';
    } else {
        result.textContent = `Sorry, the correct answer is ${correctAnswer}.`;
        result.style.color = 'red';
    }
    answerContainer.appendChild(result);
    setTimeout(() => {
        startButton.disabled = false;
        correct = false;
        questionContainer.textContent = ``;
        answerContainer.innerHTML = ``;
        if (statsObj.length < 15) {
            getNewQuestion(statsObj.length);
        } else {
            displayStats();
        }
    }, 2000);
}

function displayStats() {
    const stats = localStorage.getItem('stats');
    const statsObj = JSON.parse(stats);
    const averageCorrectness = correctCount / (correctCount + incorrectCount);
    const averageSeconds = totalSeconds / (correctCount + incorrectCount);
    const statsHtml = `
        <p>Correct answers: ${correctCount}</p>
        <p>Incorrect answers: ${incorrectCount}</p>
        <p>Average correctness: ${averageCorrectness.toFixed(2)}%</p>
        <p>Average seconds per question: ${averageSeconds.toFixed(2)} seconds</p>
    `;
    const statsContainer = document.createElement('div');
    statsContainer.innerHTML = statsHtml;
    answerContainer.appendChild(statsContainer);
    startButton.disabled = false;
}