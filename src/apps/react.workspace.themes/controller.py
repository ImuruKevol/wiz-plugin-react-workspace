wiz = framework.model("wiz")

fs = wiz.storage()
if fs.isdir("themes") == False:
    fs.makedirs("themes")

kwargs['THEMES'] = fs.files("themes")
kwargs["BRANCHPATH"] = wiz.branchpath()
