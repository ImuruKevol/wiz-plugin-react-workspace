import os
import season
import json

wiz = framework.model("wiz").instance()
_data = wiz.model("react/storage")

def search(framework):
    component = framework.request.query("component", True)
    data = _data.use("src")
    rows = data.app.rows()
    framework.response.status(200, rows)

def info(framework):
    component = framework.request.query("component", True)
    data = _data.use("src")
    res = data.app.get(component)
    if res is None:
        framework.response.status(404)
    framework.response.status(200, res)

def update(framework):
    component = framework.request.query("component", True)
    _info = framework.request.query("info", True)
    _info = json.loads(_info)
    data = _data.use("src")
    mode = framework.request.query("mode", None)
    if mode == "new":
        name = framework.request.query("name", True)
        _info = data.__template__(name)
    data.app.update(_info)
    framework.response.status(200)

def delete(framework):
    component = framework.request.query("component", True)
    data.app.delete(component)
    framework.response.status(200)

def package_json(framework):
    yarn = _data.use().yarn()
    _info = yarn.info()
    except_target = ["@babel/core", "@babel/cli", "@babel/preset-env", "@babel/plugin-transform-react-jsx", "@babel/preset-react", "esbuild", "esbuild-sass-plugin", "node-sass"]
    # except_target = []
    dependencies = {}
    for pkg in _info["dependencies"]:
        if pkg not in except_target:
            dependencies[pkg] = _info["dependencies"][pkg]
    devDependencies = {}
    for pkg in _info["devDependencies"]:
        if pkg not in except_target:
            devDependencies[pkg] = _info["devDependencies"][pkg]
    framework.response.status(200, {
        "dependencies": dependencies,
        "devDependencies": devDependencies,
    })

def package_add(framework):
    package_name = framework.request.query("package_name", True)
    add_dev = framework.request.query("add_dev", True)
    yarn = _data.use().yarn()
    targets = [package_name]
    mode = "dev" if add_dev else "normal"
    yarn.add(*targets, mode=mode)
    framework.response.status(200)

def package_remove(framework):
    package_name = framework.request.query("package_name", True)
    except_target = ["@babel/core", "@babel/cli", "@babel/preset-env", "@babel/plugin-transform-react-jsx", "@babel/preset-react", "esbuild", "esbuild-sass-plugin", "node-sass"]
    if package_name in except_target:
        framework.response.status(500, f"Do not remove {package_name}")
    add_dev = framework.request.query("add_dev", True)
    yarn = _data.use().yarn()
    targets = [package_name]
    mode = "dev" if add_dev else "normal"
    yarn.remove(*targets, mode=mode)
    framework.response.status(200)
