import season
import time
wiz = framework.model("wiz")
config = wiz.config.load("wiz")

WIZ_CONTROLLER = '### wiz.request.query(<KEY>, <DEFAULT_VALUE>)\n# data = wiz.request.query() # get all queries as dict type\n# value = wiz.request.query("key", "test") # get `key` value, if not exist in query, return default value\n# value = wiz.request.query("key", True) # if default value is True, this key required\n\n### load text from dictionary\n# hello = dic("hello")\n# title = dic("title.text")\n\n### use selected controller\n# controller.custom_function()\n\n### use segments\n### Route: /board/<category>/list\n### View URI: /board/notice/list\n# segment = framework.request.segment\n\n### render app\n# wiz.response.render("main")\n# wiz.response.render("app_namespace")\n# wiz.response.render("<url_pattern_1>", "<app_namespace>", key="value", key2="value2")\n# wiz.response.render("<url_pattern_2>", "<app_namespace>", key="value", key2="value3")\n# wiz.response.status(200)\n'

app_id = framework.request.segment.app_id
if app_id is None:
    framework.response.redirect("apps/list")

if app_id == 'new':
    pkg = dict()
    pkg["id"] = framework.lib.util.randomstring(12) + str(int(time.time()))
    pkg["title"] = "New Route"
    pkg["namespace"] = pkg["id"]
    pkg["route"] = ""
    pkg["viewuri"] = ""

    info = dict()
    info["package"] = pkg
    info["controller"] = WIZ_CONTROLLER
    info["dic"] = dict()
    info["dic"]["default"] = dict()
    info["dic"]["default"]["hello"] = "hello"
    info["dic"]["ko"] = dict()
    info["dic"]["ko"]["hello"] = "안녕하세요"

    wiz.data.update(info, mode='route')
    framework.response.redirect("routes/editor/" + pkg["id"])

info = wiz.data.get(app_id, mode='route')
if info is None:
    framework.response.redirect("list")

kwargs['IS_DEV'] = wiz.is_dev()
kwargs['BRANCH'] = wiz.workspace.branch()
kwargs['BRANCHES'] = wiz.workspace.branches()
kwargs['CTRLS'] = wiz.controllers()
kwargs['APPID'] = app_id