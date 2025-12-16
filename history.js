let currentFilter = 'all';
let filteredHistory = [];
let allHistory = []; // 儲存完整的歷史紀錄

// 載入歷史紀錄
function loadHistory() {
    allHistory = JSON.parse(localStorage.getItem('examHistory') || '[]');
    displayHistory(allHistory);
}

// 顯示歷史紀錄
function displayHistory(history) {
    const historyList = document.getElementById('historyList');
    
    if (history.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">尚無歷史紀錄</p>';
        return;
    }
    
    // 根據篩選條件過濾
    filteredHistory = history;
    if (currentFilter === 'wrong') {
        filteredHistory = history.filter(result => 
            result.questions.some(q => !q.isCorrect)
        );
    }
    
    if (filteredHistory.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">沒有符合條件的紀錄</p>';
        return;
    }
    
    historyList.innerHTML = '';
    
    filteredHistory.forEach((result, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const date = new Date(result.date);
        const dateStr = date.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const wrongCount = result.questions.filter(q => !q.isCorrect).length;
        const uniqueId = result.date + '-' + index; // 使用日期和索引作為唯一ID
        
        historyItem.innerHTML = `
            <div class="history-header">
                <div>
                    <div class="history-date">${dateStr}</div>
                    <div style="margin-top: 5px; color: #666;">
                        章節：第${result.chapters.join('、')}章
                    </div>
                </div>
                <div class="history-score">${result.score}分</div>
            </div>
            <div class="history-details">
                <div style="margin-bottom: 15px; color: #666;">
                    總題數：${result.totalQuestions} | 
                    答對：${result.correctCount} | 
                    答錯：${wrongCount}
                </div>
                <button class="btn btn-secondary" onclick="viewDetails(${index})" style="width: 100%;">
                    查看詳情
                </button>
            </div>
        `;
        
        historyList.appendChild(historyItem);
    });
}

// 查看詳情（跳轉到詳情頁面）
function viewDetails(index) {
    // 找到在完整歷史紀錄中的索引
    let actualIndex = -1;
    
    if (currentFilter === 'all') {
        actualIndex = index;
    } else {
        // 如果是篩選模式，需要找到原始索引
        if (index < filteredHistory.length) {
            actualIndex = allHistory.indexOf(filteredHistory[index]);
        }
    }
    
    if (actualIndex >= 0) {
        window.location.href = `history-detail.html?index=${actualIndex}`;
    }
}

// 篩選歷史紀錄
function filterHistory(filter) {
    currentFilter = filter;
    
    // 更新按鈕樣式
    document.querySelectorAll('.filter-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 重新載入歷史紀錄
    loadHistory();
}

// 頁面載入時載入歷史紀錄
window.addEventListener('DOMContentLoaded', loadHistory);

