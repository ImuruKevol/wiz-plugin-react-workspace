const _builder = function ($scope, $timeout) {
    $scope.modal = {};
    $scope.modal.alert = function (message) {
        $scope.modal.color = 'btn-danger';
        $scope.modal.message = message;
        $('#modal-alert').modal('show');
        $timeout();
    }

    $scope.modal.success = function (message) {
        $scope.modal.color = 'btn-primary'
        $scope.modal.message = message;
        $('#modal-alert').modal('show');
        $timeout();
    }

    $scope.monaco = (language) => {
        return {
            value: '',
            language: language,
            theme: "vs-dark",
            fontSize: 14,
            automaticLayout: true,
            minimap: {
                enabled: false
            }
        };
    }
}

const shortcutjs = function (element, config) {
    return new (function () {
        const self = this;
        self.holdings = {};
        if (!config) config = {};

        const isMacLike = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
        let KEYMOD = { 'MetaLeft': 'meta', 'MetaRight': 'meta','OSLeft': 'meta', 'OSRight': 'meta', 'ControlLeft': 'ctrl', 'ControlRight': 'ctrl', 'AltLeft': 'alt', 'AltRight': 'alt', 'ShiftLeft': 'shift', 'ShiftRight': 'shift' };
        if (isMacLike) {
            KEYMOD = { 'MetaLeft': 'ctrl', 'MetaRight': 'ctrl', 'OSLeft': 'ctrl', 'OSRight': 'ctrl', 'ControlLeft': 'meta', 'ControlRight': 'meta', 'AltLeft': 'alt', 'AltRight': 'alt', 'ShiftLeft': 'shift', 'ShiftRight': 'shift' };
        }

        self.shortcut = {};

        self.set_shortcut = function (name, fn) {
            name = name.toLowerCase();
            name = name.split('|');
            for (let i = 0; i < name.length; i++) {
                let _name = name[i].replace(/  /gim, ' ').trim().split(' ');
                if (_name == 'default') {
                    self.shortcut[_name] = fn;
                    continue;
                }
                _name.sort();
                _name = _name.join(' ');
                self.shortcut[_name] = fn;
            }
        }

        for (let name in config) {
            self.set_shortcut(name, config[name]);
        }

        $(element).keydown(function (ev) {
            const keycode = ev.code;
            self.holdings[keycode] = true;

            let keynamespace = [];
            for (let key in self.holdings) {
                if (KEYMOD[key]) {
                    keynamespace.push(KEYMOD[key].toLowerCase());
                } else {
                    keynamespace.push(key.toLowerCase());
                }
            }

            keynamespace.sort();
            keynamespace = keynamespace.join(' ');
            keynamespace = keynamespace.toLowerCase();

            if (self.shortcut[keynamespace]) {
                delete self.holdings[keycode];
                self.shortcut[keynamespace](ev, keynamespace);
                ev.proceed = true;
            }

            if (self.shortcut['default']) {
                self.shortcut['default'](ev, keynamespace);
            }
        });

        $(element).keyup(function (ev) {
            const keycode = ev.code;
            if (self.holdings[keycode])
                delete self.holdings[keycode];
        });
    });
}

const IS_DEV = wiz.data.IS_DEV;
const COMPONENT = wiz.data.COMPONENT;
const LOCALSTORAGEID = "season.wiz.react.configuration";
const APP_URL = "/apps/editor";
let API_URL = wiz.API.url("");
API_URL = API_URL.substring(0, API_URL.length - 1);

const TABS = ['api', 'react', 'scss', 'dic', "preview"];
const CODELIST = [
    { id: 'api', name: 'API' },
    { id: 'react', name: 'REACT' },
    { id: 'scss', name: 'SCSS' },
    { id: 'dic', name: 'Dictionary' },
    { id: 'preview', name: 'Preview' }
];
let LANGSELECTOR = ($scope) => {
    return async (tab) => {
        const lang = $scope.configuration.tab[tab + '_val'];
        switch(lang) {
            case "api": return "python";
            case "react": return "javascript";
            case "scss": return "css";
            case "dic": return "json";
            default: return "python";
        }
    }
};
let PROPERTY_WATCHER = async ($scope, key) => {
    for (let targettab in $scope.app.editor.properties) {
        if ($scope.configuration.tab[targettab + "_val"] == key) {
            await $scope.app.editor.code.change(targettab, key);
        }
    }
};
let PREVIEW_URL = async (component) => {
    return `apps/preview/${component}`;
}

let wiz_controller = async ($sce, $scope, $timeout) => {
    _builder($scope, $timeout);

    const $_timeout = $timeout;
    $timeout = (ts) => new Promise((resolve) => $_timeout(resolve, ts));

    let hash = location.hash.split("#")[1];
    if (hash) {
        let path = location.pathname.split("/");
        path = path.splice(0, path.length - 1);
        path.push(hash);
        path = path.join("/");
        location.href = path;
    }

    const getComponentName = () => {
        const { react } = $scope.app.data;
        const res = /export[\s]+default[\s]+([a-zA-Z]+);?/gim.exec(react);
        if (!res) return;
        return res[1];
    }

    /*
     * define variables
     */
    let BUILDER = {};

    let API = {
        search: async () => {
            return await wiz.API.async("search", {component: COMPONENT});
        },
        load: async (component) => {
            return await wiz.API.async("info", {component});
        },
        update: async (data) => {
            return await wiz.API.async("update", {
                component: COMPONENT,
                info: JSON.stringify({
                    ...data,
                    package: {
                        ...data.package,
                        component: getComponentName(),
                    }
                }),
            });
        },
        create: async (component, data) => {
            return await wiz.API.async("update", {
                component: COMPONENT,
                mode: "new",
                name: component,
                info: JSON.stringify(data),
            });
        },
        delete: async () => {
            const component = $scope.app.package.component;
            return await wiz.API.async("delete", {
                component,
            });
        },
        clean: () => new Promise((resolve, reject) => {
            $.get('/wiz/admin/setting/api/config/clean', API.handler(resolve, reject));
        }),
        package_json: async () => {
            return await wiz.API.async("package_json");
        },
        package_add: async (package_name, add_dev) => {
            return await wiz.API.async("package_add", {package_name, add_dev});
        },
        package_remove: async (package_name, add_dev) => {
            return await wiz.API.async("package_remove", {package_name, add_dev});
        },
        timeout: $timeout,
    };

    $scope.API = API;

    /*
     * define variables of scope
     */
    $scope.trustAsHtml = $sce.trustAsHtml;
    $scope.configuration = {};       // state data for maintaining ui
    $scope.layout = {};              // controller for layout
    $scope.workspace = {};           // controller for workspace
    $scope.loading = {};             // controller for display loading
    $scope.modal = {};               // controller for modal
    $scope.plugin = {};              // manage plugins for ui components
    $scope.app = {};                 // controller for code editor
    $scope.browse = {};              // controller for code editor
    $scope.shortcut = {};
    $scope.viewer = {};
    $scope.yarn = {};

    /* 
     * load wiz editor options from localstorage
     */
    try {
        let configuration = JSON.parse(localStorage[LOCALSTORAGEID]);
        try { delete configuration.layout.opts.root.lastComponentSize; } catch (e) { }
        $scope.configuration = configuration;
    } catch (e) {
        $scope.configuration = {};
        $scope.configuration.tab = {};
        $scope.configuration.tab['tab1_val'] = TABS[0];
        $scope.configuration.tab['tab2_val'] = TABS[1];
        $scope.configuration.tab['tab3_val'] = TABS[2];
        $scope.configuration.layout = 2;
        $scope.configuration.layout_menu_width = 360;
        $scope.configuration.workspace = 0;
    }

    if (!$scope.configuration.workspace) {
        $scope.configuration.workspace = 0;
    }

    $scope.$watch("configuration", function () {
        let configuration = angular.copy($scope.configuration);
        localStorage[LOCALSTORAGEID] = JSON.stringify(configuration);
    }, true);

    /* 
     * layout selector using split pane
     */
    BUILDER.layout = async () => {
        $scope.layout.viewstate = {};
        $scope.layout.viewstate.root = { firstComponentSize: $scope.configuration.layout_menu_width };
        $scope.layout.viewstate.horizonal = {};
        $scope.layout.viewstate.vertical_1_1 = {};
        $scope.layout.viewstate.vertical_1_2 = {};

        $scope.layout.active_layout = $scope.configuration.layout;

        $scope.$watch("layout", function () {
            $scope.configuration.layout_menu_width = $scope.layout.viewstate.root.firstComponentSize;
            $scope.configuration.layout = $scope.layout.active_layout;
        }, true);

        $scope.layout.change = async (layout) => {
            $scope.layout.active_layout = layout;

            if (layout == 1) {
                $scope.layout.accessable_tab = ['tab1'];
            } else if (layout == 2) {
                $scope.layout.accessable_tab = ['tab1', 'tab2'];
            } else if (layout == 3) {
                $scope.layout.accessable_tab = ['tab1', 'tab2', 'tab3'];
            }

            let _width = $('#editor-area').width();
            if (layout == 1) {
                $scope.layout.viewstate.vertical_1_1.lastComponentSize = 0;
            } else if (layout == 2) {
                $scope.layout.viewstate.vertical_1_1.lastComponentSize = Math.round(_width / 2);
                $scope.layout.viewstate.vertical_1_2.lastComponentSize = 0;
            } else if (layout == 3) {
                $scope.layout.viewstate.vertical_1_1.lastComponentSize = Math.round(_width / 3 * 2);
                $scope.layout.viewstate.vertical_1_2.lastComponentSize = Math.round(_width / 3);
            }

            await $timeout();
        }
    }

    /*
     * define loading
     */
    BUILDER.loading = async () => {
        $scope.loading.status = true;
        $scope.loading.show = async () => {
            $scope.loading.status = true;
            await $timeout();
        }

        $scope.loading.hide = async () => {
            $scope.loading.status = false;
            await $timeout();
        }
    }

    /*
     * define modal events
     */

    BUILDER.modal = async () => {
        $scope.modal = {
            delete: async () => {
                $('#modal-delete').modal('show');
            },
            add_language: async () => {
                $('#modal-add-language').modal('show');
            },
            keymaps: async () => {
                $('#modal-keymaps').modal('show');
            },
            add_component: async () => {
                $('#modal-add-component').modal('show');
                await $timeout(500);
                const elmt = document.querySelector("#modal-add-component input");
                elmt.focus();
            },
            yarn: async (action = "show") => {
                $scope.yarn.package_name = "";
                $scope.yarn.add_dev = false;
                if(action === "show") {
                    $('#modal-yarn').modal({backdrop: 'static', keyboard: false});
                }
                else {
                    $('#modal-yarn').modal(action);
                }
            }
        }
    }

    /*
     * define workspace controller
     */

    BUILDER.workspace = async () => {
        $scope.workspace.list = [
            { id: 'app', name: 'App' },
            { id: 'browse', name: 'Browse' },
        ];

        $scope.workspace.toggle = async (tab = null) => {
            const { list, active_workspace } = $scope.workspace;
            let target = 1;
            if (tab === null) {
                switch(active_workspace) {
                    case list[0].id: target = 1; break;
                    case list[1].id: target = 0; break;
                    default: target = 1;
                }
            }
            else {
                target = tab;
            }
            $scope.workspace.active_workspace = $scope.workspace.list[target].id;
            $scope.configuration.workspace = target;
            await $timeout();
        }

        $scope.workspace.active_workspace = $scope.workspace.list[$scope.configuration.workspace].id;
    }

    /*
     * define plugin interfaces for wiz
     */

    BUILDER.plugin = async () => {
        $scope.plugin.editor = {};
        $scope.plugin.editor.build = async (targettab, editor) => {
            let shortcuts = $scope.shortcut.configuration(window.monaco);

            for (let shortcutname in shortcuts) {
                let monacokey = shortcuts[shortcutname].monaco;
                let fn = shortcuts[shortcutname].fn;
                if (!monacokey) continue;

                editor.addCommand(monacokey, async () => {
                    await fn();
                    await $scope.shortcut.bind();
                });
            }
        }
    }

    /*
     * define app controller
     */

    BUILDER.app = {};

    BUILDER.app.base = async () => {
        $scope.app.save = async (returnres) => {
            let appdata = angular.copy($scope.app.data);
            try {
                for (let key in appdata.dic) {
                    if (appdata.dic[key] && appdata.dic[key].length > 0) {
                        appdata.dic[key] = JSON.parse(appdata.dic[key]);
                    } else {
                        delete data.dic[key];
                    }
                }
            } catch (e) {
                if (!returnres)
                    toastr.error("Dictionary syntax error");
                return { code: 500, data: e };
            }

            try {
                const { data } = $scope.browse;
                for(let i=0;i<data.length;i++) {
                    const item = data[i];
                    if(item.package.component === appdata.package.component) {
                        item.package.width = appdata.package.width;
                        item.package.height = appdata.package.height;
                        break;
                    }
                }
            } catch (e) {}

            let res = await API.update(appdata);

            if (returnres) return res;

            if (res.code == 200) {
                toastr.success("Saved");
                $scope.app.data.package.component = getComponentName();
                await $scope.app.preview();
            } else {
                toastr.error(res.data);
            }

            await $scope.shortcut.bind();
        }

        $scope.app.tab = {
            active: async tab => {
                $scope.app.tab.activetab = tab;
                await $timeout();
            }
        };

        $scope.app.delete = async () => {
            // let app_unique_id = $scope.app.id;
            // await API.delete(app_unique_id);
            // await $scope.browse.load();
            // location.href = APP_URL;
        }

        $scope.app.clean = async () => {
            // let app_unique_id = $scope.app.id;
            // await API.clean(app_unique_id);
            // $scope.app.preview();
            // toastr.success("Cache cleaned");
        }

        $scope.app.load = async (component) => {
            // show loading
            await $scope.loading.show();

            // load data
            const { data } = await API.load(component);
            $scope.app.component = component;
            $scope.app.data = data;
            Object.entries(data.dic).forEach(([key, value]) => {
                $scope.app.data.dic[key] = JSON.stringify(value, null, 4);
            })
            // for (let key in $scope.app.data.dic) {
            //     $scope.app.data.dic[key] = JSON.stringify($scope.app.data.dic[key], null, 4);
            // }
            await $scope.app.editor.build();
            await $scope.layout.change($scope.layout.active_layout);
            await $scope.loading.hide();
            await $scope.app.preview();

            await $timeout(500);

            if ($scope.app.tab.activetab && $scope.app.editor.cache[$scope.app.tab.activetab])
                $scope.app.editor.cache[$scope.app.tab.activetab].focus();

            if ($scope.app.data.package.properties) {
                for (let key in $scope.app.data.package.properties) {
                    $scope.$watch('app.data.package.properties.' + key, async (a, b) => {
                        if (a == b) return;
                        await PROPERTY_WATCHER($scope, key);
                    });
                }
            }

            if ($scope.app.data.package.viewcomponent) {
                $scope.$watch('app.data.package.viewcomponent', async (a, b) => {
                    if (a == b) return;
                    await $scope.app.preview();
                });
            }
            await $timeout();

            location.href = location.pathname + "#" + component;
        }

        $scope.app.preview = async () => {
            const { app } = $scope;
            const { viewcomponent } = app.data.package;
            const url = await PREVIEW_URL(app.id, viewcomponent);
            const targetComponent = $scope.browse.data.filter(comp => comp.package.component === viewcomponent)[0];
            let elmts = document.querySelectorAll(".preview-wrap");
            Array.prototype.forEach.call(elmts, (elmt) => {
                elmt.style.width = targetComponent.package.width + "px";
                elmt.style.height = targetComponent.package.height + "px";
                elmt.style.border = "2px solid black";
            });

            $scope.app.preview.status = false;
            await $timeout();

            $('iframe.preview').attr('src', url);
            $('iframe.preview').on('load', async () => {
                $scope.app.preview.status = true;
                await $timeout();
            });
        }

        $scope.app.component = {
            add: async () => {
                const componentName = $scope.modal.add_component_name;
                const componentList = $scope.browse.data.map(comp => comp.package.component);
                if (componentList.includes(componentName)) {
                    toastr.error("Duplicate Component Name");
                    return;
                }
                const { code, data } = await API.create(
                    componentName,
                    {
                        package: {
                            id: "",
                            component: componentName,
                            viewcomponent: "",
                            width: 300,
                            height: 400,
                        },
                        react: "",
                        scss: "",
                        dic: "{}",
                        api: "",
                    });
                if(code !== 200) {
                    toastr.error(data);
                    return;
                }
                $('#modal-add-component').modal('hide');
                location.href = `/app/develop/editor/${componentName}`
            },
            delete: async () => {

            },
        }
    }

    BUILDER.app.editor = async () => {
        $scope.app.editor = {};
        $scope.app.editor.cache = {};
        $scope.app.editor.properties = {};
        $scope.app.editor.code = {};

        $scope.app.editor.code.list = CODELIST;

        $scope.app.editor.code.dic = {};
        $scope.app.editor.code.dic.add = async (lang) => {
            if (!lang || lang.length < 2) {
                toastr.error("at least 2 char");
                return;
            }
            lang = lang.toLowerCase();
            $scope.app.data.dic[lang] = "{}";
            $('#modal-add-language').modal('hide');
            await $timeout();
        }

        $scope.app.editor.code.langselect = LANGSELECTOR($scope);

        $scope.app.editor.code.change = async (targettab, view) => {
            if (view) {
                $scope.configuration.tab[targettab + '_val'] = view;
                await $timeout();

                if (view == 'preview') {
                    $scope.app.preview();
                    return;
                }

                if (view == 'debug') {
                    return;
                };

                let language = $scope.app.editor.properties[targettab].language = await $scope.app.editor.code.langselect(targettab);

                if ($scope.app.editor.cache[targettab]) {
                    let model = $scope.app.editor.cache[targettab].getModel();
                    monaco.editor.setModelLanguage(model, language);

                    $scope.app.editor.cache[targettab].focus();
                }
            } else {
                if ($scope.app.tab.activetab != targettab) {
                    $scope.app.tab.activetab = targettab;
                    await $timeout();
                    await $timeout(500);
                    $scope.app.editor.cache[targettab].focus();
                }
            }
        }

        $scope.app.editor.code.prev = async () => {
            if (!$scope.layout.accessable_tab) return;
            let tab = 'tab1';
            if ($scope.app.tab.activetab) tab = $scope.app.tab.activetab;

            tab = $scope.layout.accessable_tab.indexOf(tab) - 1;
            if (tab < 0) tab = $scope.layout.accessable_tab.length - 1;
            tab = $scope.layout.accessable_tab[tab];
            let view = $scope.configuration.tab[tab + '_val']

            while (view == 'preview') {
                tab = $scope.layout.accessable_tab.indexOf(tab) - 1;
                if (tab < 0) tab = $scope.layout.accessable_tab.length - 1;
                tab = $scope.layout.accessable_tab[tab];
                view = $scope.configuration.tab[tab + '_val']
            }

            $scope.app.editor.code.change(tab);
            $scope.app.editor.cache[tab].focus();
        }

        $scope.app.editor.code.next = async () => {
            if (!$scope.layout.accessable_tab) return;
            let tab = 'tab1';
            if ($scope.app.tab.activetab) tab = $scope.app.tab.activetab;

            tab = $scope.layout.accessable_tab.indexOf(tab) + 1;
            tab = tab % $scope.layout.accessable_tab.length;
            tab = $scope.layout.accessable_tab[tab];
            let view = $scope.configuration.tab[tab + '_val']

            while (view == 'preview') {
                tab = $scope.layout.accessable_tab.indexOf(tab) + 1;
                tab = tab % $scope.layout.accessable_tab.length;
                tab = $scope.layout.accessable_tab[tab];
                view = $scope.configuration.tab[tab + '_val']
            }

            $scope.app.editor.code.change(tab);
            $scope.app.editor.cache[tab].focus();
        }

        $scope.app.editor.build = async () => {
            $scope.app.editor.viewstate = false;
            await $timeout();

            $scope.app.editor.properties.tab1 = $scope.monaco(await $scope.app.editor.code.langselect('tab1'));
            $scope.app.editor.properties.tab2 = $scope.monaco(await $scope.app.editor.code.langselect('tab2'));
            $scope.app.editor.properties.tab3 = $scope.monaco(await $scope.app.editor.code.langselect('tab3'));

            let bindonload = async (targettab) => {
                $scope.app.editor.properties[targettab].onLoad = async (editor) => {
                    await $scope.plugin.editor.build(targettab, editor);
                    $scope.app.editor.cache[targettab] = editor;
                }
            }

            for (let i = 1; i <= 3; i++)
                bindonload('tab' + i);

            $scope.app.editor.viewstate = true;
            await $timeout();
        }
    }

    BUILDER.browse = async () => {
        $scope.browse.load = async () => {
            let res = await API.search();
            $scope.browse.data = res.data;
            $scope.browse.cache = [];

            for (var i = 0; i < $scope.browse.data.length; i++) {
                $scope.browse.cache.push($scope.browse.data[i].package.id);
                if ($scope.browse.data[i].package.id == $scope.app.id) {
                    $scope.browse.item = $scope.browse.data[i];
                }
            }

            await $timeout();
        }

        $scope.browse.select = async (item) => {
            $scope.browse.item = item;
            await $scope.app.load(item.package.component);
        }

        $scope.browse.search = async (val) => {
            val = val.toLowerCase();
            for (var i = 0; i < $scope.browse.data.length; i++) {
                let searchindex = ['component'];
                $scope.browse.data[i].hide = true;
                for (let j = 0; j < searchindex.length; j++) {
                    try {
                        let key = searchindex[j];
                        let keyv = $scope.browse.data[i].package[key].toLowerCase();
                        if (keyv.includes(val)) {
                            $scope.browse.data[i].hide = false;
                            break;
                        }
                    } catch (e) {
                    }
                }
                if (val.length == 0)
                    $scope.browse.data[i].hide = false;
            }

            await $timeout();
        }
    }

    BUILDER.shortcuts = async () => {
        $scope.shortcut.configuration = (monaco) => {
            return {
                'tab_toggle': {
                    key: 'Alt Tab',
                    monaco: monaco.KeyMod.Alt | monaco.KeyCode.TAB,
                    fn: async () => {
                        await $scope.workspace.toggle();
                    }
                },
                'editor_prev': {
                    monaco: monaco.KeyMod.Alt | monaco.KeyCode.KEY_A,
                    fn: async () => {
                        let targettab = $scope.app.tab.activetab;
                        var prev = TABS.indexOf($scope.configuration.tab[targettab + "_val"]) - 1;
                        if (prev < 0) prev = TABS[TABS.length - 1];
                        else prev = TABS[prev];

                        if (prev == 'preview') {
                            prev = TABS.indexOf(prev) - 1;
                            if (prev < 0) prev = TABS[TABS.length - 1];
                            else prev = TABS[prev];
                        }

                        await $scope.app.editor.code.change(targettab, prev);
                        await $scope.shortcut.bind();
                    }
                },
                'editor_next': {
                    monaco: monaco.KeyMod.Alt | monaco.KeyCode.KEY_S,
                    fn: async () => {
                        let targettab = $scope.app.tab.activetab;
                        var next = TABS[(TABS.indexOf($scope.configuration.tab[targettab + "_val"]) + 1) % TABS.length];
                        if (next == 'preview') {
                            next = TABS[(TABS.indexOf(next) + 1) % TABS.length];
                        }
                        await $scope.app.editor.code.change(targettab, next);
                        await $scope.shortcut.bind();
                    }
                },
                'workspace_prev': {
                    key: 'Alt KeyZ',
                    monaco: monaco.KeyMod.Alt | monaco.KeyCode.KEY_Z,
                    fn: async () => {
                        await $scope.app.editor.code.prev();
                    }
                },
                'workspace_next': {
                    key: 'Alt KeyX',
                    monaco: monaco.KeyMod.Alt | monaco.KeyCode.KEY_X,
                    fn: async () => {
                        await $scope.app.editor.code.next();
                    }
                },
                'search': {
                    key: 'Alt KeyF',
                    monaco: monaco.KeyMod.Alt | monaco.KeyCode.KEY_F,
                    fn: async () => {
                        await $scope.workspace.toggle(1);
                        $('#search').focus();
                    }
                },
                'save': {
                    key: 'Ctrl KeyS',
                    monaco: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S,
                    fn: async () => {
                        await $scope.app.save();
                    }
                },
            }
        };

        $scope.event = {
            save: async (e) => {
                const {metaKey, ctrlKey, key} = e;
                const isMacLike = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
                const ctrl = isMacLike?metaKey:ctrlKey;
                if (!ctrl) return;
                if(key !== 's') return;
                e.preventDefault();
                await $scope.app.save();
                await $timeout();
            }
        };

        $scope.shortcut.bind = async () => {
            if (!window.monaco) return;
            $(window).unbind();

            let shortcut_opts = {};
            let shortcuts = $scope.shortcut.configuration(window.monaco);
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

    BUILDER.yarn = async () => {
        const load = async () => {
            const { code, data } = await API.package_json();
            if (code !== 200) {
                toastr.error("package.json load FAILED");
                return;
            }
            const { dependencies , devDependencies } = data;
            $scope.yarn.package = {
                dependencies: Object.entries(dependencies),
                devDependencies: Object.entries(devDependencies),
            };
        }

        await load();

        $scope.yarn.add = async () => {
            await $scope.loading.show();
            const { package_name, add_dev } = $scope.yarn;
            const { code } = await API.package_add(package_name, add_dev);
            if (code !== 200) {
                toastr.error(`yarn add ${add_dev?"-D ":""}${package_name} FAILED`);
                return;
            }
            await load();
            await $timeout();
            await $scope.loading.hide();
        }

        $scope.yarn.remove = async (package_name, parent) => {
            await $scope.loading.show();
            const add_dev = parent === "devDependencies";
            const { code } = await API.package_remove(package_name, add_dev);
            if (code !== 200) {
                toastr.error(`yarn remove ${add_dev?"-D ":""}${package_name} FAILED`);
                return;
            }
            await load();
            await $timeout();
            await $scope.loading.hide();
        }

        await $timeout();
    }


    await BUILDER.loading();
    await BUILDER.layout();
    await BUILDER.plugin();
    await BUILDER.modal();
    await BUILDER.workspace();
    await BUILDER.app.base();
    await BUILDER.app.editor();
    await BUILDER.browse();
    await BUILDER.shortcuts();
    await BUILDER.yarn();

    let init = async () => {
        $scope.mode = "app";
        await $scope.browse.load();
        await $scope.app.load(COMPONENT);
        await $timeout();
        // $scope.modal.yarn("hide");

        // $scope.import_file = function () {
        //     $('#import-file').click();
        // }

        // $('#import-file').change(async () => {
        //     let fr = new FileReader();
        //     fr.onload = async () => {
        //         let data = fr.result;
        //         data = JSON.parse(data);

        //         for (let key in data.dic) {
        //             data.dic[key] = JSON.stringify(data.dic[key]);
        //         }

        //         $scope.app.data.api = data.api;
        //         $scope.app.data.scss = data.scss;
        //         $scope.app.data.dic = data.dic;
        //         $scope.app.data.react = data.react;
        //         $scope.app.data.package.component = getComponentName();
        //         $scope.app.data.package.properties = data.package.properties;
        //         $scope.app.data.package.viewcomponent = data.package.viewcomponent;

        //         await $timeout();
        //     };
        //     fr.readAsText($('#import-file').prop('files')[0]);
        // });

    }

    init();
}