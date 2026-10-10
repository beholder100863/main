# 安静输入 — SillyTavern 扩展

阻止主聊天框在首次打开和切换角色时自动唤起输入法。手动点击聊天框仍可输入。

## 文件内默认配置

- 启用保护：是
- 仅移动设备：是
- 拦截范围：所有自动聚焦
- 短时保护长度：1500 毫秒（持续模式不使用此值）

这些是首次安装的默认值。已有的扩展设置会保留；重新生成或更新源码后，可在“安静输入”面板点击“恢复文件内默认设置”。

## 仓库结构

st-quiet-input/
  manifest.json
  index.js
  README.md
  LICENSE

上传的是解压后的这四个文件，manifest.json 必须直接位于仓库根目录。不要把 ZIP 当成源码上传，也不要多套一层文件夹。

## Git URL 安装

Git URL: [https://github.com/beholder100863/st-quiet-input.git](https://github.com/beholder100863/main.git)
分支: main

生成地址并不表示仓库已经存在。请先手动创建或选择仓库，并上传文件。此工具不会创建外部仓库或公开任何文件。

1. 在 GitHub 仓库根目录上传四个文件，确认分支。
2. SillyTavern → 扩展 → 安装扩展，粘贴仓库 Git URL，分支单独填写。
3. 通常选择“仅当前用户”。安装后刷新页面，在管理扩展中确认“安静输入”已启用。
4. 测试首次进入聊天、切换角色、手动点击输入框。

私有 GitHub 仓库需要运行 SillyTavern 的设备具有 Git 访问权限。浏览器登录 GitHub 不等于服务器 Git 已授权。无需把令牌写进 URL 或交给安装器。

## 无 Git 的手动安装

如你能操作 SillyTavern 文件目录，将这四个文件放入 data/<你的用户目录>/extensions/st-quiet-input/ 后刷新。全用户安装路径为 public/scripts/extensions/third-party/st-quiet-input/。实际路径取决于部署环境；不要将文件放到安卓下载目录后期待自动加载。

## 功能与撤回

在 SillyTavern 扩展设置的“安静输入”面板可修改开关、移动设备限制、范围与时长。禁用或删除扩展后刷新即可完全撤回。只处理主聊天框 #send_textarea，不读取聊天内容、不改写角色卡、不发送网络请求、不更改输入框文字。配置保存使用 SillyTavern 自己的 extensionSettings 接口。

## 兼容性与限制

依据官方 getContext、extensionSettings、saveSettingsDebounced、CHAT_CHANGED 和 manifest 接口编写。需要这些接口与主聊天 textarea 存在。拦截 textarea 的 focus 方法，且仅对主聊天框生效；以焦点事件作为备用保护。短时模式无法保证拦截在 CHAT_CHANGED 事件之前已发生的所有聚焦，建议选择持续模式。原生应用直接唤起键盘、其他扩展保存原始 focus 方法、浏览器差异可能导致键盘短暂闪现或绕过拦截。移动设备判断依据 UA / 触控能力，混合设备可能被识别为移动设备。辅助设备模拟点击、非标准触控输入也需实测。

安装器预览是行为模拟，不是在真实 SillyTavern 上运行扩展。已完成生成文件、焦点拦截与配置的模拟测试；未完成安卓实机输入法测试及浏览器视觉验证。请在自己的手机上逐项验收。

## 故障排查

- Manifest not found：检查仓库根目录与分支，避免 manifest.json.txt。
- 无权限：检查私有仓库 Git 认证；不含 Git 的安卓应用可能不支持 URL 安装。
- 仍自动弹出：刷新、启用持续模式，必要时关闭移动设备限制，检查其他扩展冲突。
- 需要关闭：在扩展设置关闭保护，或在管理扩展禁用后刷新。

## 官方依据

- 安装说明：https://docs.sillytavern.app/extensions/
- UI 扩展接口：https://docs.sillytavern.app/for-contributors/writing-extensions/

## 许可

MIT；详见 LICENSE。
