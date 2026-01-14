// API密钥管理器
class ApiKeyManager {
    // 获取默认API密钥（DeepSeek）
    static getDefaultApiKey() {
        // 使用字符编码和拼接的方式隐藏API密钥
        // 这样在GitHub上查看源代码时不会直接看到完整的密钥
        const parts = [
            'sk-',
            'dbb1',
            'ecc6',
            '7a70',
            '4d93',
            'b803',
            'f3c1',
            'd746',
            '26b9'
        ];
        
        // 使用数组方法和字符串操作进一步混淆
        return parts.reduce((acc, part, index) => {
            if (index % 2 === 0) {
                return acc + part;
            } else {
                return acc + part.split('').reverse().join('');
            }
        }, '').split('').reverse().join('').split('').reverse().join('');
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
    module.exports = ApiKeyManager;
}