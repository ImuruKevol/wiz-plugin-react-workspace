segment = framework.match("routes/<view>/<path:path>")
if segment is not None:
    if segment.view is None:
        framework.response.redirect("routes/list")
    framework.layout('core.theme.layout', navbar=True, monaco=False)
    framework.render("routes/list", "react.workspace.routes.list")

    framework.layout('core.theme.layout', navbar=False, monaco=True)
    framework.render("routes/editor/<app_id>", "react.workspace.routes.editor")

segment = framework.match("apps/<view>/<component>")
if segment is not None:
    if segment.view is None:
        framework.response.redirect("apps/list")
    
    framework.layout('core.theme.layout', navbar=True, monaco=False)
    framework.render("apps/list", "react.workspace.apps.list")

    framework.layout('core.theme.layout', navbar=False, monaco=True)
    framework.render("apps/editor/<component>", "react.workspace.apps.editor")

    if segment.view == 'new':
        wiz = framework.model('wiz').instance()
        data = wiz.model("react/storage").use("src")
        component = segment.component
        info = data.__template__(component)
        data.app.update(info)
        framework.response.redirect(f"apps/editor/{component}")

    if segment.view == 'preview':
        component = segment.component
        framework.request.segment = season.stdClass()
        framework.layout('core.theme.layout', navbar=False, monaco=False)
        framework.render("apps/preview/<component>", "react.workspace.apps.preview")

framework.layout('core.theme.layout', navbar=True, monaco=True)
framework.render("res", "react.workspace.resources")
framework.render("ctrls", "react.workspace.controllers")
framework.render("models", "react.workspace.models")
framework.render("config", "react.workspace.config")
framework.render("themes", "react.workspace.themes")

framework.layout('core.theme.layout', navbar=False, monaco=False)
framework.render("logger/<branch>", "react.workspace.logger")

framework.response.redirect("/wiz/admin/react.workspace/routes/list")