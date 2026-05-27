#!/bin/bash

# 日语学习网站 - 快速同步到iOS
# 用法: ./sync-to-ios.sh

set -e  # 遇到错误立即退出

echo "🚀 开始同步到 iOS..."

# 1. 构建 Web 端
echo "📦 构建 Web 端..."
npm run build

# 2. 同步到 iOS
echo "🔄 同步到 iOS 项目..."
npx cap sync ios

# 3. 打开 Xcode
echo "📱 打开 Xcode..."
npx cap open ios

echo "✅ 同步完成！现在可以在 Xcode 中运行 iOS 应用了"
