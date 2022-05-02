wiz = framework.model("wiz")
branch = framework.request.segment.branch
if branch is None: branch = wiz.workspace.branch()
kwargs['BRANCH'] = branch
kwargs['BRANCHES'] = wiz.workspace.branches()