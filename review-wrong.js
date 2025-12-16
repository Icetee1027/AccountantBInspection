let allWrongQuestions = [];
let selectedQuestionCount = 0;
let reviewQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];

// 獲取錯誤列表（從 localStorage）
function getWrongQuestionsList() {
    return JSON.parse(localStorage.getItem('wrongQuestionsList') || '[]');
}

// 保存錯誤列表（到 localStorage）
function saveWrongQuestionsList(questions) {
    localStorage.setItem('wrongQuestionsList', JSON.stringify(questions));
}

// 初始化：載入錯誤列表
function initWrongQuestions() {
    // 從 localStorage 載入錯誤列表，不重新收集
    allWrongQuestions = getWrongQuestionsList();
    
    // 更新錯誤題目數量顯示
    document.getElementById('wrongCount').textContent = allWrongQuestions.length;
    
    // 生成題數選擇按鈕
    generateCountButtons();
    
    if (allWrongQuestions.length === 0) {
        document.getElementById('questionCountSelection').innerHTML = 
            '<h2>錯誤重做</h2><p style="text-align: center; color: #666; padding: 40px;">目前沒有錯誤題目可以複習！</p>';
    }
}

// 生成題數選擇按鈕
function generateCountButtons() {
    const countButtons = document.getElementById('countButtons');
    countButtons.innerHTML = '';
    
    const maxCount = allWrongQuestions.length;
    const options = [10, 20, 30, 40, 50];
    
    options.forEach(count => {
        if (count <= maxCount) {
            const button = document.createElement('button');
            button.className = 'count-button';
            button.textContent = `${count}題`;
            button.onclick = () => selectQuestionCount(count);
            countButtons.appendChild(button);
        }
    });
    
    // 如果最大題數小於50，也顯示最大題數選項
    if (maxCount > 0 && maxCount < 50 && !options.includes(maxCount)) {
        const button = document.createElement('button');
        button.className = 'count-button';
        button.textContent = `${maxCount}題`;
        button.onclick = () => selectQuestionCount(maxCount);
        countButtons.appendChild(button);
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
    
    // 開始複習
    startReview();
}

// 開始複習
function startReview() {
    if (selectedQuestionCount === 0) {
        alert('請選擇題目數量！');
        return;
    }
    
    if (allWrongQuestions.length === 0) {
        alert('沒有錯誤題目可以複習！');
        return;
    }
    
    // 隨機選擇指定數量的錯誤題目
    reviewQuestions = [];
    userAnswers = [];
    
    // 複製錯誤題目陣列並隨機排序
    const shuffled = [...allWrongQuestions].sort(() => Math.random() - 0.5);
    
    const maxQuestions = Math.min(selectedQuestionCount, allWrongQuestions.length);
    
    for (let i = 0; i < maxQuestions; i++) {
        reviewQuestions.push(shuffled[i]);
        userAnswers.push(null);
    }
    
    currentQuestionIndex = 0;
    
    // 顯示題目容器
    document.getElementById('questionCountSelection').style.display = 'none';
    document.getElementById('questionContainer').style.display = 'block';
    
    // 顯示第一題
    showQuestion();
}

// 顯示題目
function showQuestion() {
    const question = reviewQuestions[currentQuestionIndex];
    
    // 更新題目顯示
    document.getElementById('questionNumber').textContent = 
        `題目 ${currentQuestionIndex + 1} / ${reviewQuestions.length}`;
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
        currentQuestionIndex < reviewQuestions.length - 1 ? 'block' : 'none';
    
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
    if (currentQuestionIndex < reviewQuestions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    }
}

// 提交複習
function submitReview() {
    // 計算分數
    let correctCount = 0;
    const correctQuestionKeys = []; // 記錄答對的題目
    
    reviewQuestions.forEach((question, index) => {
        if (userAnswers[index] === question.answer) {
            correctCount++;
            correctQuestionKeys.push(question.questionKey);
        }
    });
    
    const score = Math.round((correctCount / reviewQuestions.length) * 100);
    
    // 從錯誤列表中永久刪除答對的題目
    allWrongQuestions = allWrongQuestions.filter(q => 
        !correctQuestionKeys.includes(q.questionKey)
    );
    
    // 保存更新後的錯誤列表
    saveWrongQuestionsList(allWrongQuestions);
    
    // 更新顯示
    document.getElementById('wrongCount').textContent = allWrongQuestions.length;
    
    // 顯示結果
    showResult(correctCount, score);
}

// 顯示結果
function showResult(correctCount, score) {
    document.getElementById('questionContainer').style.display = 'none';
    document.getElementById('resultContainer').style.display = 'block';
    
    document.getElementById('resultScore').textContent = 
        `${correctCount} / ${reviewQuestions.length} (${score}分)`;
    document.getElementById('resultText').textContent = 
        `答對 ${correctCount} 題，答錯 ${reviewQuestions.length - correctCount} 題。`;
    
    // 顯示所有題目和答案
    const resultQuestions = document.getElementById('resultQuestions');
    resultQuestions.innerHTML = '<h3 style="margin-bottom: 20px; color: #333;">題目詳情：</h3>';
    
    reviewQuestions.forEach((q, index) => {
        const isCorrect = userAnswers[index] === q.answer;
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
            } else if (optionValue === userAnswers[index] && !isCorrect) {
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
            
            if (optionValue === userAnswers[index] && !isCorrect) {
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

// 返回選擇
function goBackToSelection() {
    document.getElementById('questionCountSelection').style.display = 'block';
    document.getElementById('questionContainer').style.display = 'none';
    document.getElementById('resultContainer').style.display = 'none';
    currentQuestionIndex = 0;
    selectedQuestionCount = 0;
    userAnswers = [];
    reviewQuestions = [];
    
    // 重新載入錯誤列表
    initWrongQuestions();
}

// 鍵盤快捷鍵處理
function handleReviewKeyboard(event) {
    // 只在題目顯示時才處理
    const questionContainer = document.getElementById('questionContainer');
    if (questionContainer.style.display === 'none') return;
    
    // 檢查是否在輸入框中（避免干擾）
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
    }
    
    const key = event.key;
    
    // 數字鍵 1-4 選擇答案
    if (key >= '1' && key <= '4' && !event.shiftKey && !event.ctrlKey && !event.altKey) {
        const optionValue = parseInt(key);
        const buttons = document.querySelectorAll('.option-button');
        if (buttons.length >= optionValue) {
            buttons[optionValue - 1].click();
        }
    }
    
    // Enter 鍵下一題（如果還有下一題）
    if (key === 'Enter' && currentQuestionIndex < reviewQuestions.length - 1) {
        const nextBtn = document.getElementById('nextButton');
        if (nextBtn.style.display === 'block') {
            event.preventDefault();
            nextQuestion();
        }
    }
}

// 頁面載入時初始化
window.addEventListener('DOMContentLoaded', () => {
    initWrongQuestions();
    // 監聽鍵盤事件
    document.addEventListener('keydown', handleReviewKeyboard);
    // 讓題目容器可以接收焦點
    document.getElementById('questionContainer').setAttribute('tabindex', '0');
});
