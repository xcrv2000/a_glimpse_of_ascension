// 事件注册功能测试脚本
// 此脚本用于测试事件注册、更新、删除功能是否正常工作

// 模拟游戏引擎初始化
async function testEventSystem() {
    console.log('开始测试事件注册功能...');
    
    try {
        // 初始化游戏引擎
        const engine = GameEngineInstance;
        await engine.initialize();
        console.log('游戏引擎初始化成功');
        
        // 测试1: 注册新事件
        console.log('\n测试1: 注册新事件');
        const testEvent1 = {
            name: '侦探查案',
            description: '侦探去调查神秘案件，收集线索',
            startTime: '1925-12-26 09:00:00',
            expectedEndTime: '1925-12-29 09:00:00',
            status: 'background',
            participants: ['侦探', '助手']
        };
        
        const registerResult = await engine.registerEvent(testEvent1);
        console.log('注册事件结果:', registerResult);
        
        // 获取当前游戏数据，检查事件是否已添加
        const gameData1 = engine.getGameData();
        console.log('当前事件列表:', gameData1.events);
        
        // 测试2: 更新现有事件
        console.log('\n测试2: 更新现有事件');
        const testEvent2 = {
            name: '侦探查案',
            description: '侦探深入调查神秘案件，发现了重要线索',
            expectedEndTime: '1925-12-28 09:00:00',
            status: 'foreground',
            participants: ['侦探', '助手', '玩家']
        };
        
        const updateResult = await engine.updateEvent(testEvent2);
        console.log('更新事件结果:', updateResult);
        
        // 获取当前游戏数据，检查事件是否已更新
        const gameData2 = engine.getGameData();
        console.log('更新后的事件列表:', gameData2.events);
        
        // 测试3: 删除事件
        console.log('\n测试3: 删除事件');
        const deleteResult = await engine.deleteEvent('侦探查案');
        console.log('删除事件结果:', deleteResult);
        
        // 获取当前游戏数据，检查事件是否已删除
        const gameData3 = engine.getGameData();
        console.log('删除后的事件列表:', gameData3.events);
        
        // 测试4: 测试事件时间管理
        console.log('\n测试4: 测试事件时间管理');
        // 注册一个即将结束的事件
        const testEvent4 = {
            name: '限时任务',
            description: '一个即将结束的任务',
            startTime: '1925-12-26 09:00:00',
            expectedEndTime: '1925-12-26 09:00:00', // 与当前时间相同
            status: 'foreground',
            participants: ['玩家']
        };
        
        await engine.registerEvent(testEvent4);
        console.log('注册限时任务事件');
        
        // 检查事件时间状态
        await engine.checkEventTimeStatus();
        const gameData4 = engine.getGameData();
        console.log('检查时间状态后的事件列表:', gameData4.events);
        
        console.log('\n所有测试完成!');
        
    } catch (error) {
        console.error('测试过程中发生错误:', error);
    }
}

// 运行测试
if (typeof window !== 'undefined') {
    // 在浏览器环境中运行
    window.testEventSystem = testEventSystem;
    console.log('测试脚本已加载，请运行 testEventSystem() 来测试事件注册功能');
} else {
    // 在Node.js环境中运行
    testEventSystem();
}