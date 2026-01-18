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

// 测试转换
console.log('=== 测试语义中间层输出顺序 ===');
try {
    const result = SemanticInterpreter.convertDataToNaturalLanguage(dataJsonContent);
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
        .filter(title => title && !title.startsWith('当前'));
    
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
    
    const isTimeInCorrectPosition = timeIndex > worldViewIndex && timeIndex < eventIndex;
    console.log(`游戏内时间是否在世界观后、事件列表前: ${isTimeInCorrectPosition ? '✅ 是' : '❌ 否'}`);
    
    if (hasCombinedSection && isTimeInCorrectPosition) {
        console.log('\n✅ 所有顺序调整均符合要求！');
    } else {
        console.log('\n❌ 顺序调整仍有不符合要求的地方');
    }
    
    console.log('\n=== 测试完成 ===');
} catch (error) {
    console.error('测试失败:', error);
    console.error('错误堆栈:', error.stack);
}