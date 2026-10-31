# SillyTavern Resource

为 SillyTavern 提供日常使用的前端脚本和服务端插件：NovelAI 聊天插图、生成结束通知、世界书工具、笔记、模型列表过滤和界面微调。

前端脚本通过**酒馆助手的脚本库**加载；后端插件安装到
**SillyTavern 服务端**。可以按需使用单个脚本，其中 NovelAI 图片助手需要配套的两个后端插件。

## 前端脚本

下表中的链接指向源码目录，已构建的可用脚本位于 [`dist/scripts/`](dist/scripts/)，每个目录内的 `index.js` 对应一个脚本。

| 脚本                                                    | 能做什么                                                                                                              | 使用入口                                         | 构建目录（相对于 `dist/scripts/`） |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------- |
| [NovelAI 图片助手](src/scripts/novelai-image-helper/)   | 分析聊天正文、选择插图位置、生成提示词，使用 NovelAI V4.5 / V5 生成插图；支持人物库、串行队列、失败重试和历史图片切换 | 悬浮窗中的提示生成与设置，以及消息中的图片卡片   | `novelai-image-helper/`            |
| [消息提醒与后台常驻（Notifier）](src/scripts/notifier/) | 生成结束时发送系统通知；播放静音音频，尝试保持页面在后台活跃                                                          | 扩展设置中的「消息提醒与后台常驻」               | `notifier/`                        |
| [同步状态指示器](src/scripts/sync-indicator/)           | 在用户设置按钮上显示请求进行中或已结束的状态；有写入请求进行时，尝试提醒用户不要离开页面                              | 加载后自动显示                                   | `sync-indicator/`                  |
| [Notebook](src/scripts/misc/notebook/)                  | 创建、搜索和整理笔记，按全局、角色卡、聊天分区；可复制内容或插入聊天输入框                                            | 扩展菜单「打开 Notebook」，或 `/notebook`        | `misc/notebook/`                   |
| [世界书统计](src/scripts/misc/lorebook-summary/)        | 查看当前角色、全局和聊天绑定世界书的 Token 数、条目来源与触发类型分布                                                 | 扩展菜单「世界书统计」                           | `misc/lorebook-summary/`           |
| [代码块转世界书](src/scripts/misc/code-to-worldbook/)   | 将聊天代码块的内容保存为世界书条目，优先写入当前聊天绑定的世界书                                                      | 代码块上的「创建世界书条目」按钮                 | `misc/code-to-worldbook/`          |
| [AllTheBook](src/scripts/misc/all-the-book/)            | 生成前注入仅供世界书扫描的触发词，尝试激活当前上下文的绿灯条目；另有命令可将绿灯条目永久改为蓝灯                      | 加载后自动参与扫描；永久转换使用 `/all-the-book` | `misc/all-the-book/`               |
| [模型列表过滤](src/scripts/misc/model-filter/)          | 按模型 ID 或正则表达式包含、隐藏模型；规则按聊天补全来源和端点保存                                                    | 扩展设置「模型列表过滤」                         | `misc/model-filter/`               |
| [样式微调器](src/scripts/misc/style-tuner/)             | 按开关隐藏欢迎页快捷方式、部分警告和设置项等界面元素                                                                  | 扩展菜单「样式微调器」                           | `misc/style-tuner/`                |
| [斜杠命令扩展](src/scripts/misc/slash-ext/)             | 隐藏全部聊天消息，或隐藏除最后一条以外的消息                                                                          | `/hide-all`、`/hide-except-last`                 | `misc/slash-ext/`                  |

`/all-the-book`
会修改原世界书中的条目触发类型，使用前请确认操作范围。Notifier 的通知需要浏览器与系统授权；后台活跃效果受浏览器和系统策略影响。

### 加载脚本

1. 在 SillyTavern 中安装并启用酒馆助手。
2. 在酒馆助手脚本库中新建脚本，填入所需脚本的加载代码并启用。通用工具可以放入全局脚本库。
3. 按上表找到对应入口。除 NovelAI 图片助手外，其余脚本无需安装本仓库的后端插件。

例如，加载 Notifier：

```javascript
import 'https://testingcf.jsdelivr.net/gh/RhNu/SillyTavern-Resource@main/dist/scripts/notifier/index.js';
```

加载其他脚本时，将末尾的 `notifier/index.js` 替换为表中对应的目录和 `index.js`，例如 `misc/notebook/index.js`。`@main`
跟随主分支更新，但 CDN 可能存在缓存；需要固定版本时可替换为对应的 Git 标签或提交哈希。

也可以下载构建产物后自行托管，将加载代码中的地址改为自己的脚本 URL。

## 后端插件

| 插件                                          | 用途                                                                                             | 配置要求                                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| [imggen-novelai](src/plugins/imggen-novelai/) | 调用 NovelAI V4.5 / V5 生成图片；可直接保存到当前用户的 SillyTavern 图片目录，也可返回图片二进制 | 服务端设置 `NOVELAI_TOKEN`；可选 `NOVELAI_IMAGE_API_URL` 自定义生成端点                        |
| [llm-requester](src/plugins/llm-requester/)   | 为前端脚本提供独立的 OpenAI 兼容模型列表和生成请求，供图片助手分析正文并生成提示词               | 在 SillyTavern 中保存对应服务商的 API 密钥；Custom 服务可填写自定义 Base URL，也支持无密钥服务 |

`llm-requester` 使用 SillyTavern 已保存的凭证，前端选择服务商、凭证和模型，真实密钥由服务端读取。插件用法和 API 说明见其
[README](src/plugins/llm-requester/README.md)。

### 安装插件

1. 从 [`dist/plugins/`](dist/plugins/) 获取所需插件的**整个目录**，复制到 SillyTavern 根目录的 `plugins/`
   下。源码构建方式见下文。
2. 在 SillyTavern 的 `config.yaml` 中启用服务端插件：

   ```yaml
   enableServerPlugins: true
   ```

3. 配置所需密钥或环境变量，然后重启 SillyTavern。

安装两个插件后的文件位置应为：

```text
SillyTavern/
└─ plugins/
   ├─ imggen-novelai/
   │  └─ index.cjs
   └─ llm-requester/
      └─ index.cjs
```

后端插件需要在运行 SillyTavern 的电脑或服务器上安装。只有网页访问权限时，需要由服务端管理员安装。

### NovelAI 环境变量

这些变量应设置给 **SillyTavern 服务端进程**：

| 变量                    | 说明                                                 | 默认值                                        |
| ----------------------- | ---------------------------------------------------- | --------------------------------------------- |
| `NOVELAI_TOKEN`         | 必填，NovelAI 的持久访问 Token                       | 无                                            |
| `NOVELAI_IMAGE_API_URL` | 可选，完整的图像生成端点，包含请求路径和所需查询参数 | `https://image.novelai.net/ai/generate-image` |

`NOVELAI_IMAGE_API_URL` 未设置或只有空白时使用官方地址。自定义地址会原样接收 NovelAI 格式的请求体和
`Authorization: Bearer <NOVELAI_TOKEN>`
请求头，因此需要填写可信且兼容 NovelAI 请求与图片响应格式的服务地址。插件不会自动追加 `/ai/generate-image`。

Windows PowerShell 示例，在 **SillyTavern 根目录**执行：

```powershell
$env:NOVELAI_TOKEN = '你的 NovelAI Token'
# 仅在需要自定义端点时设置这一项
$env:NOVELAI_IMAGE_API_URL = 'https://proxy.example.com/ai/generate-image'
.\Start.bat
```

上述设置作用于当前终端及其启动的进程。使用 Docker 或进程管理器运行时，请在对应的环境变量配置中填写并重启服务。

## 开始使用 NovelAI 图片助手

1. 加载 `novelai-image-helper/index.js`，安装 `imggen-novelai` 和 `llm-requester`，为服务端配置 `NOVELAI_TOKEN`。
2. 在 SillyTavern 中保存用于分析正文的语言模型服务凭证。
3. 打开图片助手设置，选择提示词分析使用的服务商、凭证和模型；选择 Custom 时还需填写 Base URL。
4. 选择 NovelAI 生图模型，调整尺寸、采样参数和人物库等设置。
5. 在聊天中点击悬浮窗的提示生成按钮，分析最新 AI 消息并排队生成插图；也可以在设置中开启自动分析与自动生图。

生成的图片会保存到 SillyTavern 当前用户的图片目录，并显示在正文对应位置。可在图片卡片中再次生成、切换历史输出；队列支持暂停、取消和重试失败任务。删除图片块不会删除已经保存的图片文件。

详细配置、正文清洗、队列和重试行为见 [NovelAI 图片助手说明](src/scripts/novelai-image-helper/README.md)。

## 从源码构建

需要 Node.js **24.12.0 或更新版本**、pnpm **12.3.0 或更新版本**；仓库通过 `packageManager` 指定使用 pnpm 12.14.0。

```bash
pnpm install
pnpm build          # 生产构建全部脚本和插件
pnpm build:scripts  # 只构建前端脚本
pnpm build:plugins  # 只构建后端插件
pnpm check          # 格式、lint、类型和测试检查
```

前端产物输出到 `dist/scripts/`，后端产物输出到 `dist/plugins/`。构建后按上文加载脚本或复制插件目录。

## 许可证

[Aladdin Free Public License](LICENSE)
