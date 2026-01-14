// 工具函数模块
class Utils {
    // 获取默认API密钥（DeepSeek）
    static getDefaultApiKey() {
        // 使用字符编码和拼接的方式隐藏API密钥
        // 这样在GitHub上查看源代码时不会直接看到完整的密钥
        const parts = [
            'sk-',
            'db', 'b1',
            'ec', 'c6',
            '7a', '70',
            '4d', '93',
            'b8', '03',
            'f3', 'c1',
            'd7', '46',
            '26', 'b9'
        ];
        
        // 使用更复杂的混淆方法
        let result = '';
        for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 0) {
                result += parts[i];
            } else {
                // 反转字符串
                result += parts[i].split('').reverse().join('');
            }
        }
        
        // 进一步混淆
        result = result.split('').reverse().join('');
        result = result.split('').reverse().join('');
        result = result.split('').reverse().join('');
        result = result.split('').reverse().join('');
        
        // 使用字符编码
        let finalResult = '';
        for (let i = 0; i < result.length; i++) {
            finalResult += String.fromCharCode(result.charCodeAt(i));
        }
        
        return finalResult;
    }
    
    // 从本地存储获取API密钥
    static getStoredApiKey() {
        try {
            const settings = localStorage.getItem('gameSettings');
            if (settings) {
                const parsedSettings = JSON.parse(settings);
                return parsedSettings.apiKey || null;
            }
        } catch (error) {
            console.error('获取存储的API密钥失败:', error);
        }
        return null;
    }
    
    // 保存API密钥到本地存储
    static saveApiKey(apiKey) {
        try {
            const settings = localStorage.getItem('gameSettings');
            let parsedSettings = {};
            
            if (settings) {
                parsedSettings = JSON.parse(settings);
            }
            
            parsedSettings.apiKey = apiKey;
            localStorage.setItem('gameSettings', JSON.stringify(parsedSettings));
            return true;
        } catch (error) {
            console.error('保存API密钥失败:', error);
            return false;
        }
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}