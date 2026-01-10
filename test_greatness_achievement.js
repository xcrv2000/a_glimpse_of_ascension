// 测试伟业达成后进入后日谈的逻辑
const { GameEngine } = require('./src/js/engine');

// 模拟数据管理模块
class MockDataManager {
    readData() {
        return {
            metadata: {
                currentTime: '1925-12-26 00:00:00'
            },
            narrative: {
                storyBeat: '合',
                depthLevel: '3',
                totalWords: 0
            },
            characters: [],
            events: [],
            foreshadowings: []
        };
    }

    updateDataByPath(data, path, value) {
        const parts = path.split('.');
        let current = data;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) {
                current[parts[i]] = {};
            }
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
        return data;
    }

    writeData(data) {
        return true;
    }

    writeAchievements(data) {
        return true;
    }

    getDefaultData() {
        return {
            metadata: {
                currentTime: '1925-12-26 00:00:00'
            },
            narrative: {
                storyBeat: '起',
                depthLevel: '3',
                totalWords: 0
            },
            characters: [],
            events: [],
            foreshadowings: []
        };
    }

    getDefaultAchievementsData() {
        return {
            achievements: [
                { name: '霞之伟业', isCompleted: false, isHidden: false },
                { name: '车之伟业', isCompleted: false, isHidden: false },
                { name: '塔之伟业', isCompleted: false, isHidden: false },
                { name: '绸之伟业', isCompleted: false, isHidden: false },
                { name: '雾之伟业', isCompleted: false, isHidden: false },
                { name: '灯之伟业', isCompleted: false, isHidden: false }
            ],
            completedAchievements: [],
            metadata: {
                lastUpdated: new Date().toISOString(),
                version: "1.0.0"
            }
        };
    }
}

// 测试函数
async function testGreatnessAchievement() {
    console.log('开始测试伟业达成后进入后日谈的逻辑...');
    
    // 创建游戏引擎实例
    const engine = new GameEngine();
    
    // 注入模拟依赖
    engine.dataManager = new MockDataManager();
    
    // 直接设置游戏数据
    engine.gameData = engine.dataManager.getDefaultData();
    // 设置初始节拍为合
    engine.gameData.narrative.storyBeat = '合';
    
    console.log('游戏引擎准备就绪');
    console.log('初始节拍:', engine.gameData.narrative.storyBeat);
    
    // 测试1: 达成伟业后，推进节拍进入后日谈
    console.log('\n测试1: 达成伟业后，推进节拍进入后日谈');
    console.log('当前节拍:', engine.gameData.narrative.storyBeat);
    
    // 完成一个伟业成就
    await engine.completeAchievement('霞之伟业');
    console.log('达成伟业后，hasAchievedGreatnessInCurrentGame标志:', engine.gameData.narrative.hasAchievedGreatnessInCurrentGame);
    
    // 推进节拍
    const result1 = engine.processStoryBeatOperation('推进');
    console.log('推进操作结果:', result1);
    console.log('更新后节拍:', engine.gameData.narrative.storyBeat);
    console.log('更新后时间:', engine.gameData.metadata.currentTime);
    
    // 测试2: 未达成伟业时，推进节拍进入新的起节拍
    console.log('\n测试2: 未达成伟业时，推进节拍进入新的起节拍');
    // 重置游戏数据
    engine.gameData = engine.dataManager.getDefaultData();
    engine.gameData.narrative.storyBeat = '合';
    console.log('当前节拍:', engine.gameData.narrative.storyBeat);
    
    // 推进节拍
    const result2 = engine.processStoryBeatOperation('推进');
    console.log('推进操作结果:', result2);
    console.log('更新后节拍:', engine.gameData.narrative.storyBeat);
    
    console.log('\n伟业达成后进入后日谈的逻辑测试完成！');
}

// 运行测试
testGreatnessAchievement().catch(error => {
    console.error('测试错误:', error);
});
