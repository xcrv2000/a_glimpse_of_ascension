// 测试脚本，验证语义中间层的输出格式

// 加载 semanticInterpreter 模块
const fs = require('fs');
const path = require('path');

// 读取 semanticInterpreter.js 文件
const semanticInterpreterPath = path.join(__dirname, 'src', 'js', 'semanticInterpreter.js');
const semanticInterpreterContent = fs.readFileSync(semanticInterpreterPath, 'utf8');

// 模拟浏览器环境
global.window = {};

// 执行 semanticInterpreter.js 文件
eval(semanticInterpreterContent);

// 读取 data.json 文件
const dataJsonPath = path.join(__dirname, 'src', 'data', 'data.json');
const dataJsonContent = fs.readFileSync(dataJsonPath, 'utf8');

// 测试转换
console.log('=== 测试语义中间层输出格式 ===');
try {
    const result = SemanticInterpreter.convertDataToNaturalLanguage(dataJsonContent);
    console.log(result);
    
    // 验证输出格式
    console.log('\n=== 验证输出格式 ===');
    
    // 检查是否包含 "定义：" 或 "意义：" 或 "值："，如果包含则说明格式仍有问题
    const hasOldFormat = /定义：|意义：|值：/.test(result);
    
    if (hasOldFormat) {
        console.log('❌ 输出仍包含旧格式（定义：/意义：/值：）');
    } else {
        console.log('✅ 输出格式符合要求，不再包含旧格式');
    }
    
    // 检查是否包含更符合人类语言的表示方式
    const hasNewFormat = /当前游戏时间为|当前故事处于|当前景深级别为|当前是第.*个起承转合循环/.test(result);
    
    if (hasNewFormat) {
        console.log('✅ 输出包含新的符合人类语言的表示方式');
    } else {
        console.log('❌ 输出未包含新的表示方式');
    }
    
    console.log('\n=== 测试完成 ===');
} catch (error) {
    console.error('测试失败:', error);
}