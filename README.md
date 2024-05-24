# 注意事项
	此项目与单脚本结构不同,请不要将无关文件放进parse目录
	请不要将parse目录文件放scripts目录运行
	某些面板不支持项目文件整体拉取,会破坏拉取的项目结构,请先翻阅README了解
	环境变量不能有shareCode 

# 框架结构
	util: 调用函数目录
	parse: 解析脚本目录
    temp: 缓存文件目录
	static: 静态文件目录
	cookie: 数据文件目录
	config:	配置文件目录
	log: 日志文件目录
	template.js: 项目主体文件
	main.js: 项目入口文件
	qitoCreat: 生成入口以及添加定时

# 使用方法
	node main.js jd_task_test [-help n -custom x -limit x]

# 初始化
	QITOQITO_PLATFORM=按照所使用面板正确填写 qinglong|jtask|jd 其中一个 [青龙面板:qinglong, v3系列:jtask, 衍生面板:jd],
	QITOQITO_SYNC=1 当有此变量时,面板定时会与项目定时同步,如需自行修改,请勿添加该字段
	QITOQITO_COVER=1 当有此变量时候,qitoCreat会强制覆盖之前生成的入口文件

# 环境变量
	# COOKIE
	JD_COOKIE=ck1&ck2&ck3
	JD_COOKIE_MAIN=n 全局主号助力人数,假设你有20个账号,当参数设置为5时候,这20个账号会去助力排前面的5个账号
    msgWhite=fn1|fn2|fn3  通知白名单
    msgBlack=fn1|fn2|fn3  通知黑名单


# 脚本字段
    脚本字段是自行定义某一个脚本运行的一些变量,如果有需求可自行添加环境变量
    
    filename_help=n 或 pin1|pin2 (设置助力主号数)
    filename_custom=custom (自定义字段)
	filename_limit=n (限制运行账号数)
	filename_msgWork=pin1|pin2|pin3 (通知账号白名单)
    filename_msgExcept=pin1|pin2|pin3 (通知账号黑名单)

# 食用方法
    # qinglong面板
    rm -rf /ql/data/repo/qitoqito_kedaya && ql repo https://github.com/qitoqito/kedaya.git kedaya && cp -a /ql/data/repo/qitoqito_kedaya/. /ql/data/scripts && task qitoCreat.js now
    # 青龙面板(旧)
	rm -rf /ql/repo/qitoqito_kedaya && ql repo https://github.com/qitoqito/kedaya.git kedaya && cp -a /ql/repo/qitoqito_kedaya/. /ql/scripts && task qitoCreat.js now
   
    # v3系列
    rm -rf kedaya && git clone  https://github.com/qitoqito/kedaya.git  && cp -a kedaya/. ./scripts && jtask qitoCreat now
    
     # 衍生面板
    rm -rf kedaya && git clone  https://github.com/qitoqito/kedaya.git  && cp -a kedaya/. ./scripts && jd qitoCreat now
    
    # 其他面板
    同步解压到scripts目录,运行creat.js生成入口文件

# 定时任务
    # v3系列
    45 * * * * bash -c "rm -rf kedaya && git clone  https://github.com/qitoqito/kedaya.git  && cp -a kedaya/. ./scripts && jtask qitoCreat now"
    
    # 衍生面板
    45 * * * * bash -c "rm -rf kedaya && git clone  https://github.com/qitoqito/kedaya.git  && cp -a kedaya/. ./scripts && jd qitoCreat now"
    
# 京东SIGN
    如果环境变量中,已经部署过 JD_SIGN_API, JD_SIGN_KRAPI 可以跳过以下步骤

```
docker run -dit \
  --name official \
  --restart always \
  --hostname official \
  -p 9527:80 \
  qninq/signapi:latest
  
添加环境变量 QITOQITO_JDSIGN=http://ip:9527/jd/sign
```
   
	 
# 通知字段

	# telegram
	TELEGRAM_TOKEN=
	TELEGRAM_ID=
	TELEGRAM_URL=自定义TG代理链接
	TELEGRAM_PROXY=代理服务器 (http|https|sock)://ip:port, 使用sock需要安装 socks-proxy-agent 模块

	# bark
	BARK_TOKEN=
	BARK_URL=自定义url
	BARK_SOUND=自定义铃声

	# 钉钉
	DINGTALK_TOKEN=
	DINGTALK_SECRET=密钥

	# igot
	IGOT_TOKEN=

	# server酱
	FTQQ_TOKEN=

	# pushplus
	PUSHPLUS_TOKEN=
	PUSHPLUS_TOPIC=群组

	# 企业微信
	WEIXIN_TOKEN=

	# 企业微信AM
	WXAM_TOKEN=

# 通知昵称
	运行jd_task_user
    编辑config/jdUser.js
	找到对应账号的nickName字段填写后保存

# 单独通知
	框架支持给不同用户推送通知

    
