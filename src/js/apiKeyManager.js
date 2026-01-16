// API密钥管理器
class ApiKeyManager {
    // 获取默认API密钥
    static getDefaultApiKey() {
        return 'sk-4a622bdb6569416b9d11802ae92ddca1';
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