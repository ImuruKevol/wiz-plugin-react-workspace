let wiz_controller = async ($sce, $scope, $timeout) => {
    _builder($scope, $timeout);

    const $_timeout = $timeout;
    $timeout = (ts) => new Promise((resolve) => $_timeout(resolve, ts));

    $scope.trustAsHtml = $sce.trustAsHtml;

    $scope.branch = wiz.data.BRANCH;
    $scope.branches = wiz.data.BRANCHES;

    $scope.change = async (branch) => {
        location.href = "/wiz/admin/workspace/logger/" + branch;
    }

    let ansi_up = new AnsiUp();
    let socket = io("/wiz");

    $scope.socket = {};
    $scope.socket.log = "";
    $scope.socket.clear = async () => {
        $scope.socket.log = "";
        await $timeout();
    }

    socket.on("connect", async (data) => {
        if (!data) return;
        $scope.socket.id = data.sid;
        socket.emit("join", { id: wiz.data.BRANCH });
    });

    socket.on("log", async (data) => {
        data = data.replace(/ /gim, "__SEASONWIZPADDING__");
        data = ansi_up.ansi_to_html(data).replace(/\n/gim, '<br>').replace(/__SEASONWIZPADDING__/gim, '<div style="width: 6px; display: inline-block;"></div>');
        $scope.socket.log = $scope.socket.log + data;

        await $timeout(200);

        let element = $('.debug-messages')[0];
        if (!element) return;
        element.scrollTo(0, element.scrollHeight);
    });

    socket.on("message", async (data) => {
        if (data.type == "status") {
            $scope.socket.users = data.users;
            await $timeout();
        }
    });


    $scope.shortcut = {};
    $scope.shortcut.configuration = () => {
        return {
            'clear': {
                key: 'Ctrl KeyK',
                fn: async () => {
                    await $scope.socket.clear();
                }
            }
        }
    };

    $scope.shortcut.bind = async () => {
        $(window).unbind();

        let shortcut_opts = {};
        let shortcuts = $scope.shortcut.configuration();
        for (let key in shortcuts) {
            let keycode = shortcuts[key].key;
            let fn = shortcuts[key].fn;
            if (!keycode) continue;
            shortcut_opts[keycode] = async (ev) => {
                ev.preventDefault();
                await fn();
            };
        }

        shortcutjs(window, shortcut_opts);
    }

    window.addEventListener("focus", $scope.shortcut.bind, false);
}