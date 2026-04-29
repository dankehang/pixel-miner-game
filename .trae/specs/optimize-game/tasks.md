# Tasks

- [x] Task 1: 实现重力系统
  - [x] SubTask 1.1: 在 Game 类中添加重力检测逻辑
  - [x] SubTask 1.2: 修改玩家移动逻辑，支持自动下落
  - [x] SubTask 1.3: 添加下落动画效果

- [x] Task 2: 实现梯子系统
  - [x] SubTask 2.1: 在 block.js 中添加 LADDER 方块类型
  - [x] SubTask 2.2: 在商店中添加梯子购买选项
  - [x] SubTask 2.3: 实现梯子放置逻辑（T键）
  - [x] SubTask 2.4: 实现梯子攀爬逻辑

- [x] Task 3: 添加粒子效果系统
  - [x] SubTask 3.1: 创建 Particle 类
  - [x] SubTask 3.2: 在方块被挖掘时生成粒子
  - [x] SubTask 3.3: 实现粒子动画和生命周期管理

- [x] Task 4: 添加方块高亮显示
  - [x] SubTask 4.1: 计算玩家面向的目标方块
  - [x] SubTask 4.2: 在渲染时绘制高亮边框

- [x] Task 5: 添加音效系统
  - [x] SubTask 5.1: 创建 SoundManager 类，使用 Web Audio API
  - [x] SubTask 5.2: 添加挖掘、收集、升级音效
  - [x] SubTask 5.3: 在相应操作时触发音效播放

- [x] Task 6: 实现成就系统
  - [x] SubTask 6.1: 定义成就列表（深度里程碑、收集里程碑）
  - [x] SubTask 6.2: 在 UI 中添加成就显示
  - [x] SubTask 6.3: 实现成就检测和解锁提示

- [x] Task 7: 优化商店界面
  - [x] SubTask 7.1: 添加装备属性对比显示
  - [x] SubTask 7.2: 添加梯子购买选项
  - [x] SubTask 7.3: 优化商店视觉样式

- [x] Task 8: 添加游戏设置界面
  - [x] SubTask 8.1: 创建设置模态框
  - [x] SubTask 8.2: 添加音量控制滑块
  - [x] SubTask 8.3: 添加按键说明显示
  - [x] SubTask 8.4: 保存设置到 localStorage

# Task Dependencies
- [Task 2] depends on [Task 1] (梯子系统需要重力系统支持)
- [Task 7] depends on [Task 2] (商店需要支持梯子购买)
- [Task 5] depends on [Task 8] (音效系统需要设置中的音量控制)
