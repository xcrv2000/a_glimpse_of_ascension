## 1. 现状分析
- 目前admin模式配置分散在多个文件中：
  - `package.json` 中已有 `gameConfig.admin: true` 配置
  - `configLoader.js` 中默认配置 `admin: true`
  - `index.html` 中默认 `let admin = true`，然后通过 `initConfig()` 从配置加载
  - `chat.html` 中默认 `let admin = true`，然后通过 `initConfig()` 从配置加载

- 实际上，系统已经在使用 `package.json` 中的配置，因为 `initConfig()` 函数会从 `configLoader` 加载配置，而 `configLoader` 会读取 `package.json`。

## 2. 计划实施步骤

### 2.1 确认 package.json 配置
- 确保 `package.json` 中的 `gameConfig.admin` 配置正确设置为 `true`（已存在，无需修改）

### 2.2 修改 index.html
- 保留 `let admin` 声明，但移除默认值赋值
- 确保 `initConfig()` 函数正确从 `configLoader` 加载 admin 配置

### 2.3 修改 chat.html
- 保留 `let admin` 声明，但移除默认值赋值
- 确保 `initConfig()` 函数正确从 `configLoader` 加载 admin 配置

### 2.4 保持 configLoader.js 不变
- `configLoader` 已经正确实现了从 `package.json` 加载配置的功能
- 保持默认配置作为 fallback，确保系统健壮性

### 2.5 保持运行时修改功能不变
- 保留 chat.html 中成就按钮点击事件修改 admin 权限的功能（游戏特性）

## 3. 预期效果
- admin 模式的配置完全集中到 `package.json` 中
- 修改 `package.json` 中的 `gameConfig.admin` 值即可全局控制 admin 模式
- 系统仍然具有健壮的默认配置和运行时修改能力

## 4. 文件修改列表
- `index.html`：修改 admin 变量初始化
- `chat.html`：修改 admin 变量初始化