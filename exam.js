let selectedChapters = [];
let selectedQuestionCount = 0;
let examQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let usedQuestionIds = new Set();

// 初始化章節選擇
async function initChapterSelection() {
    const data = await loadQuestionsData();
    const chapterGrid = document.getElementById('chapterGrid');
    chapterGrid.innerHTML = '';
    
    data.forEach(chapter => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `chapter-${chapter.chapter}`;
        checkbox.className = 'chapter-checkbox';
        checkbox.value = chapter.chapter;
        checkbox.addEventListener('change', updateSelectedChapters);
        
        const label = document.createElement('label');
        label.htmlFor = `chapter-${chapter.chapter}`;
        label.className = 'chapter-label';
        label.textContent = `第${chapter.chapter}章`;
        
        chapterGrid.appendChild(checkbox);
        chapterGrid.appendChild(label);
    });
}

function updateSelectedChapters() {
    selectedChapters = Array.from(document.querySelectorAll('.chapter-checkbox:checked'))
        .map(cb => parseInt(cb.value));
    
    if (selectedChapters.length > 0) {
        document.getElementById('questionCountSelection').style.display = 'block';
    } else {
        document.getElementById('questionCountSelection').style.display = 'none';
    }
}

// 選擇題目數量
function selectQuestionCount(count) {
    selectedQuestionCount = count;
    
    // 更新按鈕樣式
    document.querySelectorAll('.count-button').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    // 開始考試
    startExam();
}

// 開始考試
function startExam() {
    if (selectedChapters.length === 0) {
        alert('請至少選擇一個章節！');
        return;
    }
    
    if (selectedQuestionCount === 0) {
        alert('請選擇題目數量！');
        return;
    }
    
    // 收集選中章節的所有題目
    const allQuestions = [];
    questionsData.forEach(chapter => {
        if (selectedChapters.includes(chapter.chapter)) {
            chapter.questions.forEach(q => {
                allQuestions.push({
                    ...q,
                    chapter: chapter.chapter
                });
            });
        }
    });
    
    if (allQuestions.length === 0) {
        alert('選中的章節沒有題目！');
        return;
    }
    
    // 隨機選擇指定數量的題目（不重複）
    usedQuestionIds.clear();
    examQuestions = [];
    userAnswers = [];
    
    const maxQuestions = Math.min(selectedQuestionCount, allQuestions.length);
    
    while (examQuestions.length < maxQuestions) {
        const randomIndex = Math.floor(Math.random() * allQuestions.length);
        const question = allQuestions[randomIndex];
        const questionKey = `${question.chapter}-${question.id}`;
        
        if (!usedQuestionIds.has(questionKey)) {
            usedQuestionIds.add(questionKey);
            examQuestions.push(question);
            userAnswers.push(null); // 初始化答案為null
        }
    }
    
    currentQuestionIndex = 0;
    
    // 顯示題目容器
    document.getElementById('chapterSelection').style.display = 'none';
    document.getElementById('questionCountSelection').style.display = 'none';
    document.getElementById('questionContainer').style.display = 'block';
    
    // 顯示第一題
    showQuestion();
}

// 顯示題目
function showQuestion() {
    const question = examQuestions[currentQuestionIndex];
    
    // 更新題目顯示
    document.getElementById('questionNumber').textContent = 
        `題目 ${currentQuestionIndex + 1} / ${examQuestions.length}`;
    document.getElementById('questionText').textContent = question.question;
    
    // 顯示選項（選項順序固定，不打亂）
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    const optionKeys = ['1', '2', '3', '4'];
    optionKeys.forEach(key => {
        const button = document.createElement('button');
        button.className = 'option-button';
        const optionValue = parseInt(key);
        
        // 如果已經選擇過，顯示選中狀態
        if (userAnswers[currentQuestionIndex] === optionValue) {
            button.style.background = '#e3f2fd';
            button.style.borderColor = '#667eea';
        }
        
        button.textContent = `${key}. ${question.options[key]}`;
        button.onclick = () => selectOption(button, optionValue);
        optionsContainer.appendChild(button);
    });
    
    // 更新導航按鈕顯示
    document.getElementById('prevButton').style.display = 
        currentQuestionIndex > 0 ? 'block' : 'none';
    document.getElementById('nextButton').style.display = 
        currentQuestionIndex < examQuestions.length - 1 ? 'block' : 'none';
    
    // 更新提交按鈕顯示
    const allAnswered = userAnswers.every(answer => answer !== null);
    document.getElementById('submitButton').style.display = 
        allAnswered ? 'block' : 'none';
    
    // 聚焦到題目容器，確保鍵盤事件可以觸發
    document.getElementById('questionContainer').focus();
}

// 選擇選項（不立即顯示答案）
function selectOption(button, selectedAnswer) {
    // 保存答案
    userAnswers[currentQuestionIndex] = selectedAnswer;
    
    // 更新按鈕樣式
    const allButtons = document.querySelectorAll('.option-button');
    allButtons.forEach(btn => {
        btn.style.background = '#f8f9fa';
        btn.style.borderColor = '#ddd';
    });
    button.style.background = '#e3f2fd';
    button.style.borderColor = '#667eea';
    
    // 檢查是否所有題目都已作答
    const allAnswered = userAnswers.every(answer => answer !== null);
    document.getElementById('submitButton').style.display = 
        allAnswered ? 'block' : 'none';
    
    // 自動跳到下一題（可選，這裡改為手動）
    // 如果需要自動跳轉，可以取消下面的註解
    // setTimeout(() => {
    //     if (currentQuestionIndex < examQuestions.length - 1) {
    //         currentQuestionIndex++;
    //         showQuestion();
    //     }
    // }, 500);
}

// 上一題
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
}

// 下一題
function nextQuestion() {
    if (currentQuestionIndex < examQuestions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    }
}

// 提交考試
function submitExam() {
    // 計算分數
    let correctCount = 0;
    examQuestions.forEach((question, index) => {
        if (userAnswers[index] === question.answer) {
            correctCount++;
        }
    });
    
    const score = Math.round((correctCount / examQuestions.length) * 100);
    
    // 保存到歷史紀錄
    const examResult = {
        date: new Date().toISOString(),
        chapters: selectedChapters,
        totalQuestions: examQuestions.length,
        correctCount: correctCount,
        score: score,
        questions: examQuestions.map((q, index) => ({
            ...q,
            userAnswer: userAnswers[index],
            isCorrect: userAnswers[index] === q.answer
        }))
    };
    
    // 保存到 localStorage
    let history = JSON.parse(localStorage.getItem('examHistory') || '[]');
    history.unshift(examResult); // 最新的放在最前面
    localStorage.setItem('examHistory', JSON.stringify(history));
    
    // 將答錯的題目加入錯誤列表
    addWrongQuestionsToList(examResult.questions);
    
    // 顯示結果
    showResult(examResult);
}

// 顯示結果
function showResult(result) {
    document.getElementById('questionContainer').style.display = 'none';
    document.getElementById('resultContainer').style.display = 'block';
    
    document.getElementById('resultScore').textContent = 
        `${result.correctCount} / ${result.totalQuestions} (${result.score}分)`;
    document.getElementById('resultText').textContent = 
        `答對 ${result.correctCount} 題，答錯 ${result.totalQuestions - result.correctCount} 題`;
    
    // 顯示所有題目和答案
    const resultQuestions = document.getElementById('resultQuestions');
    resultQuestions.innerHTML = '<h3 style="margin-bottom: 20px; color: #333;">題目詳情：</h3>';
    
    result.questions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'history-question';
        questionDiv.style.marginBottom = '20px';
        
        const questionText = document.createElement('div');
        questionText.className = 'history-question-text';
        questionText.textContent = `${index + 1}. ${q.question}`;
        questionDiv.appendChild(questionText);
        
        // 顯示選項
        const optionKeys = ['1', '2', '3', '4'];
        optionKeys.forEach(key => {
            const optionValue = parseInt(key);
            const answerDiv = document.createElement('div');
            answerDiv.className = 'history-answer';
            
            if (optionValue === q.answer) {
                answerDiv.classList.add('correct');
            } else if (optionValue === q.userAnswer && !q.isCorrect) {
                answerDiv.classList.add('incorrect');
            }
            
            const label = document.createElement('span');
            label.className = 'answer-label';
            label.textContent = `${key}. ${q.options[key]}`;
            answerDiv.appendChild(label);
            
            if (optionValue === q.answer) {
                const correctBadge = document.createElement('span');
                correctBadge.textContent = '✓ 正確答案';
                correctBadge.style.color = '#28a745';
                correctBadge.style.fontWeight = '600';
                answerDiv.appendChild(correctBadge);
            }
            
            if (optionValue === q.userAnswer && !q.isCorrect) {
                const wrongBadge = document.createElement('span');
                wrongBadge.textContent = '✗ 您的答案';
                wrongBadge.style.color = '#dc3545';
                wrongBadge.style.fontWeight = '600';
                answerDiv.appendChild(wrongBadge);
            }
            
            questionDiv.appendChild(answerDiv);
        });
        
        resultQuestions.appendChild(questionDiv);
    });
}

// 返回章節選擇
function goBackToSelection() {
    document.getElementById('chapterSelection').style.display = 'block';
    document.getElementById('questionCountSelection').style.display = 'none';
    document.getElementById('questionContainer').style.display = 'none';
    document.getElementById('resultContainer').style.display = 'none';
    currentQuestionIndex = 0;
    usedQuestionIds.clear();
    selectedQuestionCount = 0;
    userAnswers = [];
}

// 鍵盤快捷鍵處理
function handleExamKeyboard(event) {
    // 只在題目顯示時才處理
    const questionContainer = document.getElementById('questionContainer');
    if (questionContainer.style.display === 'none') return;
    
    // 檢查是否在輸入框中（避免干擾）
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
    }
    
    const key = event.key;
    
    // 數字鍵 1-4 選擇答案（只接受鍵盤頂部的數字鍵，不是小鍵盤）
    if (key >= '1' && key <= '4' && !event.shiftKey && !event.ctrlKey && !event.altKey) {
        const optionValue = parseInt(key);
        const buttons = document.querySelectorAll('.option-button');
        if (buttons.length >= optionValue) {
            buttons[optionValue - 1].click();
        }
    }
    
    // Enter 鍵下一題（如果還有下一題）
    if (key === 'Enter' && currentQuestionIndex < examQuestions.length - 1) {
        const nextBtn = document.getElementById('nextButton');
        if (nextBtn.style.display === 'block') {
            event.preventDefault();
            nextQuestion();
        }
    }
}

// 將答錯的題目加入錯誤列表
function addWrongQuestionsToList(questions) {
    // 獲取現有的錯誤列表
    let wrongQuestionsList = JSON.parse(localStorage.getItem('wrongQuestionsList') || '[]');
    const existingKeys = new Set(wrongQuestionsList.map(q => `${q.chapter}-${q.id}`));
    
    // 找出答錯的題目並加入列表
    questions.forEach(q => {
        // 檢查是否答錯
        if (q.userAnswer !== undefined && q.answer !== undefined && q.userAnswer !== q.answer) {
            const questionKey = `${q.chapter}-${q.id}`;
            
            // 如果題目不在列表中，就加入
            if (!existingKeys.has(questionKey)) {
                wrongQuestionsList.push({
                    ...q,
                    questionKey: questionKey
                });
                existingKeys.add(questionKey);
            }
        }
    });
    
    // 保存更新後的錯誤列表
    localStorage.setItem('wrongQuestionsList', JSON.stringify(wrongQuestionsList));
}

// 頁面載入時初始化
window.addEventListener('DOMContentLoaded', () => {
    initChapterSelection();
    // 監聽鍵盤事件
    document.addEventListener('keydown', handleExamKeyboard);
    // 讓題目容器可以接收焦點
    document.getElementById('questionContainer').setAttribute('tabindex', '0');
});

