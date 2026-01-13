// 配置加载器
class ConfigLoader {
    constructor() {
        this.config = null;
    }

    // 加载配置
    async load() {
        try {
            const response = await fetch('package.json');
            if (response.ok) {
                const packageData = await response.json();
                this.config = packageData.gameConfig || {};
                return this.config;
            } else {
                console.error('加载配置失败:', response.status);
                // 返回默认配置
                return this.getDefaultConfig();
            }
        } catch (error) {
            console.error('加载配置失败:', error);
            // 返回默认配置
            return this.getDefaultConfig();
        }
    }

    // 获取默认配置
    getDefaultConfig() {
        return {
                admin: true,
                gameTitle: '擢升一瞥'
            };
    }

    // 获取配置
    getConfig() {
        return this.config || this.getDefaultConfig();
    }

    // 获取特定配置项
    get(key, defaultValue) {
        if (this.config && this.config.hasOwnProperty(key)) {
            return this.config[key];
        }
        return defaultValue;
    }
}

// 创建单例实例
const configLoader = new ConfigLoader();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = configLoader;
}