// 角色系统测试脚本
const GameEngine = require('./src/js/engine.js').GameEngineInstance;
const ResponseParser = require('./src/js/responseParser.js');

async function testCharacterSystem() {
    console.log('开始测试角色系统...');
    
    try {
        // 初始化游戏引擎
        console.log('初始化游戏引擎...');
        await GameEngine.initialize();
        console.log('游戏引擎初始化成功');
        
        // 测试1: 注册新角色
        console.log('\n测试1: 注册新角色');
        const registerCharacterResponse = `
===GAME_DATA_START===
节拍操作：推进
当前景深等级：3
当前时间：1925-12-26 10:00:00
注册角色：{"name":"艾米","memoryPoints":"紫色眼睛，总是带着一本魔法书","description":"年轻的魔法师学徒","template":"法师","relationship":"朋友","thingsDone":["学习魔法","帮助玩家"]}
===GAME_DATA_END===
        `;
        
        const registerParseResult = ResponseParser.parseResponse(registerCharacterResponse);
        console.log('解析注册角色请求:', JSON.stringify(registerParseResult.dataRequests, null, 2));
        
        await GameEngine.processAIResponse(registerCharacterResponse);
        console.log('注册角色成功');
        
        // 测试2: 更新角色
        console.log('\n测试2: 更新角色');
        const updateCharacterResponse = `
===GAME_DATA_START===
节拍操作：维持
当前景深等级：3
当前时间：1925-12-27 15:00:00
更新角色：{"name":"艾米","memoryPoints":"紫色眼睛，总是带着一本魔法书","description":"年轻的魔法师学徒，正在研究高级法术","template":"法师","relationship":"朋友","thingsDone":["学习魔法","帮助玩家","研究高级法术"]}
===GAME_DATA_END===
        `;
        
        const updateParseResult = ResponseParser.parseResponse(updateCharacterResponse);
        console.log('解析更新角色请求:', JSON.stringify(updateParseResult.dataRequests, null, 2));
        
        await GameEngine.processAIResponse(updateCharacterResponse);
        console.log('更新角色成功');
        
        // 测试3: 快捷添加做过的事
        console.log('\n测试3: 快捷添加做过的事');
        const addThingDoneResponse = `
===GAME_DATA_START===
节拍操作：维持
当前景深等级：3
当前时间：1925-12-30 10:00:00
添加角色做过的事：艾米，学会了火球术
===GAME_DATA_END===
        `;
        
        const addThingDoneParseResult = ResponseParser.parseResponse(addThingDoneResponse);
        console.log('解析添加做过的事请求:', JSON.stringify(addThingDoneParseResult.dataRequests, null, 2));
        
        await GameEngine.processAIResponse(addThingDoneResponse);
        console.log('添加做过的事成功');
        
        // 测试4: 删除角色
        console.log('\n测试4: 删除角色');
        const deleteCharacterResponse = `
===GAME_DATA_START===
节拍操作：推进
当前景深等级：3
当前时间：1925-12-31 00:00:00
删除角色：艾米
===GAME_DATA_END===
        `;
        
        const deleteParseResult = ResponseParser.parseResponse(deleteCharacterResponse);
        console.log('解析删除角色请求:', JSON.stringify(deleteParseResult.dataRequests, null, 2));
        
        await GameEngine.processAIResponse(deleteCharacterResponse);
        console.log('删除角色成功');
        
        // 获取当前游戏数据，验证测试结果
        const gameData = GameEngine.getGameData();
        console.log('\n当前游戏数据:', JSON.stringify(gameData, null, 2));
        
        console.log('\n角色系统测试完成！');
        
    } catch (error) {
        console.error('测试角色系统错误:', error);
    }
}

// 运行测试
testCharacterSystem();
