<template>
    <div class="download-overlay">
        <header>
            <div class="title">
                Download Queue
            </div>
            <div class="icon" v-on:click="close()">
                <i class="mdi mdi-close"></i>
            </div>
        </header>

        <div class="download-list">
            <div class="download-item" v-for="item in downloadQueue">
                <div class="cover" :style="'background-image: url(' + item.cover + '), url(' + require('@/assets/img/defaultAlbumArt.jpg') + ');'"></div>
                <div class="meta">
                    <div class="title">{{ item.title }}</div>
                    <div class="artist">{{ item.artist }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { remote } from 'electron';
    const { shell } = remote;

    export default {
        name: 'DownloadOverlay',
        props: [
            'downloadQueue'
        ],
        data: function() {
            return {
                showUpdateOverlay: false,
                showDownloadManager: false,
                isUpdateAvailable: false
            }
        },
        methods: {
            close() {
                this.$root.$emit('hideDownloadOverlay');
            }
        }
    }
</script>

<style scoped lang="less">
    .download-overlay {
        position: fixed;
        z-index: 10;
        top: 0px;
        bottom: 0px;
        left: 60px;
        width: 400px;
        background: #383C3F;
        display: grid;
        grid-template-rows: auto 1fr;
        grid-gap: 15px;
        box-shadow: 4px 0px 16px rgba(0,0,0,0.3);

        & header {
            padding: 25px;
            padding-bottom: 0px;
            display: grid;
            grid-template-columns: 1fr auto;
            grid-gap: 15px;

            & .title {
                align-self: center;
                letter-spacing: 0.25em;
                font-size: 14px;
                font-weight: bold;
                text-transform: uppercase;
            }
            & .icon {
                font-size: 22px;
                transition: 0.2s ease-in-out opacity;
                
                &:hover {
                    opacity: 0.6;
                    cursor: pointer;
                }
            }
        }

        & .download-list {
            overflow-y: auto;
            padding: 0px 25px;
            margin-bottom: 25px;

            & .download-item {
                display: grid;
                grid-template-columns: 50px 1fr;
                grid-gap: 10px;
                background: rgba(255,255,255,0.1);
                margin-bottom: 5px;
                padding: 10px;
                border-radius: 5px;

                & .cover {
                    width: 50px;
                    height: 50px;
                    background-position: center;
                    background-size: cover;
                    border-radius: 5px;
                }

                & .meta {
                    align-self: center;
                    overflow: hidden;

                    & .title {
                        font-weight: bold;
                        overflow: hidden;
                        white-space: nowrap;
                    }
                    & .artist {
                        margin-top: 5px;
                        opacity: 0.6;
                        overflow: hidden;
                        white-space: nowrap;
                    }
                }
            }
        }
    }
</style>
