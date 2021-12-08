# 初始化

为避免第三方滥用,请自行添加环境变量

	QITOQITO=UdlM2TYTZzADOwM:cb3d623b4bdf699c8464b50ad61c25dcbc655711
# 环境变量
	# COOKIE
	JD_COOKIE=面板自带,不需要自行添加
	JD_COOKIE_MAIN=全局主号助力人数

	# 脚本类, 以文件名 jd_task_test 为例
	jd_task_test_help=脚本主号助力人数
# 食用
    # 面板类
	同步解压到scripts目录,运行creat.js生成入口文件
    # 青龙
	ql repo https://github.com/qitoqito/kedaya.git kedaya && cp -a /ql/repo/qitoqito_kedaya/. /ql/scripts && task creat.js

	青龙: task jd_task_test
	v4面板: jtask|jd jd_task_test
	其他: task jd_task_test



# 通知

	# telegram
	TELEGRAM_TOKEN=
	TELEGRAM_ID=
	TELEGRAM_URL=自定义TG代理链接

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
