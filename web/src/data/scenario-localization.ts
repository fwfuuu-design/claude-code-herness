import type { Scenario, SimStep } from "@/types/agent-data";

const ZH_META: Record<string, [string, string]> = {
  s01: ["Agent 循环", "最小 Agent 仅使用 Bash 完成任务。"],
  s02: ["工具调用", "Agent 使用职责明确的读、写、编辑与 Bash 工具。"],
  s03: ["权限控制", "工具调用在执行前依次经过禁止规则、权限规则与用户确认。"],
  s04: ["Hooks", "生命周期 Hook 在稳定循环周围接入日志、权限与结果处理。"],
  s05: ["TodoWrite", "规划工具让预定工作可见，并防止长任务偏离。"],
  s06: ["子 Agent", "Task 工具用全新消息运行嵌套循环，再把最终文本返回父 Agent。"],
  s07: ["技能加载", "Agent 先看到轻量技能目录，只在需要时加载完整 SKILL.md。"],
  s08: ["上下文压缩", "分层压缩先清理低成本内容，仅在必要时调用模型生成摘要。"],
  s09: ["记忆", "持久记忆让经过筛选的项目事实跨轮次与会话保留。"],
  s10: ["任务系统", "落盘任务图记录状态、负责人和 blockedBy 依赖。"],
  s11: ["后台任务", "长任务进入线程，Agent 主循环继续响应。"],
  s12: ["定时调度器", "守护循环检查持久计划，把到期工作送回 Agent。"],
  s13: ["Agent 团队运行时", "Lead 协调持久队友，运行时负责消息、原子认领与任务目录。"],
  s14: ["MCP 工具", "Agent 发现外部 MCP 工具，并通过规范化命名空间调用。"],
  s15: ["集成 Harness", "系统指令、工具、记忆、团队、后台任务、调度、Worktree 与 MCP 汇入同一 Harness。"],
  s16: ["工作流运行时", "固定审查流水线记录 journal、发送生命周期事件，并返回单个工具结果。"],
  s17: ["目标闭环", "独立评估器在轮次末检查对话，并把未完成工作送回同一个循环。"],
};

const ZH_CONTENT: Record<string, Record<number, string>> = {
  s01: { 0: "创建 hello.py，并让它输出 Hello, World!。", 1: "我会使用 Bash 创建这个文件。", 4: "我会确认文件是否创建正确。", 7: "已创建 hello.py，可以运行 `python hello.py`。" },
  s02: { 0: "为 hello.py 添加 greet(name) 函数。", 1: "我先读取当前文件。", 6: "hello.py 已加入接收 name 参数的 greet(name) 函数。" },
  s03: { 0: "删除临时构建目录。", 1: "执行命令之前，我会先检查目标。" },
  s04: { 0: "读取 package.json 并总结其中的脚本。", 6: "项目提供了运行 Next.js 生产构建的 build 脚本。" },
  s05: { 0: "重构解析器并添加回归测试。", 5: "我已检查解析器，修改代码前会先更新 Todo。" },
  s06: { 0: "在不污染主上下文的情况下分析 CLI 解析器。", 5: "解析器位于 cli.py，并按命令名分发；我会在主计划中使用这个结论。" },
  s07: { 1: "像代码审查者一样检查这项变更。", 4: "我会先检查 Diff 的行为风险，再指出测试缺口。" },
  s09: { 1: "使用仓库首选的测试命令。" },
  s10: { 0: "把发布拆成任务，并在测试通过前阻止部署。" },
  s11: { 0: "运行一次耗时的仓库扫描，并在完成后通知我。", 1: "我会把扫描放到后台，让对话保持响应。", 6: "扫描完成，共有 12 个匹配项；我会总结最重要的结果。" },
  s12: { 0: "每个工作日早晨提醒我检查未完成任务。", 1: "我会创建并持久化 Cron 任务，供调度器稍后处理。", 6: "计划已保存；触发时，队列处理器会让 Agent Loop 执行提醒。" },
  s13: { 0: "并行重构认证代码及其依赖测试，不要混合修改。", 1: "我建议由后端队友处理认证，测试队友在依赖就绪后接手检查。是否启动团队？", 2: "可以，开始吧。", 22: "认证已在任务绑定的 Worktree 中完成重构，依赖测试也已通过。" },
  s14: { 0: "在文档中搜索部署指南。", 6: "文档服务找到了三项部署指南匹配结果。" },
  s15: { 0: "准备发布项目：检查代码、更新文档并报告部署就绪状态。", 2: "我建议让文档队友并行更新文档，同时执行发布检查。是否启动团队？", 3: "可以，启动文档队友并继续。", 16: "发布准备完成：检查通过、文档已更新，部署状态可用。" },
  s16: { 0: "从正确性、安全性、性能和风格四方面审查 load_user 变更。" },
  s17: { 0: "/goal pytest tests/auth 以状态码 0 退出", 1: "认证代码看起来正确，测试现在应该可以通过。", 6: "pytest tests/auth 退出码为 0：12 项测试通过。" },
};

function annotationFor(step: SimStep, index: number): string {
  const number = index + 1;
  switch (step.type) {
    case "user_message":
      return `步骤 ${number}：用户目标进入对话上下文。`;
    case "assistant_text":
      return `步骤 ${number}：模型根据当前证据决定下一步或给出回答。`;
    case "tool_call":
      return `步骤 ${number}：模型请求调用 ${step.toolName || "工具"}，由 Harness 负责执行边界。`;
    case "tool_result":
      return `步骤 ${number}：执行结果作为 tool_result 返回同一消息列表。`;
    case "system_event":
      return `步骤 ${number}：Harness 记录并处理这个运行时事件。`;
  }
}

export function localizeScenario(scenario: Scenario, locale: string): Scenario {
  if (locale !== "zh") return scenario;
  const meta = ZH_META[scenario.version] ?? [scenario.title, scenario.description];
  const content = ZH_CONTENT[scenario.version] ?? {};
  return {
    ...scenario,
    title: meta[0],
    description: meta[1],
    steps: scenario.steps.map((step, index) => ({
      ...step,
      content: content[index] ?? step.content,
      annotation: annotationFor(step, index),
    })),
  };
}
