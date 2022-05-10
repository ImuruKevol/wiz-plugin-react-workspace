wiz = framework.model("wiz").instance()

def search(framework):
    _data = wiz.model("react/storage")
    data = _data.use("src")
    rows = data.app.rows(onlyname=False)
    framework.response.status(200, rows)