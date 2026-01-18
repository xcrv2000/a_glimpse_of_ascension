// 测试脚本，验证语义中间层的输出顺序

// 加载 semanticInterpreter 模块
const fs = require('fs');
const path = require('path');

// 读取 semanticInterpreter.js 文件
const semanticInterpreterPath = path.join(__dirname, 'src', 'js', 'semanticInterpreter.js');
const semanticInterpreterContent = fs.readFileSync(semanticInterpreterPath, 'utf8');

// 执行 semanticInterpreter.js 文件，创建 SemanticInterpreter 类
eval(semanticInterpreterContent);

// 读取 data.json 文件
const dataJsonPath = path.join(__dirname, 'src', 'data', 'data.json');
const dataJsonContent = fs.readFileSync(dataJsonPath, 'utf8');

// 创建带事件列表的测试数据
const testDataWithEvents = JSON.parse(dataJsonContent);
testDataWithEvents.events = ['测试事件1', '测试事件2'];
testDataWithEvents.foreshadowings = ['测试伏笔1', '测试伏笔2'];

// 测试转换
console.log('=== 测试语义中间层输出顺序 ===');
try {
    const result = SemanticInterpreter.convertDataToNaturalLanguage(testDataWithEvents);
    console.log(result);
    
    // 验证输出顺序
    console.log('\n=== 验证输出顺序 ===');
    
    // 检查各个部分的顺序
    const sections = result.split('===');
    const sectionTitles = sections
        .map(section => {
            const trimmed = section.trim();
            if (trimmed) {
                return trimmed.split('\n')[0];
            }
            return '';
        })
        .filter(title => title && !title.startsWith('当前') && !title.includes('故事节拍\'起\''));
    
    console.log('输出的节顺序:');
    sectionTitles.forEach(title => {
        console.log(`- ${title}`);
    });
    
    // 检查故事节拍和字数是否合并
    const hasCombinedSection = sectionTitles.includes('故事节拍与字数');
    console.log(`\n故事节拍和字数是否合并: ${hasCombinedSection ? '✅ 是' : '❌ 否'}`);
    
    // 检查游戏内时间的位置
    const timeIndex = sectionTitles.indexOf('游戏内时间');
    const worldViewIndex = sectionTitles.indexOf('世界观');
    const eventIndex = sectionTitles.indexOf('事件记录');
    
    console.log(`\n各部分索引:`);
    console.log(`  故事节拍与字数: ${sectionTitles.indexOf('故事节拍与字数')}`);
    console.log(`  景深级别: ${sectionTitles.indexOf('景深级别')}`);
    console.log(`  世界观: ${worldViewIndex}`);
    console.log(`  游戏内时间: ${timeIndex}`);
    console.log(`  事件记录: ${eventIndex}`);
    
    // 检查游戏内时间是否在世界观后面
    const isTimeAfterWorldView = timeIndex > worldViewIndex;
    console.log(`游戏内时间是否在世界观后: ${isTimeAfterWorldView ? '✅ 是' : '❌ 否'}`);
    
    // 检查游戏内时间是否在事件列表前面（如果有事件列表的话）
    const hasEvents = eventIndex !== -1;
    let isTimeBeforeEvents = true;
    if (hasEvents) {
        isTimeBeforeEvents = timeIndex < eventIndex;
        console.log(`游戏内时间是否在事件列表前: ${isTimeBeforeEvents ? '✅ 是' : '❌ 否'}`);
    } else {
        console.log(`游戏内时间是否在事件列表前: ✅ 是（无事件列表）`);
    }
    
    // 检查最终顺序
    const expectedOrder = [
        '故事节拍与字数',
        '景深级别',
        '世界观',
        '游戏内时间',
        '事件记录',
        '伏笔记录',
        '角色信息',
        '游戏资产'
    ];
    
    let isOrderCorrect = true;
    for (let i = 0; i < expectedOrder.length; i++) {
        const expectedTitle = expectedOrder[i];
        const actualIndex = sectionTitles.indexOf(expectedTitle);
        
        // 检查该标题是否存在
        if (actualIndex === -1) {
            console.log(`\n❌ 缺少预期的节: ${expectedTitle}`);
            isOrderCorrect = false;
            continue;
        }
        
        // 检查标题顺序是否正确
        if (i > 0) {
            const prevExpectedTitle = expectedOrder[i-1];
            const prevActualIndex = sectionTitles.indexOf(prevExpectedTitle);
            
            if (prevActualIndex > actualIndex) {
                console.log(`\n❌ 顺序错误: ${expectedTitle} 应在 ${prevExpectedTitle} 之后`);
                isOrderCorrect = false;
            }
        }
    }
    
    if (hasCombinedSection && isTimeAfterWorldView && isTimeBeforeEvents && isOrderCorrect) {
        console.log('\n✅ 所有顺序调整均符合要求！');
    } else {
        console.log('\n❌ 顺序调整仍有不符合要求的地方');
    }
    
    console.log('\n=== 测试完成 ===');
} catch (error) {
    console.error('测试失败:', error);
    console.error('错误堆栈:', error.stack);
}