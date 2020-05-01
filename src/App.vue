<template>
    <div id="app" tabindex="-1" v-on:keydown.esc="closeOverlays()">
        <main>
            <Navigation v-bind:downloadQueueCount="downloadQueue.length" v-bind:downloadOverlayShown="showDownloadOverlay" />
            <router-view />
        </main>

        <ContextMenu></ContextMenu>

        <transition name="fade">
            <UpdateOverlay v-if="showUpdateOverlay" v-bind:isAvailable="isUpdateAvailable"></UpdateOverlay>
        </transition>
        
        <transition name="slideDownloadOverlay">
            <DownloadOverlay v-if="showDownloadOverlay" v-bind:downloadQueue="downloadQueue"></DownloadOverlay>
        </transition>
    </div>
</template>

<script>
    import { remote, ipcRenderer } from 'electron';
    const { app, dialog } = remote;

    import fs from 'fs';
    import glob from 'glob';
    import path from 'path';
    import ncp from 'ncp';

    import UserSettings from '@/modules/module.usersettings.js';
    import SSAPI from '@/modules/module.api.js';
    import SRXD from '@/modules/module.srxd.js';

    import Navigation from '@/components/Navigation/Navigation.vue';
    import ContextMenu from '@/components/ContextMenu/ContextMenu.vue';
    import UpdateOverlay from '@/components/Overlays/UpdateOverlay.vue';
    import DownloadOverlay from '@/components/Overlays/DownloadOverlay.vue';

    export default {
        name: 'App',
        components: {
            Navigation,
            ContextMenu,
            UpdateOverlay,
            DownloadOverlay
        },
        data: function() {
            return {
                downloadQueue: [],
                downloadQueueProcessing: false,
                showUpdateOverlay: false,
                showDownloadOverlay: false,
                isUpdateAvailable: false
            }
        },
        mounted: function() {
            this.$root.$on('download', (url) => {
                this.addToQueue(url);
            });
            this.$root.$on('showDownloadOverlay', () => {
                this.$data.showDownloadOverlay = true;
            });
            this.$root.$on('toggleDownloadOverlay', () => {
                this.$data.showDownloadOverlay = !this.$data.showDownloadOverlay;
            });
            this.$root.$on('hideDownloadOverlay', () => {
                this.$data.showDownloadOverlay = false;
            });

            this.$root.$on('showUpdateOverlay', (isAvailable) => {
                this.$data.showUpdateOverlay = true;
                this.$data.isUpdateAvailable = isAvailable;
            });
            this.$root.$on('hideUpdateOverlay', () => {
                this.$data.showUpdateOverlay = false;
                this.$data.isUpdateAvailable = false;
            });

            let ssapi = new SSAPI(process.env.NODE_ENV === 'development');

            ssapi.getLatestVersion().then((data) => {
                if(data.stringVersion != app.getVersion() && process.env.NODE_ENV !== 'development') {
                    this.$data.showUpdateOverlay = true;
                    this.$data.isUpdateAvailable = true;
                }
            });

            ipcRenderer.on("download-complete", (event, downloadItem) => {
                let srxdControl = new SRXD();
                let userSettings = new UserSettings();

                srxdControl.extractBackup(downloadItem.downloadPath, path.basename(downloadItem.downloadPath)).then((extractResult) => {
                    if(extractResult) {
                        this.installBackup(extractResult, userSettings.get('gameDirectory')).then((result) => {
                            this.$data.downloadQueueProcessing = false;
                            console.log("Queue Remaining: " + this.$data.downloadQueue.length);
                    
                            this.$data.downloadQueue.splice(this.$data.downloadQueue.findIndex(function(i) {
                                return i.id === downloadItem.id;
                            }), 1);

                            if(this.$data.downloadQueue.length > 0) {
                                this.processQueue();
                            }
                        }).catch(error => {
                            console.error(error);
                        });
                    } else {
                        console.error("Backup could not be loaded!");
                    }
                }).catch(error => {
                    console.error(error);
                });
            });
        },
        methods: {
            addToQueue: function(url) {
                this.$data.downloadQueue.push(url);
                if(!this.$data.downloadQueueProcessing) {
                    this.processQueue();
                }
            },
            processQueue: function() {
                this.$data.downloadQueueProcessing = true;

                if(this.$data.downloadQueue.length > 0) {
                    let downloadItem = this.$data.downloadQueue[0];

                    ipcRenderer.send("download", {
                        queueItem: downloadItem
                    });
                }
            },
            closeOverlays: function() {
                this.$data.showUpdateOverlay = false;
                this.$data.showDownloadOverlay = false;
            },
            installBackup: async function(backupLocation, gameDirLocation) {
                await ncp(backupLocation, gameDirLocation, function(error) {
                    if(error) {
                        console.error(error);
                        console.error("Couldn't copy backup!");
                        return true;
                    }
                
                    console.log("Copied Backup!");
                });

                return true;
            }
        }
    }
</script>

<style lang="less">
    html {
        box-sizing: border-box;
        -webkit-user-select: none;
    }
    *, *:before, *:after {
        box-sizing: inherit;
    }
    html {
        width: 100%;
        height: 100%;
    }
    body {
        width: 100%;
        height: 100%;
        margin: 0;
        background: #212629;
        color: #fff;
        overflow-x: hidden;
        font-family: 'Open Sans', sans-serif;
        font-size: 14px;
    }
    ::-webkit-scrollbar {
        background: #212529;
        width: 5px;
    }
    ::-webkit-scrollbar-thumb {
        background: #fff;
    }
    a {  text-decoration: none; }
    #app:focus {
        outline: none;
    }
    main {
        display: grid;
        margin-left: 60px;
        min-height: 100vh;
        overflow-y: scroll;
    }
    section {
        &.section-library {
            padding: 50px;
        }
    }
    button, .button {
        font-family: 'Open Sans', sans-serif;
        font-size: 12px;
        color: #fff;
        background: rgba(255,255,255,0.2);
        text-transform: uppercase;
        font-weight: 700;
        border-radius: 4px;
        padding: 7px 14px;
        border: 0px;
        transition: 0.2s ease-in-out all;

        &:hover {
            background: #fff;
            color: #222;
            cursor: pointer;
        }
        &:focus {
            outline: 0;
        }

        &.button-label {
            background: transparent;

            &:hover {
                background: rgba(255, 255, 255, 0.2);
                color: #fff;
            }
            &:active {
                background: #fff;
                color: #222;
                cursor: pointer;
            }
        }
    }
    .fade-enter-active, .fade-leave-active {
        transition: opacity .2s;
    }
    .fade-enter, .fade-leave-to {
        opacity: 0;
    }
    .slideDownloadOverlay-enter-active, .slideDownloadOverlay-leave-active {
        transform: translateX(0px);
        transition: transform .5s;
    }
    .slideDownloadOverlay-enter, .slideDownloadOverlay-leave-to {
        transform: translateX(-400px);
    }
</style>
