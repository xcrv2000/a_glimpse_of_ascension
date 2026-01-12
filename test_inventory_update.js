// 测试背包系统更新功能
const { GameEngineInstance } = require('./src/js/engine.js');

async function testInventoryUpdateSystem() {
    console.log('开始测试背包系统更新功能...');
    
    // 初始化引擎
    await GameEngineInstance.initialize();
    
    console.log('引擎初始化完成');
    
    // 测试添加物品
    console.log('\n1. 测试添加物品:');
    const addItemResult = await GameEngineInstance.addItem({
        name: '魔法剑',
        description: '一把具有魔法力量的剑，可以发出火焰攻击',
        owner: '玩家'
    });
    console.log('添加物品结果:', addItemResult);
    
    // 测试更新物品（添加所属者属性）
    console.log('\n2. 测试更新物品（修改所属者）:');
    const updateItemResult = await GameEngineInstance.updateItem({
        name: '魔法剑',
        owner: '艾米'
    });
    console.log('更新物品结果:', updateItemResult);
    
    // 测试添加资产
    console.log('\n3. 测试添加资产:');
    const addAssetResult = await GameEngineInstance.addAsset({
        name: '金币',
        description: '100枚金币，可以用来购买物品和服务'
    });
    console.log('添加资产结果:', addAssetResult);
    
    // 测试更新资产（添加所属者属性）
    console.log('\n4. 测试更新资产（添加所属者）:');
    const updateAssetResult = await GameEngineInstance.updateAsset({
        name: '金币',
        owner: '玩家'
    });
    console.log('更新资产结果:', updateAssetResult);
    
    // 查看当前游戏数据
    console.log('\n5. 查看当前游戏数据:');
    const gameData = GameEngineInstance.getGameData();
    console.log('背包数据:', JSON.stringify(gameData.inventory, null, 2));
    
    // 测试移除物品
    console.log('\n6. 测试移除物品:');
    const removeItemResult = await GameEngineInstance.removeItem('魔法剑');
    console.log('移除物品结果:', removeItemResult);
    
    // 查看更新后的游戏数据
    console.log('\n7. 查看更新后的游戏数据:');
    const updatedGameData = GameEngineInstance.getGameData();
    console.log('背包数据:', JSON.stringify(updatedGameData.inventory, null, 2));
    
    console.log('\n背包系统更新功能测试完成!');
}

// 运行测试
testInventoryUpdateSystem().catch(console.error);