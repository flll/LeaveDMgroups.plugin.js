/**
 * @name LeaveDMgroups
 * @author lll
 * @description DMとグループDM削除機能付き！ｗ。右上にDMってボタンが出るよ
 * @version 1.0.0
 */

const config = {
    info: {
        name: "LeaveDMgroups",
        authors: [
            {
                name: "lll"
            }
        ],
        version: "1.0.0",
        description: "DMとグループDM削除機能付き"
    },
    changelog: [
        {
            title: "latest",
            items: [
                "DMとグループDM削除機能付き"
            ]
        }
    ]
};

module.exports = class LeaveDMgroups {
    constructor() {
        this.initialized = false;
    }

    start() {
        this.initialized = true;
        
        BdApi.injectCSS("dm-logger-css", `
            .dm-logger-floating-button {
                position: fixed;
                top: 10px;
                right: 20px;
                background-color: #5865F2;
                color: white;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 9999;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                font-weight: bold;
                font-size: 14px;
            }
            .dm-logger-floating-button:hover {
                background-color: #4752C4;
            }
            .dm-channel-item {
                margin: 5px 0;
                padding: 10px 12px;
                background-color: white;
                color: #000;
                border-radius: 8px;
                cursor: pointer;
                user-select: text;
                transition: background-color 0.15s ease;
            }
            .dm-channel-item:hover {
                background-color: #f0f0f0;
            }
            .dm-channel-text {
                user-select: text;
                -webkit-user-select: text;
                -moz-user-select: text;
                -ms-user-select: text;
            }
            .dm-regex-input {
                padding: 12px;
                margin-right: 10px;
                border-radius: 6px;
                border: 1px solid #b9bbbe;
                background-color: white;
                color: #000;
                flex-grow: 1;
                font-size: 14px;
                transition: border-color 0.2s ease, box-shadow 0.2s ease;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }
            .dm-regex-input:focus {
                border-color: #7289da;
                outline: none;
                box-shadow: 0 2px 8px rgba(114, 137, 218, 0.3);
            }
            .dm-filter-bar {
                display: flex;
                margin-bottom: 16px;
                align-items: center;
            }
            .dm-filter-label {
                margin-right: 12px;
                color: white;
                font-size: 14px;
                font-weight: 500;
            }
            .dm-filter-example {
                margin-top: 8px;
                font-size: 12px;
                color: #b9bbbe;
                margin-bottom: 16px;
                line-height: 1.5;
            }
            .dm-search-results {
                color: white;
                margin-bottom: 14px;
                font-weight: 500;
                padding: 4px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .dm-filter-container {
                position: sticky;
                top: 0;
                background-color: #36393f;
                padding: 15px 15px 5px 15px;
                z-index: 10;
                border-radius: 8px 8px 0 0;
            }
            .dm-results-container {
                overflow-y: auto;
                max-height: 400px;
                padding: 0 5px 5px 5px;
            }
            .bd-modal-wrapper .bd-modal {
                min-width: 600px !important;
            }
            .dm-leave-button {
                background-color: #ed4245;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 6px 12px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: background-color 0.2s ease;
                opacity: 0.5;
                pointer-events: none;
            }
            .dm-leave-button.active {
                opacity: 1;
                pointer-events: auto;
            }
            .dm-leave-button:hover {
                background-color: #c03537;
            }
            .dm-progress-log {
                margin-top: 20px;
                padding: 15px;
                background-color: #2f3136;
                border-radius: 8px;
                color: white;
                max-height: 300px;
                overflow-y: auto;
            }
            .dm-progress-item {
                margin-bottom: 6px;
                padding-bottom: 6px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            .dm-progress-item.success {
                color: #43b581;
            }
            .dm-progress-item.error {
                color: #ed4245;
            }
            .dm-progress-item.info {
                color: #7289da;
            }
            .dm-progress-actions {
                margin-top: 15px;
                display: flex;
                justify-content: center;
            }
            .dm-progress-button {
                background-color: #4f545c;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 8px 16px;
                margin: 0 8px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: background-color 0.2s ease;
            }
            .dm-progress-button:hover {
                background-color: #5d6269;
            }
            .dm-progress-button.cancel {
                background-color: #ed4245;
            }
            .dm-progress-button.cancel:hover {
                background-color: #c03537;
            }
        `);
        
        this.addFloatingButton();
    }
    
    addFloatingButton() {
        const button = document.createElement("div");
        button.className = "dm-logger-floating-button";
        button.textContent = "DM";
        button.addEventListener("click", () => this.showDMChannelsModal());
        document.body.appendChild(button);
        this.buttonElement = button;
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async leaveChannel(channelId) {
        try {
            const PrivateChannelModule = BdApi.findModule(m => m.closePrivateChannel);
            
            if (PrivateChannelModule && PrivateChannelModule.closePrivateChannel) {
                await PrivateChannelModule.closePrivateChannel(channelId);
                return true;
            }
            
            const ChannelStore = BdApi.findModule(m => m.getChannel && m.getDMUserIds);
            const channel = ChannelStore ? ChannelStore.getChannel(channelId) : null;
            
            if (!channel) return false;
            
            if (channel.type === 1) {
                const RelationshipModule = BdApi.findModule(m => m.removeRelationship);
                if (RelationshipModule && channel.recipients && channel.recipients.length > 0) {
                    await RelationshipModule.removeRelationship(channel.recipients[0]);
                    return true;
                }
            } else if (channel.type === 3) {
                const GroupModule = BdApi.findModule(m => m.leaveGroup);
                if (GroupModule) {
                    await GroupModule.leaveGroup(channelId);
                    return true;
                }
            }
            
            return false;
        } catch (e) {
            return false;
        }
    }
    
    async leaveMultipleChannels(channels, callback) {
        const logs = [];
        let canceled = false;
        
        for (let i = 0; i < channels.length; i++) {
            if (canceled) break;
            
            const channel = channels[i];
            logs.push({
                status: "info",
                message: `${channel.name} を退出中...`
            });
            
            callback(logs, i, channels.length, () => {
                canceled = true;
            });
            
            const success = await this.leaveChannel(channel.id);
            
            if (success) {
                logs.push({
                    status: "success",
                    message: `${channel.name} を退出しました`
                });
            } else {
                logs.push({
                    status: "error",
                    message: `${channel.name} の退出に失敗しました`
                });
            }
            
            callback(logs, i + 1, channels.length, () => {
                canceled = true;
            });
            
            await this.sleep(1500);
        }
        
        return { logs, canceled };
    }
    
    showDirectProgressLog(channels, regexFilter) {
        const React = BdApi.React;
        
        const ProgressLog = () => {
            const [logs, setLogs] = React.useState([]);
            
            React.useEffect(() => {
                (async () => {
                    let currentLogs = [];
                    let canceled = false;
                    
                    const updateLogs = (newLogs) => {
                        currentLogs = [...newLogs];
                        setLogs([...currentLogs]);
                    };
                    
                    for (let i = 0; i < channels.length; i++) {
                        if (canceled) break;
                        
                        const channel = channels[i];
                        currentLogs.push({
                            status: "info",
                            message: `${channel.name} を退出中...`
                        });
                        updateLogs(currentLogs);
                        
                        const success = await this.leaveChannel(channel.id);
                        
                        if (success) {
                            currentLogs.push({
                                status: "success",
                                message: `${channel.name} を退出しました`
                            });
                        } else {
                            currentLogs.push({
                                status: "error",
                                message: `${channel.name} の退出に失敗しました`
                            });
                        }
                        updateLogs(currentLogs);
                        
                        await this.sleep(1500);
                    }
                    
                    currentLogs.push({
                        status: "info",
                        message: `処理が完了しました (${channels.length}件中)`
                    });
                    updateLogs(currentLogs);
                })();
            }, []);
            
            return React.createElement("div", {
                style: { margin: "10px" }
            }, [
                React.createElement("div", {
                    style: {
                        marginBottom: "15px",
                        padding: "10px",
                        backgroundColor: "#2f3136",
                        borderRadius: "8px",
                        color: "white"
                    }
                }, `適用中のフィルター: ${regexFilter || "なし"}`),
                
                React.createElement("div", {
                    style: {
                        marginBottom: "10px",
                        color: "white",
                    }
                }, `${logs.length > 0 ? "処理中..." : "準備中..."}`),
                
                React.createElement("div", {
                    className: "dm-progress-log"
                }, logs.map((log, index) => 
                    React.createElement("div", {
                        className: `dm-progress-item ${log.status}`,
                        key: index
                    }, log.message)
                ))
            ]);
        };
        
        BdApi.showConfirmationModal("DM退出処理", 
            React.createElement(ProgressLog),
            {
                confirmText: "閉じる",
                cancelText: "",
                onConfirm: () => {}
            }
        );
    }
    
    showDMChannelsModal() {
        const ChannelStore = BdApi.findModuleByProps("getChannel", "getDMUserIds");
        const UserStore = BdApi.findModuleByProps("getUser", "getUsers");
        
        const dmUserIds = ChannelStore.getDMUserIds();
        const dmChannels = [];
        
        dmUserIds.forEach(userId => {
            const user = UserStore.getUser(userId);
            if (user) {
                const dmChannelId = ChannelStore.getDMFromUserId(userId);
                dmChannels.push({
                    id: dmChannelId,
                    name: user.username,
                    type: 'dm'
                });
            }
        });
        
        const groupDMs = ChannelStore.getSortedPrivateChannels().filter(c => c.type === 3);
        groupDMs.forEach(group => {
            dmChannels.push({
                id: group.id,
                name: group.name || group.recipients.map(id => UserStore.getUser(id)?.username).filter(Boolean).join(', '),
                type: 'group'
            });
        });

        const React = BdApi.React;
        const plugin = this;
        
        class DMChannelList extends React.Component {
            constructor(props) {
                super(props);
                this.state = {
                    regexFilter: "",
                    filteredChannels: dmChannels
                };
                this.inputRef = React.createRef();
                this.plugin = props.plugin;
            }
            
            componentDidMount() {
                if (this.inputRef.current) {
                    setTimeout(() => this.inputRef.current.focus(), 100);
                }
            }
            
            applyFilter(value) {
                try {
                    if (!value.trim()) {
                        this.setState({
                            regexFilter: value,
                            filteredChannels: dmChannels
                        });
                        return;
                    }
                    
                    const regex = new RegExp(value, 'i');
                    const filtered = dmChannels.filter(channel => 
                        regex.test(channel.name) || regex.test(channel.id)
                    );
                    
                    this.setState({
                        regexFilter: value,
                        filteredChannels: filtered
                    });
                } catch (e) {}
            }
            
            confirmLeave() {
                const modal = BdApi.showConfirmationModal(
                    "DMチャンネルの退出",
                    `フィルターに一致する ${this.state.filteredChannels.length} 件のDMチャンネルを退出しますか？`,
                    {
                        danger: true,
                        confirmText: "退出する",
                        cancelText: "キャンセル",
                        onConfirm: () => {
                            const channelsToLeave = [...this.state.filteredChannels];
                            const regexFilterValue = this.state.regexFilter;
                            
                            setTimeout(() => {
                                this.plugin.showDirectProgressLog(channelsToLeave, regexFilterValue);
                            }, 100);
                        }
                    }
                );
            }
            
            render() {
                const dmChannelElements = this.state.filteredChannels.map((channel, index) => {
                    return React.createElement("div", {
                        className: "dm-channel-item",
                        key: index
                    }, React.createElement("span", {
                        className: "dm-channel-text"
                    }, `${channel.name} (${channel.id})`));
                });
                
                const filterBar = React.createElement("div", { className: "dm-filter-bar" }, [
                    React.createElement("span", { className: "dm-filter-label" }, "正規表現フィルター:"),
                    React.createElement("input", {
                        type: "text",
                        className: "dm-regex-input",
                        placeholder: "例: ^a.*|123$",
                        value: this.state.regexFilter,
                        onChange: (e) => this.applyFilter(e.target.value),
                        ref: this.inputRef
                    })
                ]);
                
                const filterExample = React.createElement("div", { className: "dm-filter-example" }, [
                    "例: ^a → aで始まるユーザー",
                    React.createElement("br"),
                    "例: 123$ → IDが123で終わるチャンネル",
                    React.createElement("br"),
                    "例: user|group → 'user'または'group'を含む"
                ]);
                
                const searchResults = React.createElement("div", { 
                    className: "dm-search-results" 
                }, [
                    React.createElement("span", {}, `検索結果: ${this.state.filteredChannels.length}件`),
                    React.createElement("button", {
                        className: `dm-leave-button ${this.state.filteredChannels.length > 0 && this.state.regexFilter ? "active" : ""}`,
                        onClick: () => this.confirmLeave(),
                        disabled: !(this.state.filteredChannels.length > 0 && this.state.regexFilter)
                    }, "退出")
                ]);
                
                return React.createElement("div", {
                    style: {
                        margin: "10px"
                    }
                }, [
                    React.createElement("div", {
                        className: "dm-filter-container"
                    }, [
                        filterBar,
                        filterExample,
                        searchResults
                    ]),
                    
                    React.createElement("div", {
                        className: "dm-results-container"
                    }, dmChannelElements.length > 0 ? dmChannelElements : "一致するDMチャンネルはありません")
                ]);
            }
        }
        
        const modalContent = React.createElement(DMChannelList, {
            plugin: this
        });
        
        BdApi.showConfirmationModal("DM一覧", modalContent, {
            confirmText: "閉じる",
            cancelText: "",
            onConfirm: () => {}
        });
    }

    stop() {
        BdApi.clearCSS("dm-logger-css");
        
        if (this.buttonElement && this.buttonElement.parentNode) {
            this.buttonElement.parentNode.removeChild(this.buttonElement);
        }
        
        this.initialized = false;
    }
} 
