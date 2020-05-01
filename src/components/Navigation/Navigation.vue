<template>
    <aside>
        <nav>
            <router-link to="/" exact class="item"><i class="mdi mdi-home-outline"></i></router-link>
            <router-link to="/search" class="item"><i class="mdi mdi-magnify"></i></router-link>
            <router-link to="/library" class="item"><i class="mdi mdi-music-box-multiple-outline"></i></router-link>
            <div v-on:click="openExternal('https://www.patreon.com/spinshare');" class="item"><i class="mdi mdi-patreon"></i></div>
        </nav>

        <nav>
            <div v-on:click="openExternal('steam://run/1058830');" class="item"><i class="mdi mdi-play-outline"></i></div>
            <div v-on:click="showDownloadOverlay();" :class="'item ' + (downloadOverlayShown ? 'router-link-active' : '')">
                <i class="mdi mdi-download-outline"></i>
                <span class="badge" v-show="downloadQueueCount > 0">{{ downloadQueueCount }}</span>
            </div>
            <router-link to="/settings" class="item"><i class="mdi mdi-cog-outline"></i></router-link>
        </nav>
    </aside>
</template>

<script>
    import { remote } from 'electron';
    const { shell } = remote;

    export default {
        name: 'Navigation',
        props: [
            'downloadQueueCount',
            'downloadOverlayShown'
        ],
        methods: {
            showDownloadOverlay: function() {
                this.$root.$emit('toggleDownloadOverlay');
            },
            openExternal: function(url) {
                shell.openExternal(url);
            }
        }
    }
</script>

<style scoped lang="less">
    aside {
        background: #383C3F;
        display: grid;
        position: fixed;
        z-index: 50;
        top: 0px;
        left: 0px;
        bottom: 0px;
        grid-template-rows: 1fr auto;

        & .item, & .external-item {
            width: 60px;
            height: 60px;
            display: flex;
            position: relative;
            justify-content: center;
            align-items: center;
            background: transparent;
            color: #fff;
            transition: 0.2s ease opacity, 0.2s ease background;

            &:hover {
                cursor: pointer;

                & .mdi {
                    opacity: 1;
                }
            }
            &.router-link-active {
                opacity: 1;
                
                &:before {
                    transition: 0.2s ease-in-out opacity;
                    opacity: 1;
                }

                & .mdi {
                    opacity: 1;
                }
            }

            & .mdi {
                font-size: 22px;
                opacity: 0.4;
                position: relative;
                z-index: 2;
            }

            & .badge {
                position: absolute;
                z-index: 3;
                bottom: 5px;
                right: 5px;
                font-size: 12px;
                font-weight: bold;
                padding: 2px 6px;
                border-radius: 5px;
                background: rgba(255,255,255,0.2);
            }

            &:before {
                content: "";
                position: absolute;
                top: 0px;
                left: 0px;
                bottom: 0px;
                right: 0px;
                background: linear-gradient(135deg, #fd2f85, #7a34ec);
                opacity: 0;
                z-index: 0;
            }
        }
    }
</style>
