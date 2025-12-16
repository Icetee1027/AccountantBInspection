// 載入題目資料
let questionsData = [];

async function loadQuestionsData() {
    try {
        const response = await fetch('questions_by_chapter.json');
        questionsData = await response.json();
        return questionsData;
    } catch (error) {
        console.error('載入題目資料失敗:', error);
        return [];
    }
}

// 初始化時載入資料
loadQuestionsData();

