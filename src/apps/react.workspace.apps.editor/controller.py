import time

segment = framework.request.segment

wiz = framework.model("wiz").instance()
data = wiz.model("react/storage").use("src")
rows = data.app.rows(onlyname=False)
if len(rows) == 0:
    framework.response.redirect("/wiz/admin/react.workspace/apps/list")

if "component" not in segment:
    info = rows[0]
    component = info['package']['component']
    path = info['package']['path']
else:
    component = segment['component']
    path = ""
    try:
        path = framework.request.query("path", None)
        if path is None:
            path = ""
    except:
        pass
kwargs['IS_DEV'] = True
kwargs["COMPONENT"] = component
kwargs["PATH"] = path
