# 实现语义中间层转换data.json为自然语言

## 1. 创建语义中间层文件
- 创建 `src/js/semanticInterpreter.js` 文件
- 设计 `SemanticInterpreter` 类，负责将 `data.json` 转换为自然语言
- 实现 `convertDataToNaturalLanguage()` 方法，将结构化数据转换为可读文本

## 2. 语义中间层核心功能
- 解析 `data.json` 的各个部分（时间、叙事信息、角色等）
- 将结构化数据转换为流畅的自然语言描述
- 保持输出的人类可读性，便于手动编辑和调整
- 支持对不同数据类型的灵活处理

## 3. 修改现有代码
- 修改 `PromptManager.loadPrompts()` 方法，使用语义中间层转换数据
- 或修改 `PromptBuilder_storyteller.buildSystemPrompt()` 方法，在构建提示词时使用转换后的数据
- 确保新的语义中间层被正确集成到现有流程中

## 4. 实现细节
- 语义中间层将读取 `data.json` 内容
- 转换后的自然语言将替代原始 `data.json` 文本插入到系统提示词中
- 保持原有功能不变，只改变数据的呈现方式
- 确保代码结构清晰，易于维护和扩展

## 5. 文件修改计划
- `src/js/semanticInterpreter.js`（新建）：语义中间层核心实现
- `src/js/PromptManager.js` 或 `src/js/promptBuilder_storyteller.js`（修改）：集成语义中间层

## 6. 实现目标
- 保持原有功能不变
- 提高AI提示词中数据的可读性
- 便于手动调整和编辑转换规则
- 为后续功能扩展提供灵活的语义转换基础