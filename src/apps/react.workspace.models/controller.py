wiz = framework.model("wiz")
fs = wiz.storage()
if fs.isdir("interfaces/model") == False:
    fs.makedirs("interfaces/model")
kwargs["BRANCHPATH"] = wiz.branchpath()
