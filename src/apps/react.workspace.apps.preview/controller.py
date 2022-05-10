import season
import markupsafe
import os

segment = framework.request.segment
component = segment.component
if component is None:
    framework.response.status(404, "Do not found Component")

path = framework.request.query("path", True)
if path is None:
    framework.response.status(404, "Do not found path")

wiz = framework.model("wiz").instance()
data = wiz.model("react/storage").use("src")
build_path = wiz.model("react/yarn").build_absdir()
build_filepath = os.path.join(build_path, f"{component}.js")
data.app.refresh(component, path=path)
js = data.read.text(build_filepath)

css_path = os.path.join(build_path, f"{component}.css")
css = ""
if data.exists(css_path):
    css = data.read.text(css_path)
    css = f"<style>{css}</style>"

view = f"<div class='container'><div id='{component}-root'></div></div>"
view = f"{css}{view}<script>{js}</script>"
view = wiz.theme("react", "base", "layout.pug", view=view)
view = markupsafe.Markup(view)
wiz.response.send(view, "text/html")
