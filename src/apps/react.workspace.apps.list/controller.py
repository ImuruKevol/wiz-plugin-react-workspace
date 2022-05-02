wiz = framework.model("wiz")
config = framework.config.load("wiz")
kwargs['CATEGORIES'] = config.get("category")