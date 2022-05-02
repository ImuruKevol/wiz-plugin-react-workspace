wiz = framework.model("wiz").instance()
yarn = wiz.model("react/yarn")
installed = yarn.__check__()
if installed == False:
    storage = wiz.model("react/storage").use()
    storage.yarn()
