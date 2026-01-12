// 测试地点系统
const { GameEngineInstance } = require('./src/js/engine.js');

async function testLocationSystem() {
    console.log('开始测试地点系统...');
    
    // 初始化引擎
    await GameEngineInstance.initialize();
    
    console.log('引擎初始化完成');
    
    // 测试添加地点
    console.log('\n1. 测试添加地点:');
    const addLocationResult = await GameEngineInstance.addLocation({
        name: '岩城',
        description: '一个神秘的城市，漂浮在云层之上',
        owner: '玩家'
    });
    console.log('添加地点结果:', addLocationResult);
    
    // 测试更新地点
    console.log('\n2. 测试更新地点:');
    const updateLocationResult = await GameEngineInstance.updateLocation({
        name: '岩城',
        description: '一个神秘的城市，漂浮在云层之上，拥有古老的文明遗迹',
        owner: '玩家'
    });
    console.log('更新地点结果:', updateLocationResult);
    
    // 查看当前游戏数据
    console.log('\n3. 查看当前游戏数据:');
    const gameData = GameEngineInstance.getGameData();
    console.log('背包数据:', JSON.stringify(gameData.inventory, null, 2));
    
    // 测试移除地点
    console.log('\n4. 测试移除地点:');
    const removeLocationResult = await GameEngineInstance.removeLocation('岩城');
    console.log('移除地点结果:', removeLocationResult);
    
    // 查看更新后的游戏数据
    console.log('\n5. 查看更新后的游戏数据:');
    const updatedGameData = GameEngineInstance.getGameData();
    console.log('背包数据:', JSON.stringify(updatedGameData.inventory, null, 2));
    
    console.log('\n地点系统测试完成!');
}

// 运行测试
testLocationSystem().catch(console.error);