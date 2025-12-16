let selectedChapters = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
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
}

// 開始練習
function startPractice() {
    if (selectedChapters.length === 0) {
        alert('請至少選擇一個章節！');
        return;
    }
    
    // 收集選中章節的所有題目
    currentQuestions = [];
    questionsData.forEach(chapter => {
        if (selectedChapters.includes(chapter.chapter)) {
            chapter.questions.forEach(q => {
                currentQuestions.push({
                    ...q,
                    chapter: chapter.chapter
                });
            });
        }
    });
    
    if (currentQuestions.length === 0) {
        alert('選中的章節沒有題目！');
        return;
    }
    
    // 重置已使用題目集合
    usedQuestionIds.clear();
    currentQuestionIndex = 0;
    
    // 顯示題目容器
    document.getElementById('chapterSelection').style.display = 'none';
    document.getElementById('questionContainer').style.display = 'block';
    
    // 顯示第一題
    showQuestion();
}

let currentQuestion = null; // 儲存當前題目，用於鍵盤快捷鍵

// 顯示題目
function showQuestion() {
    // 如果所有題目都用完了，重置
    if (usedQuestionIds.size >= currentQuestions.length) {
        usedQuestionIds.clear();
    }
    
    // 隨機選擇一個未使用的題目
    let availableQuestions = currentQuestions.filter(q => 
        !usedQuestionIds.has(`${q.chapter}-${q.id}`)
    );
    
    if (availableQuestions.length === 0) {
        usedQuestionIds.clear();
        availableQuestions = currentQuestions;
    }
    
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const question = availableQuestions[randomIndex];
    usedQuestionIds.add(`${question.chapter}-${question.id}`);
    currentQuestion = question; // 儲存當前題目
    
    // 更新題目顯示
    document.getElementById('questionNumber').textContent = 
        `題目 ${usedQuestionIds.size} / ${currentQuestions.length}`;
    document.getElementById('questionText').textContent = question.question;
    
    // 顯示選項（選項順序固定，不打亂）
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    const optionKeys = ['1', '2', '3', '4'];
    optionKeys.forEach(key => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = `${key}. ${question.options[key]}`;
        button.onclick = () => selectOption(button, question, parseInt(key));
        optionsContainer.appendChild(button);
    });
    
    document.getElementById('nextButton').style.display = 'none';
    
    // 聚焦到題目容器，確保鍵盤事件可以觸發
    document.getElementById('questionContainer').focus();
}

// 選擇選項（立即顯示答案）
function selectOption(button, question, selectedAnswer) {
    // 禁用所有按鈕
    const allButtons = document.querySelectorAll('.option-button');
    allButtons.forEach(btn => {
        btn.classList.add('disabled');
        btn.onclick = null;
    });
    
    // 顯示答案
    const correctAnswer = question.answer;
    allButtons.forEach((btn, index) => {
        const optionValue = index + 1;
        if (optionValue === correctAnswer) {
            btn.classList.add('correct');
        } else if (optionValue === selectedAnswer && selectedAnswer !== correctAnswer) {
            btn.classList.add('incorrect');
        }
    });
    
    // 顯示下一題按鈕
    document.getElementById('nextButton').style.display = 'block';
}

// 下一題
function nextQuestion() {
    showQuestion();
}

// 返回章節選擇
function goBackToSelection() {
    document.getElementById('chapterSelection').style.display = 'block';
    document.getElementById('questionContainer').style.display = 'none';
    currentQuestionIndex = 0;
    usedQuestionIds.clear();
}

// 鍵盤快捷鍵處理
function handlePracticeKeyboard(event) {
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
        if (buttons.length >= optionValue && !buttons[optionValue - 1].classList.contains('disabled')) {
            buttons[optionValue - 1].click();
        }
    }
    
    // Enter 鍵下一題（只在已顯示答案後）
    if (key === 'Enter' && document.getElementById('nextButton').style.display === 'block') {
        event.preventDefault();
        nextQuestion();
    }
}

// 頁面載入時初始化
window.addEventListener('DOMContentLoaded', () => {
    initChapterSelection();
    // 監聽鍵盤事件
    document.addEventListener('keydown', handlePracticeKeyboard);
    // 讓題目容器可以接收焦點
    document.getElementById('questionContainer').setAttribute('tabindex', '0');
});

