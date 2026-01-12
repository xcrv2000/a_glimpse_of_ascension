// 测试背包系统
const { GameEngineInstance } = require('./src/js/engine.js');
const DataManager = require('./src/js/dataManager.js').DataManagerInstance;

async function testInventorySystem() {
    console.log('开始测试背包系统...');
    
    // 初始化引擎
    await GameEngineInstance.initialize();
    
    console.log('引擎初始化完成');
    
    // 测试添加物品
    console.log('\n1. 测试添加物品:');
    const addItemResult = await GameEngineInstance.addItem({
        name: '魔法剑',
        description: '一把具有魔法力量的剑，可以发出火焰攻击'
    });
    console.log('添加物品结果:', addItemResult);
    
    // 测试添加资产
    console.log('\n2. 测试添加资产:');
    const addAssetResult = await GameEngineInstance.addAsset({
        name: '金币',
        description: '100枚金币，可以用来购买物品和服务'
    });
    console.log('添加资产结果:', addAssetResult);
    
    // 测试添加知识
    console.log('\n3. 测试添加知识:');
    const addKnowledgeResult = await GameEngineInstance.addKnowledge({
        name: '火球术',
        description: '一种基础的火系魔法，可以发射火球攻击敌人'
    });
    console.log('添加知识结果:', addKnowledgeResult);
    
    // 查看当前游戏数据
    console.log('\n4. 查看当前游戏数据:');
    const gameData = GameEngineInstance.getGameData();
    console.log('背包数据:', JSON.stringify(gameData.inventory, null, 2));
    
    // 测试移除物品
    console.log('\n5. 测试移除物品:');
    const removeItemResult = await GameEngineInstance.removeItem('魔法剑');
    console.log('移除物品结果:', removeItemResult);
    
    // 测试移除资产
    console.log('\n6. 测试移除资产:');
    const removeAssetResult = await GameEngineInstance.removeAsset('金币');
    console.log('移除资产结果:', removeAssetResult);
    
    // 测试移除知识
    console.log('\n7. 测试移除知识:');
    const removeKnowledgeResult = await GameEngineInstance.removeKnowledge('火球术');
    console.log('移除知识结果:', removeKnowledgeResult);
    
    // 查看更新后的游戏数据
    console.log('\n8. 查看更新后的游戏数据:');
    const updatedGameData = GameEngineInstance.getGameData();
    console.log('背包数据:', JSON.stringify(updatedGameData.inventory, null, 2));
    
    console.log('\n背包系统测试完成!');
}

// 运行测试
testInventorySystem().catch(console.error);