// 测试节拍系统扩展功能
const { GameEngine } = require('./src/js/engine');

// 模拟数据管理模块
class MockDataManager {
    readData() {
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
}

// 测试函数
function testBeatSystem() {
    console.log('开始测试节拍系统扩展功能...');
    
    // 创建游戏引擎实例
    const engine = new GameEngine();
    
    // 注入模拟依赖
    engine.dataManager = new MockDataManager();
    
    // 直接设置游戏数据
    engine.gameData = engine.dataManager.getDefaultData();
    
    console.log('游戏引擎准备就绪');
    
    // 测试1: 在起节拍使用【节拍操作：完结】
    console.log('\n测试1: 在起节拍使用【节拍操作：完结】');
    engine.gameData = engine.dataManager.getDefaultData();
    console.log('当前节拍:', engine.gameData.narrative.storyBeat);
    const result1 = engine.processStoryBeatOperation('完结');
    console.log('操作结果:', result1);
    console.log('更新后节拍:', engine.gameData.narrative.storyBeat);
    console.log('更新后时间:', engine.gameData.metadata.currentTime);
    
    // 测试2: 在承节拍使用【节拍操作：完结】
    console.log('\n测试2: 在承节拍使用【节拍操作：完结】');
    engine.gameData = engine.dataManager.getDefaultData();
    engine.gameData.narrative.storyBeat = '承';
    console.log('当前节拍:', engine.gameData.narrative.storyBeat);
    const result2 = engine.processStoryBeatOperation('完结');
    console.log('操作结果:', result2);
    console.log('更新后节拍:', engine.gameData.narrative.storyBeat);
    console.log('更新后时间:', engine.gameData.metadata.currentTime);
    
    // 测试3: 在转节拍使用【节拍操作：完结】
    console.log('\n测试3: 在转节拍使用【节拍操作：完结】');
    engine.gameData = engine.dataManager.getDefaultData();
    engine.gameData.narrative.storyBeat = '转';
    console.log('当前节拍:', engine.gameData.narrative.storyBeat);
    const result3 = engine.processStoryBeatOperation('完结');
    console.log('操作结果:', result3);
    console.log('更新后节拍:', engine.gameData.narrative.storyBeat);
    console.log('更新后时间:', engine.gameData.metadata.currentTime);
    
    // 测试4: 在合节拍使用【节拍操作：完结】
    console.log('\n测试4: 在合节拍使用【节拍操作：完结】');
    engine.gameData = engine.dataManager.getDefaultData();
    engine.gameData.narrative.storyBeat = '合';
    console.log('当前节拍:', engine.gameData.narrative.storyBeat);
    const result4 = engine.processStoryBeatOperation('完结');
    console.log('操作结果:', result4);
    console.log('更新后节拍:', engine.gameData.narrative.storyBeat);
    console.log('更新后时间:', engine.gameData.metadata.currentTime);
    
    // 测试5: 在终幕使用【节拍操作：完结】
    console.log('\n测试5: 在终幕使用【节拍操作：完结】');
    engine.gameData = engine.dataManager.getDefaultData();
    engine.gameData.narrative.storyBeat = '终幕';
    console.log('当前节拍:', engine.gameData.narrative.storyBeat);
    const result5 = engine.processStoryBeatOperation('完结');
    console.log('操作结果:', result5);
    console.log('更新后节拍:', engine.gameData.narrative.storyBeat);
    console.log('更新后时间:', engine.gameData.metadata.currentTime);
    
    // 测试6: 在后日谈使用节拍操作
    console.log('\n测试6: 在后日谈使用节拍操作');
    engine.gameData = engine.dataManager.getDefaultData();
    engine.gameData.narrative.storyBeat = '后日谈';
    console.log('当前节拍:', engine.gameData.narrative.storyBeat);
    const result6 = engine.processStoryBeatOperation('推进');
    console.log('推进操作结果:', result6);
    const result7 = engine.processStoryBeatOperation('完结');
    console.log('完结操作结果:', result7);
    console.log('更新后节拍:', engine.gameData.narrative.storyBeat);
    
    console.log('\n节拍系统扩展功能测试完成！');
}

// 运行测试
testBeatSystem().catch(error => {
    console.error('测试错误:', error);
});
