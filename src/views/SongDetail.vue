<template>
    <section class="section-song-detail">
        <div class="song-detail-background" :style="'background-image: url(' + cover + '), url(' + require('@/assets/img/defaultAlbumArt.jpg') + ');'" v-if="apiFinished">
            <div class="song-detail-dim">
                <div class="song-detail">
                    <div class="song-cover" :style="'background-image: url(' + cover + '), url(' + require('@/assets/img/defaultAlbumArt.jpg') + ');'"></div>
                        <div class="song-meta-data">
                        <div class="song-title">{{ title }}</div>
                        <div class="song-subtitle">{{ subtitle }}</div>
                        <div class="song-artist">{{ artist }}</div>
                        <div class="song-charter">{{ $t('songdetail.createdBy') + charter }}</div>
                        <div class="song-tags">
                            <router-link class="tag" v-for="tag in tags" v-bind:key="tag" :to="{ name: 'Search', params: { searchQuery: tag } }">{{ tag }}</router-link>
                        </div>
                        <div class="song-difficulties">
                            <img src="@/assets/img/difficultyEasy.svg" :class="hasEasyDifficulty ? 'active' : ''" />
                            <img src="@/assets/img/difficultyNormal.svg" :class="hasNormalDifficulty ? 'active' : ''" />
                            <img src="@/assets/img/difficultyHard.svg" :class="hasHardDifficulty ? 'active' : ''" />
                            <img src="@/assets/img/difficultyExtreme.svg" :class="hasExtremeDifficulty ? 'active' : ''" />
                            <img src="@/assets/img/difficultyXD.svg" :class="hasXDDifficulty ? 'active' : ''" />
                        </div>
                        <div class="song-uploader">
                            <UserItem v-bind="uploader" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="song-detail-actions" v-if="apiFinished">
            <button class="button-download button button-primary" v-on:click="AddToQueue()">{{ $t('songdetail.actions.downloadButton') }}</button>
            <button class="button-preview button" v-on:click="PlayPreview()">{{ $t('songdetail.actions.playPreviewButton') }}</button>
            <button class="button-copylink button" v-on:click="CopyLink()">{{ $t('songdetail.actions.copyLinkButton') }}</button>
            <button class="button-report button" v-on:click="OpenReport()">{{ $t('songdetail.actions.reportButton') }}</button>
        </div>

        <Loading v-if="!apiFinished" />
    </section>
</template>

<script>
    import { remote } from 'electron';
    const { clipboard, shell } = remote;

    import SSAPI from '@/modules/module.api.js';
    import UserItem from '@/components/User/UserItem.vue';
    import Loading from '@/components/Loading.vue';

    export default {
        name: 'SongDetail',
        components: {
            UserItem,
            Loading
        },
        data: function() {
            return {
                apiFinished: false,
                id: 0,
                cover: "",
                title: "",
                subtitle: "",
                artist: "",
                charter: "",
                hasEasyDifficulty: false,
                hasNormalDifficulty: false,
                hasHardDifficulty: false,
                hasExtremeDifficulty: false,
                hasXDDifficulty: false,
                tags: [],
                uploader: null,
                previewPath: "",
                downloadPath: ""
            }
        },
        mounted: function() {
            let ssapi = new SSAPI(process.env.NODE_ENV === 'development');

            ssapi.getSongDetail(this.$route.params.id).then((data) => {
                this.$data.id = data.data.id;
                this.$data.cover = data.data.paths.cover;
                this.$data.title = data.data.title;
                this.$data.subtitle = data.data.subtitle;
                this.$data.artist = data.data.artist;
                this.$data.charter = data.data.charter;
                this.$data.hasEasyDifficulty = data.data.hasEasyDifficulty;
                this.$data.hasNormalDifficulty = data.data.hasNormalDifficulty;
                this.$data.hasHardDifficulty = data.data.hasHardDifficulty;
                this.$data.hasExtremeDifficulty = data.data.hasExtremeDifficulty;
                this.$data.hasXDDifficulty = data.data.hasXDDifficulty;
                if(data.data.tags != "") {
                    this.$data.tags = data.data.tags;
                }
                this.$data.previewPath = data.data.paths.ogg;
                this.$data.downloadPath = data.data.paths.zip;

                ssapi.getUserDetail(data.data.uploader).then((data) => {
                    this.$data.uploader = data.data;
                    this.$data.apiFinished = true;
                });
            });
        },
        methods: {
            AddToQueue: function() {
                this.$root.$emit('download', {id: this.$data.id, cover: this.$data.cover, title: this.$data.title, artist: this.$data.artist, downloadPath: this.$data.downloadPath});
            },
            PlayPreview: function() {

            },
            CopyLink: function() {
                clipboard.writeText("https://spinsha.re/song/" + this.$data.id);
            },
            OpenReport: function() {
                shell.openExternal("https://spinsha.re/report/song/" + this.$data.id);
            }
        }
    }
</script>

<style scoped lang="less">
    .section-song-detail {
        & .song-detail-background {
            background-size: cover;
            background-position: center;

            & .song-detail-dim {
                backdrop-filter: blur(10px);
                background: linear-gradient(180deg, rgba(0,0,0,0.4), #212629);

                & .song-detail {
                    padding: 50px;
                    display: grid;
                    grid-template-columns: 200px 1fr;
                    grid-gap: 25px;

                    & .song-cover {
                        width: 200px;
                        height: 200px;
                        align-self: center;
                        background: #eee;
                        border-radius: 6px;
                        background-size: cover;
                        background-position: center;
                    }
                    & .song-meta-data {
                        & .song-title {
                            font-weight: bold;
                            font-size: 48px;
                            word-break: break-all;
                        }
                        & .song-subtitle {
                            font-size: 20px;
                            word-break: break-all;
                        }
                        & .song-artist {
                            margin-top: 5px;
                            font-size: 18px;
                            word-break: break-all;
                        }
                        & .song-charter {
                            margin-top: 10px;
                            font-size: 14px;
                            opacity: 0.6;
                            word-break: break-all;
                        }
                        & .song-tags {
                            margin-top: 10px;

                            & .tag {
                                display: inline-block;
                                font-size: 12px;
                                font-weight: bold;
                                color: #222;
                                background: #fff;
                                padding: 5px 20px;
                                border-radius: 50px;
                                margin-right: 10px;
                                margin-top: 5px;
                                text-decoration: none;
                                word-break: break-all;
                                transition: 0.2s ease-in-out all;

                                &:hover {
                                    opacity: 0.6;
                                    cursor: pointer;
                                }
                            }
                        }

                        & .song-difficulties {
                            margin-top: 15px;
                            height: 20px;
                            display: flex;
                
                            & img {
                                height: 20px;
                                margin-right: 10px;
                                opacity: 0.3;
                
                                &.active {
                                    opacity: 1;
                                }
                            }
                        }

                        & .song-uploader {
                            margin-top: 15px;
                            display: flex;

                            & .user-item {
                                width: auto;
                                padding-right: 15px;
                            }
                        }
                    }
                }
            }
        }
        & .song-detail-actions {
            padding: 50px;
            padding-top: 0px;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            grid-gap: 25px;

            & .button {
                padding: 15px 0px;
                font-size: 16px;
                transition: 0.2s ease-in-out all, 0.1s ease-in-out transform;

                &.button-primary {
                    background: #fff;
                    color: #222;

                    &:hover {
                        background: #fff;
                        color: #222;
                    }
                }

                &:hover {
                    background: rgba(255,255,255,0.2);
                    color: #fff;
                    opacity: 0.6;
                    transform: translateY(-4px);
                }
                &:active {
                    transform: translateY(-2px);
                }
            }
        }
    }
</style>