// 角色模板验证测试脚本
const GameEngine = require('./src/js/engine.js').GameEngineInstance;
const ResponseParser = require('./src/js/responseParser.js');

async function testCharacterTemplateValidation() {
    console.log('开始测试角色模板验证...');
    
    try {
        // 初始化游戏引擎
        console.log('初始化游戏引擎...');
        await GameEngine.initialize();
        console.log('游戏引擎初始化成功');
        
        // 测试1: 使用有效模板注册角色
        console.log('\n测试1: 使用有效模板注册角色');
        const validTemplateResponse = `
===GAME_DATA_START===
节拍操作：推进
当前景深等级：3
当前时间：1925-12-26 10:00:00
注册角色：{"name":"测试角色1","memoryPoints":"测试记忆点","description":"测试角色描述","template":"蝶","relationship":"朋友","thingsDone":["测试做过的事"]}
===GAME_DATA_END===
        `;
        
        const validParseResult = ResponseParser.parseResponse(validTemplateResponse);
        console.log('解析注册角色请求:', JSON.stringify(validParseResult.dataRequests, null, 2));
        
        await GameEngine.processAIResponse(validTemplateResponse);
        console.log('使用有效模板注册角色成功');
        
        // 测试2: 使用无效模板注册角色
        console.log('\n测试2: 使用无效模板注册角色');
        const invalidTemplateResponse = `
===GAME_DATA_START===
节拍操作：维持
当前景深等级：3
当前时间：1925-12-27 15:00:00
注册角色：{"name":"测试角色2","memoryPoints":"测试记忆点","description":"测试角色描述","template":"无效模板","relationship":"朋友","thingsDone":["测试做过的事"]}
===GAME_DATA_END===
        `;
        
        const invalidParseResult = ResponseParser.parseResponse(invalidTemplateResponse);
        console.log('解析注册角色请求:', JSON.stringify(invalidParseResult.dataRequests, null, 2));
        
        await GameEngine.processAIResponse(invalidTemplateResponse);
        console.log('使用无效模板注册角色成功（应被随机替换为有效模板）');
        
        // 测试3: 使用无效模板更新角色
        console.log('\n测试3: 使用无效模板更新角色');
        const updateInvalidTemplateResponse = `
===GAME_DATA_START===
节拍操作：推进
当前景深等级：3
当前时间：1925-12-28 10:00:00
更新角色：{"name":"测试角色1","memoryPoints":"测试记忆点","description":"测试角色描述","template":"另一个无效模板","relationship":"朋友","thingsDone":["测试做过的事"]}
===GAME_DATA_END===
        `;
        
        const updateInvalidParseResult = ResponseParser.parseResponse(updateInvalidTemplateResponse);
        console.log('解析更新角色请求:', JSON.stringify(updateInvalidParseResult.dataRequests, null, 2));
        
        await GameEngine.processAIResponse(updateInvalidTemplateResponse);
        console.log('使用无效模板更新角色成功（应被随机替换为有效模板）');
        
        // 获取当前游戏数据，验证测试结果
        const gameData = GameEngine.getGameData();
        console.log('\n当前游戏数据:', JSON.stringify(gameData, null, 2));
        
        console.log('\n角色模板验证测试完成！');
        
    } catch (error) {
        console.error('测试角色模板验证错误:', error);
    }
}

// 运行测试
testCharacterTemplateValidation();
