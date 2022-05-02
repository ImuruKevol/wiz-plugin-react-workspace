wiz = framework.model("wiz")
fs = wiz.storage()
if fs.isdir("resources") == False:
    fs.makedirs("resources")
kwargs["BRANCHPATH"] = wiz.branchpath()
