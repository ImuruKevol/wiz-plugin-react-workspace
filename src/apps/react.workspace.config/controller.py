wiz = framework.model("wiz")
fs = wiz.storage()
if fs.isdir("config") == False:
    fs.makedirs("config")
kwargs["BRANCHPATH"] = wiz.branchpath()
