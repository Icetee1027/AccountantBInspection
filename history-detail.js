let currentHistory = null;
let currentFilter = 'all';

// 載入歷史紀錄詳情
function loadHistoryDetail() {
    // 從 URL 參數獲取歷史紀錄索引
    const urlParams = new URLSearchParams(window.location.search);
    const historyIndex = parseInt(urlParams.get('index'));
    
    if (isNaN(historyIndex)) {
        alert('無效的歷史紀錄！');
        window.location.href = 'history.html';
        return;
    }
    
    // 載入所有歷史紀錄
    const history = JSON.parse(localStorage.getItem('examHistory') || '[]');
    
    if (historyIndex < 0 || historyIndex >= history.length) {
        alert('找不到該歷史紀錄！');
        window.location.href = 'history.html';
        return;
    }
    
    currentHistory = history[historyIndex];
    displayHistoryDetail();
}

// 顯示歷史紀錄詳情
function displayHistoryDetail() {
    if (!currentHistory) return;
    
    const date = new Date(currentHistory.date);
    const dateStr = date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const wrongCount = currentHistory.questions.filter(q => !q.isCorrect).length;
    
    document.getElementById('historyDate').textContent = dateStr;
    document.getElementById('historyChapters').textContent = `第${currentHistory.chapters.join('、')}章`;
    document.getElementById('historyScore').textContent = `${currentHistory.score}分`;
    document.getElementById('totalQuestions').textContent = currentHistory.totalQuestions;
    document.getElementById('correctCount').textContent = currentHistory.correctCount;
    document.getElementById('wrongCount').textContent = wrongCount;
    
    filterQuestions(currentFilter);
}

// 篩選題目
function filterQuestions(filter) {
    currentFilter = filter;
    
    // 更新按鈕樣式
    document.querySelectorAll('.filter-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 過濾題目
    let questionsToShow = currentHistory.questions;
    if (filter === 'wrong') {
        questionsToShow = currentHistory.questions.filter(q => !q.isCorrect);
    }
    
    // 顯示題目
    const questionsList = document.getElementById('questionsList');
    questionsList.innerHTML = '';
    
    if (questionsToShow.length === 0) {
        questionsList.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">沒有符合條件的題目</p>';
        return;
    }
    
    questionsToShow.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'history-question';
        questionDiv.style.marginBottom = '20px';
        
        const isCorrect = q.isCorrect;
        const questionNumber = currentHistory.questions.indexOf(q) + 1;
        
        questionDiv.innerHTML = `
            <div class="history-question-text">
                ${questionNumber}. ${q.question}
            </div>
            ${['1', '2', '3', '4'].map(key => {
                const optionValue = parseInt(key);
                const isCorrectAnswer = optionValue === q.answer;
                const isUserAnswer = optionValue === q.userAnswer;
                let className = 'history-answer';
                if (isCorrectAnswer) className += ' correct';
                if (isUserAnswer && !isCorrect) className += ' incorrect';
                
                return `
                    <div class="${className}">
                        <span class="answer-label">${key}. ${q.options[key]}</span>
                        ${isCorrectAnswer ? '<span style="color: #28a745; font-weight: 600;">✓ 正確答案</span>' : ''}
                        ${isUserAnswer && !isCorrect ? '<span style="color: #dc3545; font-weight: 600;">✗ 您的答案</span>' : ''}
                    </div>
                `;
            }).join('')}
        `;
        
        questionsList.appendChild(questionDiv);
    });
}

// 頁面載入時載入詳情
window.addEventListener('DOMContentLoaded', loadHistoryDetail);

