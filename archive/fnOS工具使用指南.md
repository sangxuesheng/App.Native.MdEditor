# fnOS 应用开发工具使用指南

> 整理自飞牛 fnOS 官方开发文档，涵盖 `fnpack` 与 `appcenter-cli` 两个核心工具。

---

## 一、工具定位对比

| 对比维度 | `fnpack` | `appcenter-cli` |
|---|---|---|
| **核心职责** | 项目脚手架 + 打包构建 | 安装部署 + 运行管理 |
| **使用阶段** | 开发阶段（初始化项目结构 & 打包） | 部署阶段（安装、启停、管理） |
| **工具来源** | 需单独下载，支持本地运行；同时预置于 fnOS | fnOS **系统预装**，无需下载 |
| **运行环境** | 本地开发机 或 fnOS 均可 | 仅 fnOS 系统内 |
| **产出 / 消费** | **产出** `.fpk` 安装包 | **消费** `.fpk` 安装包 |

---

## 二、fnpack 下载地址

| 平台 | 下载链接 |
|---|---|
| Windows x86 | [fnpack-1.2.1-windows-amd64](https://static2.fnnas.com/fnpack/fnpack-1.2.1-windows-amd64) |
| Linux x86 | [fnpack-1.2.1-linux-amd64](https://static2.fnnas.com/fnpack/fnpack-1.2.1-linux-amd64) |
| Linux ARM | [fnpack-1.2.1-linux-arm64](https://static2.fnnas.com/fnpack/fnpack-1.2.1-linux-arm64) |
| Mac Intel | [fnpack-1.2.1-darwin-amd64](https://static2.fnnas.com/fnpack/fnpack-1.2.1-darwin-amd64) |
| Mac M 系列 | [fnpack-1.2.1-darwin-arm64](https://static2.fnnas.com/fnpack/fnpack-1.2.1-darwin-arm64) |

本地安装方法（Linux / macOS）：

```bash
chmod +x fnpack-1.2.1-linux-amd64
sudo mv fnpack-1.2.1-linux-amd64 /usr/local/bin/fnpack
fnpack --help
```

---

## 三、fnpack 全部命令

| 命令 | 作用 | 备注 |
|---|---|---|
| `fnpack create <appname>` | 创建标准独立应用项目（含 UI 入口） | 最常用的初始化命令 |
| `fnpack create <appname> --without-ui true` | 创建纯服务类应用（无 UI 入口） | 后台服务场景使用 |
| `fnpack create <appname> --template docker` | 创建 Docker 应用项目 | 自动生成 `docker-compose.yaml` |
| `fnpack create <appname> --template docker --without-ui true` | 创建无 UI 的 Docker 应用 | Docker 纯服务场景 |
| `fnpack build` | 在当前目录打包应用为 `.fpk` | 需先 `cd` 进应用目录 |
| `fnpack build --directory <path>` | 指定目录打包 | 可集成到编译脚本中 |

---

## 四、fnpack build 打包校验规则

`fnpack build` 执行时会强制校验以下文件 / 目录是否存在：

| 路径 | 类型 | 校验规则 |
|---|---|---|
| `manifest` | 文件 | 必须存在，且必选字段不能缺 |
| `config/privilege` | 文件 | 必须存在，且符合 JSON 格式 |
| `config/resource` | 文件 | 必须存在，且符合 JSON 格式 |
| `ICON.PNG` | 文件 | 必须存在（64×64） |
| `ICON_256.PNG` | 文件 | 必须存在（256×256） |
| `app/` | 目录 | 必须存在 |
| `cmd/` | 目录 | 必须存在 |
| `wizard/` | 目录 | 必须存在 |
| `app/{manifest.desktop_uidir}/` | 目录 | manifest 中有定义时必须存在 |

---

## 五、fnpack 生成的项目结构

```text
myapp/
├── app/                            # 应用可执行文件目录
│   ├── ui/
│   │   ├── images/
│   │   └── config
│   └── docker/                     # Docker 配置（Docker 模板专有）
│       └── docker-compose.yaml
├── cmd/                            # 应用生命周期管理脚本
│   ├── main
│   ├── install_init
│   ├── install_callback
│   ├── uninstall_init
│   ├── uninstall_callback
│   ├── upgrade_init
│   ├── upgrade_callback
│   ├── config_init
│   └── config_callback
├── config/
│   ├── privilege                   # 应用权限配置
│   └── resource                    # 应用资源配置
├── wizard/
│   ├── install                     # 安装向导配置
│   ├── uninstall                   # 卸载向导配置
│   └── config                      # 配置向导
├── manifest                        # 应用基本信息
├── LICENSE                         # 许可证文件
├── ICON.PNG                        # 应用图标（64×64）
└── ICON_256.PNG                    # 应用图标（256×256）
```

---

## 六、appcenter-cli 全部命令

### 安装类

| 命令 | 作用 | 备注 |
|---|---|---|
| `appcenter-cli install-fpk <file.fpk>` | 安装 fpk 包 | 有安装向导时需交互配置 |
| `appcenter-cli install-fpk <file.fpk> --env config.env` | 静默安装（跳过交互向导） | 需提前准备环境变量文件 |
| `appcenter-cli install-local` | 从本地开发目录直接安装（免打包） | 开发调试专用，自动完成打包+安装 |

### 存储空间类

| 命令 | 作用 | 备注 |
|---|---|---|
| `appcenter-cli default-volume` | 查看当前默认安装存储空间 | — |
| `appcenter-cli default-volume 1` | 设置存储空间 1 为默认安装位置 | 多存储空间时使用 |
| `appcenter-cli default-volume 2` | 设置存储空间 2 为默认安装位置 | — |

### 手动安装功能类

| 命令 | 作用 | 备注 |
|---|---|---|
| `appcenter-cli manual-install` | 查看手动安装功能当前状态 | — |
| `appcenter-cli manual-install enable` | 开启手动安装（允许他人上传 fpk 安装） | 用完及时关闭 |
| `appcenter-cli manual-install disable` | 关闭手动安装 | — |

### 应用管理类

| 命令 | 作用 | 备注 |
|---|---|---|
| `appcenter-cli list` | 查看已安装应用列表 | — |
| `appcenter-cli start <appname>` | 启动指定应用 | — |
| `appcenter-cli stop <appname>` | 停止指定应用 | — |

---

## 七、静默安装环境变量文件格式

文件名：`config.env`，格式为简单键值对：

```ini
# 应用配置
wizard_admin_username=admin
wizard_admin_password=mypassword123
wizard_database_type=sqlite
wizard_app_port=8080

# 系统设置
wizard_agree_terms=true
```

> 变量名以 `wizard_` 开头，对应安装向导中的各配置项，可跳过交互式配置。

---

## 八、完整开发工作流

| 步骤 | 使用工具 | 命令 | 说明 |
|---|---|---|---|
| 1. 初始化项目结构 | `fnpack` | `fnpack create <appname>` | 生成标准目录和配置文件模板 |
| 2. 编写业务代码 | — | — | 填充 `app/`、`cmd/`、`wizard/` 等目录内容 |
| 3. 打包成 `.fpk` | `fnpack` | `fnpack build` | 自动校验结构并打包 |
| 4a. 安装打包版本 | `appcenter-cli` | `appcenter-cli install-fpk myapp.fpk` | 正式测试 / 生产部署 |
| 4b. 开发调试快速安装 | `appcenter-cli` | `appcenter-cli install-local` | 免打包，直接从源码目录安装 |
| 5. 查看 / 启停应用 | `appcenter-cli` | `appcenter-cli list / start / stop` | 日常运维管理 |
