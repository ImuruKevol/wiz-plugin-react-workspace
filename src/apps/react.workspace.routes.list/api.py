def search(framework):
    wiz = framework.model("wiz")
    rows = wiz.data.rows(mode='route')
    framework.response.status(200, rows)