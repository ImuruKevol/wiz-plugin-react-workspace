import time

segment = wiz.request.segment
path = segment.path.split("/")
app_id = path[0]
if app_id == "new":
    if len(path) <= 2:
        wiz.response.status(500, "if create new app, require app_name")

component = "App"
if len(path) > 1:
    component = path[1]

is_new = app_id == "new"
if is_new:
    app_id = wiz.model("util").randomstring(12) + str(int(time.time()))

data = wiz.model("react/storage").use(app_id)

tbl_app = wiz.model("mysql").use("app")
kwargs["is_new"] = is_new
if is_new:
    _info = tbl_app.get(app_id=app_id)
    if _info is None:
        info = data.__template__(app_id, component)
        data.app.update(info)
        tbl_app.insert({
            "app_id": app_id,
        })
    wiz.response.redirect(f"/app/develop/editor/{app_id}/{component}")

apps = tbl_app.rows(app_id=app_id, orderby="updated desc limit 1")
if len(apps) == 0:
    wiz.response.redirect("/main")
app = apps[0]
info = data.app.get(app_id, component)
if info is None:
    wiz.response.redirect("/main")

kwargs['IS_DEV'] = True
kwargs['APPUID'] = app_id
kwargs["APPCOMPONENT"] = component
