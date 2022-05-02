def search(framework):
    wiz = framework.model("wiz")
    rows = wiz.data.rows(mode='app')
    framework.response.status(200, rows)