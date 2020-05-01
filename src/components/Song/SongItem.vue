<template>
    <div class="song-item" v-on:contextmenu="showContextMenu($event)">
        <router-link :to="{ name: 'SongDetail', params: { id: id } }">
                <div class="song-cover" :style="'background-image: url(' + cover + '), url(' + require('@/assets/img/defaultAlbumArt.jpg') + ');'">
                    <div class="song-charter-info">
                        <div class="song-charter"><i class="mdi mdi-account-circle"></i><span>{{ charter }}</span></div>
                    </div>
                </div>
                <div class="song-metadata">
                    <div class="song-title">{{ title }}</div>
                    <div class="song-artist">{{ artist }}</div>
                    <div class="song-difficulties">
                        <img src="@/assets/img/difficultyEasy.svg" :class="hasEasyDifficulty ? 'active' : ''" />
                        <img src="@/assets/img/difficultyNormal.svg" :class="hasNormalDifficulty ? 'active' : ''" />
                        <img src="@/assets/img/difficultyHard.svg" :class="hasHardDifficulty ? 'active' : ''" />
                        <img src="@/assets/img/difficultyExtreme.svg" :class="hasExtremeDifficulty ? 'active' : ''" />
                        <img src="@/assets/img/difficultyXD.svg" :class="hasXDDifficulty ? 'active' : ''" />
                    </div>
                </div>
        </router-link>
    </div>
</template>

<script>
    import { remote } from 'electron';
    const { clipboard } = remote;

    export default {
        name: 'SongItem',
        props: [
            'id',
            'cover',
            'title',
            'subtitle',
            'artist',
            'charter',
            'hasEasyDifficulty',
            'hasNormalDifficulty',
            'hasHardDifficulty',
            'hasExtremeDifficulty',
            'hasXDDifficulty',
            'zip'
        ],
        data: function() {
            return {
                isContextMenuActive: false
            }
        },
        mounted: function() {
        },
        methods: {
            showContextMenu: function(e) {
                e.preventDefault();

                this.$root.$emit('showContextMenu', {
                    x: e.pageX,
                    y: e.pageY,
                    items: [
                        { icon: "eye", title: "Open", method: () => { this.$router.push({ name: 'SongDetail', params: { id: this.$props.id } }) } },
                        { icon: "link", title: "Copy Link", method: () => { clipboard.writeText('https://spinsha.re/song/' + this.$props.id) } },
                        { icon: "download", title: "Download", method: () => { this.download(); } }
                    ]});
            },
            download: function() {
                this.$root.$emit('download', {id: this.$props.id, cover: this.$props.cover, title: this.$props.title, artist: this.$props.artist, downloadPath: this.$props.zip});
            }
        }
    }
</script>

<style scoped lang="less">
    .song-item {
        background: rgba(255,255,255,0.1);
        transition: 0.2s ease-in-out transform, 0.2s ease-in-out box-shadow;
        overflow: hidden;
        border-radius: 6px;

        & .song-cover {
            background: rgba(255,255,255,0.1);
            background-size: cover;
            width: 100%;
            padding-top: 100%;
            position: relative;
            background-position: center;

            & .song-charter {
                position: absolute;
                color: #fff;
                text-decoration: none;
                top: 0px;
                left: 0px;
                right: 0px;
                bottom: 0px;
                background: linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.8));
                opacity: 0;
                padding: 15px;
                overflow: hidden;
                display: grid;
                transition: 0.2s ease-in-out opacity;
                grid-template-columns: auto 1fr;
                grid-gap: 10px;
                align-items: flex-end;

                & .song-charter-info {
                    display: grid;
                    align-items: center;

                    & .mdi {
                        font-size: 18px;
                    }
                    & span {
                        font-size: 12px;
                        color: transparent;
                        transition: 0.2s ease-in-out color;
                        overflow: hidden;
                        white-space: nowrap;
                    }
                }
            }
        }

        & .song-metadata {
            padding: 15px;
            color: #fff;
            text-decoration: none;

            & .song-title {
                font-weight: bold;
                overflow: hidden;
                white-space: nowrap;
            }
            & .song-artist {
                margin-top: 5px;
                opacity: 0.6;
                overflow: hidden;
                white-space: nowrap;
            }
            & .song-difficulties {
                margin-top: 10px;
                height: 20px;
                display: flex;
    
                & img {
                    height: 18px;
                    margin-right: 10px;
                    opacity: 0.3;
    
                    &.active {
                        opacity: 1;
                    }
                }
            }
        }

        &:hover {
            transform: scale(1.1);
            cursor: pointer;
            box-shadow: 0px 4px 20px 5px rgba(0, 0, 0, 0.4);

            & .song-cover {
                & .song-charter {
                    opacity: 1;
                }
            }
        }
    }
</style>
