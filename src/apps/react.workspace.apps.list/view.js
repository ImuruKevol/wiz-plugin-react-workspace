let wiz_controller = async ($sce, $scope, $timeout) => {
    let timeout = (ts) => new Promise((resolve) => {
        $timeout(resolve, ts);
    });

    $scope.math = Math;

    $scope.datedisplay = function (date) {
        let targetdate = moment(date);
        let diff = new Date().getTime() - new Date(targetdate).getTime();
        diff =  diff / 1000 / 60 / 60;
        
        if (diff > 24)  return targetdate.format("YYYY-MM-DD hh:mm");
        if (diff > 1) return Math.floor(diff) + " hours ago"

        diff = diff * 60;

        if (diff < 2) return "just now";

        return Math.floor(diff) + " minutes ago";
    }

    $scope.list = [];
    $scope.facet = {};
    $scope.event = {};

    $scope.event.load = async () => {
        let res = await wiz.API.async("search");

        if (res.code != 200) {
            return
        }

        $scope.list = res.data;
        $scope.facet.count = $scope.list.length;

        $scope.list.sort((a, b)=> {
            return new Date(b.package.updated).getTime() - new Date(a.package.updated).getTime()
        });

        await timeout();
    }

    $scope.event.search = async (val) => {
        val = val.toLowerCase();
        for (var i = 0; i < $scope.list.length; i++) {
            let searchindex = ['title', 'namespace', 'route'];
            $scope.list[i].hide = true;
            for (let j = 0; j < searchindex.length; j++) {
                try {
                    let key = searchindex[j];
                    let keyv = $scope.list[i].package[key].toLowerCase();
                    if (keyv.includes(val)) {
                        $scope.list[i].hide = false;
                        break;
                    }
                } catch (e) {
                }
            }
            if (val.length == 0)
                $scope.list[i].hide = false;
        }

        $timeout();
    }

    $scope.event.open = (component) => {
        location.href = `/wiz/admin/react.workspace/apps/editor/${component}`;
    }

    await $scope.event.load();
};