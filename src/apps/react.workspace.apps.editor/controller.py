import time

segment = framework.request.segment
# print(segment)

wiz = framework.model("wiz").instance()
data = wiz.model("react/storage").use("src")
rows = data.app.rows()
if len(rows) == 0:
    framework.response.redirect("/wiz/admin/react.workspace/apps/list")

if "component" not in segment:
    info = rows[0]
    component = info['package']['component']
else:
    component = segment['component']

kwargs['IS_DEV'] = True
kwargs["COMPONENT"] = component
