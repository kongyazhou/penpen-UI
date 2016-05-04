# PENPEN—Client

* [概述](#概述)
* [待解决问题](#待解决问题)
* [开发环境](#开发环境)
* [快速迭代](#快速迭代)
* [系统功能](#系统功能)
* [参考资料](#参考资料)

## 概述

PENPEN是一个面向企业用户开发的移动端IM应用项目，致力于为企业用户打造灵活而可靠的沟通平台。

PENPEN-Client是项目的客户端部分。

PENPEN-Client采用PhoneGap平台开发HTML5跨平台移动应用程序。

## 待解决问题

```
此处汇总目前已上线功能所存在的所有问题，以便参照存在的问题进行后续工作。
```
#### 主要问题

1. 图片消息未计入未读消息数目中[估计是没刷新界面]
2. 更新头像立即生效[AngularJS]
3. 表情系统

#### 次要问题

1. 查看联系人详情时，同步该联系人签名和头像
2. 推送带上发送者信息
3. 正在聊天的联系人信息停止推送
4. 打开app清除所有推送消息
6. 添加聊天置顶和删除等功能
7. **同步所有消息**[新功能]4
8. **消息缓存读取**[新功能]4
7. **Resume后界面应立即刷新一次**[AngularJS]
9. 头像裁剪后不是128*128
10. 每次进入创建讨论组页面不会清除之前的设置
11. 给自己发消息怎么处理
15. **服务器安全认证授权系统**[通信协议]3
16. **多种编码,协议升级**[通信协议]3
17. **通知功能**[新功能]2
18. 用户发送通知的权限
22. 历史后退并使用Native切换效果
24. 修改讨论组名称
26. 添加讨论组成员
27. 退出讨论组
28. **搜索算法**
29. **长页面(列表)加载**
30. 设备号
32. 改搜索为散列
33. groupInit函数重做
34. getContact函数机制重做
35. contactInit放到服务器上去做
36. 发送语音

```
下边是服务器所存在的所有问题
```

13. 服务器进程看门狗
14. 服务器程序开机启动
15. 性能测试

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

**gulp**：构建工具，压缩混淆打包

使用版本:3.9.1

查询命令:gulp -v

**cordova**：源生API插件，APP编译环境

使用版本:6.1.0

查询命令:cordova -v

用到的Cordova插件：

- cordova-plugin-websocket（websocket）
- cordova-plugin-splashscreen（启动画面）
- cordova-plugin-statusbar（手机顶部状态栏）
- cordova-plugin-device(诸多插件依赖此插件)
- cordova-plugin-x-toast（toast）
- cordova-plugin-media（播放、录制语音文件）
- cordova-plugin-vibration（手机振动）
- cordova-plugin-file（文件读写）
- cordova-plugin-file-transfer（文件传输）
- cordova-sqlite-storage(本地存储)
- cordova-plugin-image-picker（选取照片并处理）
- cordova-plugin-camera（拍照）
- ionic-plugin-keyboard（软键盘）
- cn.jpush.phonegap.JPushPlugin（极光推送）
- com.telerik.plugins.nativepagetransitions（源生体验）

#### 开发工具

**Sublime 3**

使用的Sublime插件：

SublimeLinter：《[安装与使用](http://gaohaoyang.github.io/2015/03/26/sublimeLinter/)》
- SublimeLinter-jshint(JS语法检查)，《[JSLint语法错误一览](http://www.zystudios.cn/blog/post/70.Shtml)》《[设置JSHint](https://segmentfault.com/a/1190000000512948)》
- SublimeLinter-csslint(CSS语法检查)

jsFormats(JS格式对齐)

[AngularJS](https://github.com/angular-ui/AngularJS-sublime-package)(Angular提示)

[HTMLPrettify](https://github.com/victorporof/Sublime-HTMLPrettify)：有了这个，jsFormats、cssFormats好像都不需要了...

**在线代码预览**：

```
本项目中没有使用到，推荐一试。
```

[codepen](http://codepen.io/)：资源多

[RunJS](http://runjs.cn/)：国产

[jsfiddle](jsfiddle.net)：老牌

参考文章《[Web前端开发实用在线工具](http://www.php100.com/html/webkaifa/DIV_CSS/2013/0107/11896.html)》

#### 调试工具

ionic：UI部分可以通过ionic提供的 " *ionic serve* " 命令在Chrome浏览器下进行调试。

GapDebug：连接设备实时调试。

PhoneGapDeveloper

Chrome的Batarang插件。

#### 测试工具

```
小项目测试有点奢侈了
测试代码的时间都够开发个项目了
不过工具还是要熟悉下
```

Protactor：为测试AngularJS而生。

karma：单元测试

Jasmine：编写测试用例

#### 构建工具

```bash
gulp && cordova build android
```

```
由于某些原因(PhoneGap在线编译不能使用Cordova插件等)，两种方式不能并存，所以应在开发伊始选好构建平台。
本项目使用cordova本地编译构建方式。
```

cordova/ionic：本地编译构建，《[Ionic toturial for building a release.apk](https://forum.ionicframework.com/t/ionic-toturial-for-building-a-release-apk/15758)》

[phonegap build](https://build.phonegap.com)：在线编译构建

gulp：压缩混淆打包


用到的gulp插件：

```
npm i gulp-XXX --save-dev
```
[gulp-uglify](https://www.npmjs.com/package/gulp-uglify)

[gulp-concat](https://www.npmjs.com/package/gulp-concat)

[gulp-ng-annotate](https://www.npmjs.com/package/gulp-ng-annotate)

[gulp-htmlmin](https://github.com/jonschlinkert/gulp-htmlmin)

[gulp-clean-css](https://github.com/scniro/gulp-clean-css)

## 快速迭代

1. 从Github上clone该项目
2. 安装配置开发环境
3. 双击运行init.bat(安装cordova插件并添加平台)
4. 执行命令"npm install"(安装gulp及插件)
5. gulp && cordova build android

## 系统功能

```
不带*号的将在1.0版本实现，带*号的将在2.0版本实现。
在1.0版本正式发布之前将不做版本管理。
```

- **用户系统**

登录\注册\编辑信息

- **聊天系统**

文本、图片、语音聊天

实时语音聊天*

实时视频聊天*

- **讨论组系统** 

多人文本聊天

多人语音实时聊天*

多人视频实时聊天*

## 相关竞品

1. [融云](http://www.rongcloud.cn/)
2. [Exis](https://www.exis.io/)
3. [LeanCloud(AVOS)](https://leancloud.cn/)
4. [网易云信](http://netease.im/)

## 参考资料

[ionic-wechat](https://github.com/Frogmarch/ionic-wechat)：ionic模仿微信界面的作品，值得学习

[amazeui-touch](https://github.com/amazeui/amazeui-touch)：国产AmazeUI移动端UI框架

[Cordova官网](http://cordova.apache.org/)：各类源生API插件

[推荐10个免费在线测试网页性能工具](http://www.daqianduan.com/3962.html)

[Yeoman（Yo、Gulp、Bower）——前端工程化](http://yeoman.io/)

[bower](http://bower.io/)：一个前端软件包管理工具，前端模块化必备，可以自己做个模块传上去之类，参见《[bower简明入门教程](http://www.wtoutiao.com/p/i1e8nJ.html)》《[如何使用bower包管理器](https://www.douban.com/note/495604729/)》

Babel：ES6 代码 源到源的编译器

[Webpack](http://webpack.github.io/)：比上面更强大，更好用的打包工具

[shell脚本中echo显示内容带颜色](http://www.cnblogs.com/lr-ting/archive/2013/02/28/2936792.html)
