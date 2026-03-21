# Docker 构建与运行

本项目支持 **Docker** 与 **fnOS 原生** 两种构建方式，可并行使用。

## 快速开始

### 方式一：build-and-deploy.sh

```bash
# Docker 构建并运行
bash build-and-deploy.sh --docker

# 或使用 Docker Compose（推荐，含 volume 挂载）
bash build-and-deploy.sh --docker-compose
```

### 方式二：直接使用 Docker 命令

```bash
# 构建镜像
docker build -t mdeditor2:latest .

# 运行（挂载 ./data 为文件树根目录）
mkdir -p data
docker run -d --rm --name mdeditor2 -p 18080:18080 \
  -v $(pwd)/data:/app/data \
  -e TRIM_DATA_ACCESSIBLE_PATHS=/app/data \
  mdeditor2:latest
```

### 方式三：Docker Compose

```bash
# 构建并启动
docker compose up -d --build

# 查看日志
docker compose logs -f

# 停止
docker compose down
```

## 访问

- 本地：http://localhost:18080/
- 局域网：http://<本机IP>:18080/

| 宿主机 | 容器内 | 说明 |
|--------|--------|------|
| `./data` | `/app/data` | 编辑器的文件树根，Markdown 持久化到此目录 |

- 首次运行前执行 `mkdir -p data` 确保目录存在
- 在 `data/` 下创建子目录和 `.md` 文件，即可在编辑器中访问
- 详见 `data/README.md`

## 与 fnOS 的关系

| 场景       | 推荐方式              |
|------------|-----------------------|
| 飞牛 NAS 部署 | fnOS 原生（fnpack + install-fpk） |
| 本地开发/测试 | Docker 或 原生 build |
| CI/CD 构建 | Docker build          |
