document.addEventListener('DOMContentLoaded', async () => {
    let quizQuestions = [];
    let currentQuestionIndex = 0;
    let scoreList = [];
    let questionRespondidas = [];
    let questionTamanho = 0;

    // Fetch JSON data
    async function fetchQuizQuestions() {
        try {
            const response = await fetch('dados.json');
            if (!response.ok) {
                throw new Error('Erro ao buscar o JSON: ' + response.statusText);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro:', error);
            return [];
        }
    }

    // Initialize the quiz
    async function initializeQuiz() {
        quizQuestions = await fetchQuizQuestions();
        scoreList = Array(quizQuestions.length).fill(0);
        questionRespondidas = Array(quizQuestions.length).fill(0);
        questionTamanho = quizQuestions.length;
        showQuestion(quizQuestions[currentQuestionIndex]);
    }

    const questionElement = document.getElementById('question');
    const optionsElement = document.getElementById('options');
    const nextButton = document.getElementById('next-btn');
    const formElement = document.getElementById('options-form');
    const tenteNovamente = document.getElementById('button-refresh');
    const barraProgresso = document.getElementById('barra-progresso');
    const spanRespondidas = document.getElementById('qtd-respondidas');
    const spanTotalPerguntas = document.getElementById('total-perguntas');
    const qtdProgresso = document.getElementById('qtd-progresso');
    const progressBar = document.querySelector('.progress-bar');

    function showQuestion(question) {
        questionElement.textContent = question.question;
        optionsElement.innerHTML = '';
        progressBar.classList.remove('progress-bar');
        progressBar.classList.add('hidden');
        tenteNovamente.classList.remove('button-refresh');
        tenteNovamente.classList.add('hidden');
        barraProgresso.max = questionTamanho;
        spanTotalPerguntas.textContent = questionTamanho;
        question.options.forEach((option, index) => {
            const label = document.createElement('label');
            label.textContent = option;
            label.setAttribute('for', `option${index}`);
            label.classList.add('form-label');

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'option';
            input.value = option;
            input.id = `option${index}`;

            input.addEventListener('change', function() {
                const label = this.parentElement;
                if (this.checked) {
                    Array.from(formElement.querySelectorAll('input[name="option"]')).forEach(input => {
                        const otherLabel = input.parentElement;
                        if (input !== this) {
                            input.checked = false;
                            otherLabel.classList.remove('highlighted');
                        }
                    });
                    label.classList.add('highlighted');
                } else {
                    label.classList.remove('highlighted');
                }
            });

            label.prepend(input);
            optionsElement.appendChild(label);
            optionsElement.appendChild(document.createElement('br'));
        });
        nextButton.textContent = 'Confirmar';
        nextButton.classList.add('hidden');
    }

    formElement.addEventListener('change', () => {
        nextButton.classList.remove('hidden');
    });

    nextButton.addEventListener('click', confirmAnswer);

    function confirmAnswer(e) {
        e.preventDefault();
        const selectedOption = formElement.querySelector('input[name="option"]:checked');
        questionRespondidas[currentQuestionIndex] = 1;
        const statusQuestionsRespondidas = questionRespondidas.reduce((total, num) => total + num, 0);
        barraProgresso.value = statusQuestionsRespondidas;
        barraProgresso.max = questionTamanho;
        spanRespondidas.textContent = statusQuestionsRespondidas;
        spanTotalPerguntas.textContent = questionTamanho;
        if (selectedOption) {
            const isCorrect = selectedOption.value === quizQuestions[currentQuestionIndex].answer;
            Array.from(formElement.elements).forEach(element => {
                element.disabled = true;
                if (element.value === quizQuestions[currentQuestionIndex].answer) {
                    element.parentElement.style.color = 'white';
                    element.parentElement.style.backgroundColor = 'green';
                } else if (element === selectedOption && !isCorrect) {
                    element.parentElement.style.color = 'white';
                    element.parentElement.style.backgroundColor = 'red';
                }
            });
            if (isCorrect) {
                scoreList[currentQuestionIndex] = 1;
            }
            nextButton.textContent = 'Próxima';
            nextButton.removeEventListener('click', confirmAnswer);
            nextButton.addEventListener('click', goToNextQuestion);
        }
    }

    function goToNextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex < quizQuestions.length) {
            resetOptions();
            showQuestion(quizQuestions[currentQuestionIndex]);
        } else {
            showResults();
        }
    }

    function resetOptions() {
        nextButton.removeEventListener('click', goToNextQuestion);
        nextButton.addEventListener('click', confirmAnswer);
        Array.from(formElement.elements).forEach(element => {
            element.disabled = false;
            element.parentElement.style.color = '';
        });
        nextButton.textContent = 'Confirmar';
        nextButton.classList.add('hidden');
    }

    function showResults() {
        const score = scoreList.reduce((total, num) => total + num, 0);
        questionElement.style.textAlign = 'center';
        questionElement.style.paddingTop = '4rem';
        questionElement.style.paddingBottom = '4rem';
        questionElement.textContent = `Você respondeu corretamente ${score} de ${quizQuestions.length} perguntas!`;
        optionsElement.innerHTML = '';
        nextButton.classList.add('hidden');
        barraProgresso.classList.add('hidden');
        qtdProgresso.classList.add('hidden');
        progressBar.classList.remove('hidden');
        progressBar.classList.add('progress-bar');

        let status = (score/quizQuestions.length)*100;

        console.log(status)

        let progresso = status;

        const progressElement = document.getElementById('progress');
        if (progresso < 70) {
            document.documentElement.style.setProperty('--color', 'red');
        } else {
            document.documentElement.style.setProperty('--color', 'green');
        }

        document.styleSheets[0].addRule('@keyframes progress', `to { --progress-value: ${progresso}; }`);


        // Criar botão de refresh
        tenteNovamente.classList.add('button-refresh');
        tenteNovamente.addEventListener('click', function() {
            location.reload();
        });
    }

    initializeQuiz();
});








