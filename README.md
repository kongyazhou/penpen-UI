# PENPEN—Client

* [概述](#概述)
* [开发环境](#开发环境)
* [系统概述](#系统概述)
* [技术选型](#技术选型)
* [客户端设计概述](#客户端设计概述)
* [参考资料](#参考资料)

## 概述

PENPEN是一个面向企业用户开发的移动端IM应用项目，致力于为企业用户打造灵活而可靠的通信方式。

PENPEN-Client是项目的客户端部分。

PENPEN-Client采用PhoneGap平台开发HTML5跨平台移动应用程序。

## 开发环境

```
本软件在windows 7系统下开发和调试，AMD 64位处理器。
```

#### 软件环境

**JDK**：Java开发环境

使用版本:1.8.0_73

查询命令:java -version

**PhoneGap**：APP调试环境

使用版本:6.0.1

查询命令:phonegap -v

**ionic**：UI框架，UI开发调试环境

使用版本:1.7.14

查询命令:ionic -v

**cordova**：源生API插件，APP编译环境

使用版本:6.1.0

查询命令:cordova -v

用到的Cordova插件：

- cordova-plugin-websocket（websocket）
- cordova-plugin-splashscreen（启动画面）
- ionic-plugin-keyboard（软键盘）
- cordova-plugin-statusbar（手机顶部状态栏）
- cordova-plugin-device(诸多插件依赖此插件)
- cordova-plugin-x-toast（toast）
- cordova-sqlite-storage(本地存储)
- cordova-plugin-media（播放、录制媒体文件）
- com.telerik.plugins.nativepagetransitions（源生体验）
- cordova-plugin-vibration（手机振动）
- cordova-plugin-file（文件传输）

- cn.jpush.phonegap.JPushPlugin（极光推送）

#### 开发工具

**Sublime 3**

使用的Sublime插件：

**SublimeLinter**：《[安装与使用](http://gaohaoyang.github.io/2015/03/26/sublimeLinter/)》
- SublimeLinter-jshint(JS语法检查),《[JSLint检测Javascript语法规范](http://www.zystudios.cn/blog/post/70.Shtml)》
- SublimeLinter-csslint(CSS语法检查)

**jsFormats**(JS格式对齐)

[**AngularJS**](https://github.com/angular-ui/AngularJS-sublime-package)(Angular提示)

**Babel**(ES6语法)

**在线调试**：

```
本项目中没有使用到，推荐一试。
```

[codepen](http://codepen.io/)：资源多

[RunJS](http://runjs.cn/)：国产

[jsfiddle](jsfiddle.net)：老牌

[CSS3 generator]()

参考文章《[Web前端开发实用在线工具](http://www.php100.com/html/webkaifa/DIV_CSS/2013/0107/11896.html)》

#### 调试工具

**ionic**：UI部分可以通过ionic提供的 **"ionic serve"** 命令在Chrome浏览器下进行调试。

**GapDebug**：连接设备实时调试。

PhoneGapDeveloper

Chrome的Batarang插件。

#### 测试工具

**Protactor**：为测试AngularJS而生。

**karma**单元测试

**Jasmine**写测试用例

## 系统功能

```
不带*号的将在1.0版本实现，带*号的将在2.0版本实现。
```

- **用户系统**

登录\注册\编辑信息

- **聊天系统**

文本、图片、语音聊天

实时语音聊天*

实时视频聊天*

- **会议系统** 

多人文本聊天

多人语音实时聊天*

多人视频实时聊天*

## 当前版本未使用，后续可以考虑加入的工具

[**Yeoman（Yo、Gulp、Bower）——前端工程化**](http://yeoman.io/)：代码生成器工厂，全是宝贵的财富哇

[**Gulp**](http://www.gulpjs.com.cn/)：代码合并和混淆工具，部署发布必备

[**bower**](http://bower.io/)：一个前端软件包管理工具，前端模块化必备，可以自己做个模块传上去之类，参见《[bower简明入门教程](http://www.wtoutiao.com/p/i1e8nJ.html)》《[如何使用bower包管理器](https://www.douban.com/note/495604729/)》

**Babel**：**ES6** 代码 源到源的编译器

[**Browserify/Webpack**](https://segmentfault.com/a/1190000002490637)：专业js打包工具

## 参考资料

[ionic-wechat](https://github.com/Frogmarch/ionic-wechat)：ionic模仿微信界面的作品，值得学习

[amazeui-touch](https://github.com/amazeui/amazeui-touch)：国产AmazeUI移动端UI框架

[Cordova官网](http://cordova.apache.org/)：各类源生API插件

[推荐10个免费在线测试网页性能工具](http://www.daqianduan.com/3962.html)
